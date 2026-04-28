import { useEffect, useMemo, useRef } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { productFirestoreService } from '@/services/productFirestoreService';
import {
  useCartStore,
  type CartReconcileUpdate,
  type LocalCartItem,
} from '@/store/cartStore';
import type { Product } from '@shared/schema';

export type CartIssueSeverity = 'info' | 'warning' | 'critical';

export type CartIssueCode =
  | 'price-increased'
  | 'price-decreased'
  | 'low-stock'
  | 'out-of-stock'
  | 'inactive'
  | 'unavailable';

export interface CartIssue {
  productId: string;
  code: CartIssueCode;
  severity: CartIssueSeverity;
  message: string;
  /** Stored snapshot value at the time of the issue. */
  storedPrice?: number;
  /** Authoritative current value from Firestore. */
  currentPrice?: number;
  /** Live remaining stock (only set when known). */
  availableStock?: number;
}

export interface ValidatedCartItem extends LocalCartItem {
  /** Authoritative price from Firestore, or the stored snapshot if not yet loaded. */
  livePrice: number;
  /** Live stock cap. `null` when unknown (treat as unconstrained-by-stock). */
  liveStock: number | null;
  /** True while the latest product fetch for this item is in flight. */
  isLoading: boolean;
  /** True when the product is no longer purchasable for any reason. */
  isBlocked: boolean;
  issues: CartIssue[];
}

export interface CartValidationResult {
  items: ValidatedCartItem[];
  issues: CartIssue[];
  hasBlockingIssue: boolean;
  isValidating: boolean;
  /** Number of items still being fetched. */
  pendingCount: number;
  /** Live subtotal computed against authoritative prices (`livePrice`). */
  subtotal: number;
  /** Live total item count. */
  itemCount: number;
  /** Force-refresh every cart product against Firestore. */
  refresh: () => Promise<void>;
}

const STALE_TIME_MS = 60_000;
const GC_TIME_MS = 5 * 60_000;
const LOW_STOCK_THRESHOLD = 5;

const buildIssue = (
  productId: string,
  code: CartIssueCode,
  message: string,
  severity: CartIssueSeverity,
  extras: Partial<CartIssue> = {}
): CartIssue => ({ productId, code, severity, message, ...extras });

/**
 * Subscribe each cart item to its authoritative Firestore product document and
 * surface price / stock / availability discrepancies. Persists corrections back
 * to the cart store via `reconcileCart` so the snapshot in localStorage and the
 * mirrored Firestore copy stay in sync with reality.
 */
