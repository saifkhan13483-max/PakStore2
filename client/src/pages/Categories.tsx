import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { categoryFirestoreService } from "@/services/categoryFirestoreService";
import type { ParentCategory, Category } from "@shared/schema";
import { Tag } from "lucide-react";

export default function Categories() {
  const { data: parentCategories, isLoading: loadingParents } = useQuery<ParentCategory[]>({
    queryKey: ["parent-categories"],
    queryFn: () => categoryFirestoreService.getAllParentCategories(),
  });

  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryFirestoreService.getAllCategories(),
  });

  const isLoading = loadingParents || loadingCategories;

  useEffect(() => {
    if (!isLoading) {
      (window as any).__SEO_PAGE_READY__ = true;
    }
  }, [isLoading]);

  const getSubcategories = (parentId: string) =>
    (categories || []).filter((c) => String(c.parentCategoryId) === String(parentId));

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title="Shop by Category — Bags, Jewelry, Shoes, Watches, Stitched Dresses & Tech Gadgets"
        description="Explore PakCart by category — bags & wallets, jewelry, shoes, slippers, stitched dresses, watches and tech gadgets. Cash on Delivery, easy returns and fast nationwide shipping in Pakistan."
        keywords="shop by category pakistan, bags and wallets, jewelry pakistan, shoes pakistan, slippers, stitched dresses, watches pakistan, tech gadgets"
        url="https://pakcart.store/categories"
        robots="index,follow"
        breadcrumbs={[
          { name: "Home", url: "https://pakcart.store/" },
          { name: "Categories", url: "https://pakcart.store/categories" },
        ]}
      />

      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Categories</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Shop All Categories</h1>
        <p className="text-muted-foreground mt-2 text-base leading-relaxed max-w-3xl">
          Discover our complete collection available online in Pakistan. Shop bags & wallets, jewelry, shoes, slippers, stitched dresses, watches and tech gadgets — all with fast delivery across Pakistan.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-7 w-48 mb-4 rounded-xl" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-24 rounded-2xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : !parentCategories || parentCategories.length === 0 ? (
        <div className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-muted-foreground/20">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-xl font-bold mb-2">No categories yet</h3>
          <p className="text-muted-foreground">Check back soon for new arrivals.</p>
        </div>
      ) : (
        <div className="space-y-12" data-testid="categories-list">
          {parentCategories.map((parent) => {
            const subs = getSubcategories(parent.id);
            return (
              <section key={parent.id} data-testid={`section-parent-${parent.id}`}>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xl font-bold tracking-tight">{parent.name}</h2>
                  <Link
                    href={`/collections/${parent.slug}`}
                    className="text-sm text-primary font-medium hover:underline ml-auto"
                    data-testid={`link-view-all-${parent.id}`}
                  >
                    View all
                  </Link>
                </div>
                {parent.description && (
                  <p className="text-muted-foreground text-sm mb-4 -mt-3">{parent.description}</p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {subs.length > 0 ? (
                    subs.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/collections/${cat.slug}`}
                        data-testid={`card-category-${cat.id}`}
                        className="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border bg-card hover:bg-accent hover:border-primary/30 transition-all duration-200 text-center shadow-sm hover:shadow-md"
                      >
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-12 h-12 object-cover rounded-full border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                            <Tag className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <span className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                          {cat.name}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <Link
                      href={`/collections/${parent.slug}`}
                      data-testid={`card-parent-browse-${parent.id}`}
                      className="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border bg-card hover:bg-accent hover:border-primary/30 transition-all duration-200 text-center shadow-sm hover:shadow-md col-span-2 sm:col-span-1"
                    >
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <Tag className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                        Browse {parent.name}
                      </span>
                    </Link>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
