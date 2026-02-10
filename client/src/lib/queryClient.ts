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

    // When query key starts with "/api/", use apiRequest style fetch
    if (path.startsWith("api/")) {
      const res = await fetch(`/${path}`, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null as T;
      }

      await throwIfResNotOk(res);
      return await res.json();
    }

    // Default error for unhandled query keys during migration
    throw new Error(
      `No queryFn provided for key: [${queryKey.join(", ")}]. ` +
      `During migration, ensure Firestore services are passed as queryFn or keys start with /api/`
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