export function useCartValidation(): CartValidationResult {
  const items = useCartStore((s) => s.items);
  const reconcileCart = useCartStore((s) => s.reconcileCart);
  const queryClient = useQueryClient();

  const queries = useQueries({
    queries: items.map((item) => ({
      queryKey: ['products', 'by-id', item.productId] as const,
      queryFn: () => productFirestoreService.getProductById(item.productId),
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS,
      retry: false,
      refetchOnMount: 'always' as const,
    })),
  });

  const validated = useMemo<ValidatedCartItem[]>(() => {
    return items.map((item, index) => {
      const q = queries[index];
      const product: Product | undefined = q?.data;
      const isLoading = !!q?.isPending;
      const fetchError = !!q?.isError;

      const issues: CartIssue[] = [];
      let livePrice = item.price;
      let liveStock: number | null = null;
      let isBlocked = false;

      if (fetchError) {
        issues.push(
          buildIssue(
            item.productId,
            'unavailable',
            'This item is no longer available and will be removed at checkout.',
            'critical'
          )
        );
        isBlocked = true;
      } else if (product) {
        // The selling price the customer was shown = cost + profit. The cart
        // snapshot already stores this combined value (see ProductCard /
        // ProductDetail addToCart flow), so we MUST compare against the same
        // combined value here, otherwise every cart shows a fake "price
        // dropped" notice and totals don't match the product page.
        livePrice = product.price + (product.profit || 0);

        // `stock` is an OPTIONAL quantity counter that admins can use if they
        // want fine-grained inventory tracking. It defaults to 0 in the form
        // and most products never set it. We must NOT treat `stock === 0` as
        // "out of stock" — the source of truth for purchasability is the
        // `inStock` boolean (Availability toggle in admin). `stock` only
        // matters as a low-stock / quantity-cap signal when admin has set it
        // to a positive number.
        const trackedStock =
          typeof product.stock === 'number' && product.stock > 0
            ? product.stock
            : null;
        liveStock = trackedStock;

        if (product.active === false) {
          issues.push(
            buildIssue(
              item.productId,
              'inactive',
              'This product has been discontinued.',
              'critical'
            )
          );
          isBlocked = true;
        } else if (product.inStock === false) {
          issues.push(
            buildIssue(
              item.productId,
              'out-of-stock',
              'This product is currently out of stock.',
              'critical',
              { availableStock: 0 }
            )
          );
          isBlocked = true;
        } else if (trackedStock !== null && trackedStock < item.quantity) {
          issues.push(
            buildIssue(
              item.productId,
              'low-stock',
              `Only ${trackedStock} left in stock — your quantity will be adjusted.`,
              'warning',
              { availableStock: trackedStock }
            )
          );
        } else if (
          trackedStock !== null &&
          trackedStock <= LOW_STOCK_THRESHOLD &&
          trackedStock >= item.quantity
        ) {
          issues.push(
            buildIssue(
              item.productId,
              'low-stock',
              `Hurry — only ${trackedStock} left in stock.`,
              'info',
              { availableStock: trackedStock }
            )
          );
        }

        const priceDelta = livePrice - item.price;
        if (Math.abs(priceDelta) > 0.0001) {
          if (priceDelta > 0) {
            issues.push(
              buildIssue(
                item.productId,
                'price-increased',
                `Price updated from Rs. ${item.price.toLocaleString()} to Rs. ${livePrice.toLocaleString()}.`,
                'warning',
                { storedPrice: item.price, currentPrice: livePrice }
              )
            );
          } else {
            issues.push(
              buildIssue(
                item.productId,
                'price-decreased',
                `Good news — price dropped to Rs. ${livePrice.toLocaleString()}.`,
                'info',
                { storedPrice: item.price, currentPrice: livePrice }
              )
            );
          }
        }
      }

      return {
        ...item,
        livePrice,
        liveStock,
        isLoading,
        isBlocked,
        issues,
      };
    });
  }, [items, queries]);

  // Flatten issues for aggregate banners.
  const aggregateIssues = useMemo(
    () => validated.flatMap((v) => v.issues),
    [validated]
  );

  const hasBlockingIssue = useMemo(
    () => validated.some((v) => v.isBlocked),
    [validated]
  );

  const subtotal = useMemo(
    () =>
      validated.reduce(
        (sum, v) => (v.isBlocked ? sum : sum + v.livePrice * v.quantity),
        0
      ),
    [validated]
  );

  const itemCount = useMemo(
    () => validated.reduce((sum, v) => (v.isBlocked ? sum : sum + v.quantity), 0),
    [validated]
  );

  const isValidating = queries.some((q) => q.isPending || q.isFetching);
  const pendingCount = queries.filter((q) => q.isPending).length;

  // Persist corrections back to the cart store. We deliberately DO NOT
  // overwrite `item.price` here — keeping the original snapshot lets the UI
  // show the user *what changed* (struck-through old price, new price). The
  // authoritative `livePrice` is what flows into totals and order placement.
  // We only persist hard corrections: drop unavailable items, clamp
  // quantities to live stock, and refresh display metadata (name/images/slug).
  // A signature ref guards against re-running the same reconcile in a render
  // loop.
  const lastReconcileSignatureRef = useRef<string>('');
  useEffect(() => {
    if (validated.length === 0) return;
    if (queries.some((q) => q.isPending)) return;

    const updates: CartReconcileUpdate[] = [];
    for (let i = 0; i < validated.length; i++) {
      const v = validated[i];
      const q = queries[i];
      const product = q?.data;

      if (q?.isError || product?.active === false) {
        updates.push({ productId: v.productId, action: 'remove' });
        continue;
      }
      if (!product) continue;

      const stock = typeof product.stock === 'number' ? product.stock : undefined;
      const quantityNeedsClamp = stock !== undefined && stock > 0 && stock < v.quantity;
      const nameDrifted = product.name !== v.name;
      const slugDrifted = product.slug !== v.slug;

      if (quantityNeedsClamp || nameDrifted || slugDrifted) {
        updates.push({
          productId: v.productId,
          action: 'update',
          // Pass the original snapshot price through unchanged so the UI can
          // still display the historical value with a strike-through.
          price: v.price,
          stock,
          name: product.name,
          images: product.images,
          slug: product.slug,
        });
      }
    }

    if (updates.length === 0) return;

    const signature = updates
      .map((u) =>
        u.action === 'remove'
          ? `r:${u.productId}`
          : `u:${u.productId}:${u.stock ?? ''}:${u.name ?? ''}:${u.slug ?? ''}`
      )
      .join('|');
    if (signature === lastReconcileSignatureRef.current) return;
    lastReconcileSignatureRef.current = signature;

    reconcileCart(updates);
  }, [validated, queries, reconcileCart]);

  const refresh = useMemo(
    () => async () => {
      await Promise.all(
        items.map((item) =>
          queryClient.invalidateQueries({
            queryKey: ['products', 'by-id', item.productId],
          })
        )
      );
    },
    [items, queryClient]
  );

  return {
    items: validated,
    issues: aggregateIssues,
    hasBlockingIssue,
    isValidating,
    pendingCount,
    subtotal,
    itemCount,
    refresh,
  };
}
