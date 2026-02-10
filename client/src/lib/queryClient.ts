import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.warn("apiRequest is deprecated. Use Firestore services.");
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export interface QueryOptions {
  on401?: UnauthorizedBehavior;
}

export const getQueryFn: <T>(options: QueryOptions) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior = "throw" }) =>
  async ({ queryKey, queryFn }) => {
    // If an explicit queryFn is provided (e.g. for Firestore), use it
    if (queryFn && queryFn !== getQueryFn({ on401: unauthorizedBehavior })) {
      return await queryFn({ queryKey, meta: {} } as any);
    }

    const path = queryKey.join("/");

    // Disable legacy API patterns
    if (path.startsWith("api/")) {
      throw new Error(
        `Legacy API pattern detected: [${queryKey.join(", ")}]. ` +
        `apiRequest and /api/ keys are deprecated. Use Firestore services instead.`
      );
    }

    // Default error for unhandled query keys during migration
    throw new Error(
      `No queryFn provided for key: [${queryKey.join(", ")}]. ` +
      `During migration, ensure Firestore services are passed as queryFn.`
    );
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
