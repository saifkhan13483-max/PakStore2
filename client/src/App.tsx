import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider, Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";
import { Suspense, lazy, useEffect, useState, type LazyExoticComponent, type ComponentType } from "react";

// Check for deployment version changes in the background (non-blocking)
const checkDeploymentVersion = (): void => {
  const versionKey = 'deployment-version';
  fetch(`${window.location.origin}/index.html?t=${Date.now()}`, {
    method: 'HEAD',
    cache: 'no-store',
  }).then(response => {
    const currentVersion = response.headers.get('etag') || response.headers.get('last-modified') || String(Date.now());
    const storedVersion = window.localStorage.getItem(versionKey);
    if (storedVersion && storedVersion !== currentVersion) {
      window.localStorage.setItem(versionKey, currentVersion);
      window.location.reload();
    } else if (!storedVersion) {
      window.localStorage.setItem(versionKey, currentVersion);
    }
  }).catch(() => {});
};

// Run version check after page loads — does not block any component loading
if (typeof window !== 'undefined') {
  window.addEventListener('load', checkDeploymentVersion, { once: true });
}

// Robust Lazy Loading with exponential backoff retry logic
const lazyWithRetry = (componentImport: () => Promise<any>): LazyExoticComponent<ComponentType<any>> => {
  return lazy(async (): Promise<{ default: ComponentType<any> }> => {
    const maxRetries = 3;
    const retryKey = 'chunk-load-retry-count';
    const currentRetries = parseInt(window.localStorage.getItem(retryKey) || '0');

    try {
      const component = await componentImport();
      window.localStorage.setItem(retryKey, '0');
      return component;
    } catch (error: any) {
      const isDynamicImportError = 
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('error loading dynamically imported module') ||
        error?.message?.includes('loading dynamically imported') ||
        error?.code === 'LOAD_ERROR' ||
        error?.name === 'ChunkLoadError';

      if (isDynamicImportError && currentRetries < maxRetries) {
        const backoffDelay = Math.min(1000 * Math.pow(3, currentRetries), 10000);
        window.localStorage.setItem(retryKey, String(currentRetries + 1));
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return await componentImport();
      }

      if (isDynamicImportError && currentRetries >= maxRetries) {
        console.error('Chunk load failed after retries. Performing hard refresh.', error);
        window.localStorage.setItem(retryKey, '0');
        window.location.reload();
        return { default: () => null };
      }

      throw error;
    }
  });
};

// Page Imports with Code Splitting and Retry Logic
const Home = lazyWithRetry(() => import("@/pages/Home"));
const Categories = lazyWithRetry(() => import("./pages/Categories"));
const Products = lazyWithRetry(() => import("@/pages/Products"));
const NewArrivals = lazyWithRetry(() => import("@/pages/NewArrivals"));
const Signup = lazyWithRetry(() => import("@/pages/auth/Signup"));
const Login = lazyWithRetry(() => import("@/pages/auth/Login"));
const ProductDetail = lazyWithRetry(() => import("@/pages/ProductDetail"));
const Cart = lazyWithRetry(() => import("@/pages/Cart"));
const Checkout = lazyWithRetry(() => import("@/pages/Checkout"));
const ThankYou = lazyWithRetry(() => import("@/pages/ThankYou"));
const About = lazyWithRetry(() => import("@/pages/About"));
const Contact = lazyWithRetry(() => import("@/pages/Contact"));
const Privacy = lazyWithRetry(() => import("@/pages/Privacy"));
const Terms = lazyWithRetry(() => import("@/pages/Terms"));
const Profile = lazyWithRetry(() => import("@/pages/auth/Profile"));
const MyOrders = lazyWithRetry(() => import("@/pages/MyOrders"));
const CategoryCollection = lazyWithRetry(() => import("@/pages/CategoryCollection"));
const AdminDashboard = lazyWithRetry(() => import("@/pages/admin/Dashboard"));
const AdminProducts = lazyWithRetry(() => import("@/pages/admin/Products"));
const AdminProductForm = lazyWithRetry(() => import("@/pages/admin/ProductForm"));
const AdminCategories = lazyWithRetry(() => import("@/pages/admin/ManageCategories"));
const AdminOrders = lazyWithRetry(() => import("@/pages/admin/Orders"));
const AdminSitemap = lazyWithRetry(() => import("@/pages/admin/Sitemap"));
const AdminHomepageSlider = lazyWithRetry(() => import("@/pages/admin/HomepageSlider"));
const AdminAnnouncements = lazyWithRetry(() => import("@/pages/admin/Announcements"));
const OrderDetail = lazyWithRetry(() => import("@/pages/OrderDetail"));

import { trackEvent } from "@/lib/firebase";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Track page views (Part 23)
    try {
      trackEvent('page_view', { 
        page_path: location,
        page_title: document.title 
      });
    } catch (error) {
      console.warn("Analytics tracking failed:", error);
    }
  }, [location]);

  const isAdminPath = location.startsWith("/admin");

  const routes = (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/categories" component={Categories} />
      <Route path="/collections/:slug" component={CategoryCollection} />
      <Route path="/new-arrivals" component={NewArrivals} />
      <Route path="/auth/signup" component={Signup} />
      <Route path="/auth/login" component={Login} />
      <Route path="/products" component={Products} />
      <Route path="/products/:slug" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout">
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/orders">
        <ProtectedRoute>
          <MyOrders />
        </ProtectedRoute>
      </Route>
      <Route path="/orders/:id">
        <ProtectedRoute>
          <OrderDetail />
        </ProtectedRoute>
      </Route>
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      
      {/* Admin Routes */}
      <Route path="/admin">
        <AdminRoute>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/products">
        <AdminRoute>
          <AdminLayout>
            <AdminProducts />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/products/new">
        <AdminRoute>
          <AdminLayout>
            <AdminProductForm />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/products/:id/edit">
        <AdminRoute>
          <AdminLayout>
            <AdminProductForm />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/categories">
        <AdminRoute>
          <AdminLayout>
            <AdminCategories />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/orders">
        <AdminRoute>
          <AdminLayout>
            <AdminOrders />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/sitemap">
        <AdminRoute>
          <AdminLayout>
            <AdminSitemap />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/homepage-slider">
        <AdminRoute>
          <AdminLayout>
            <AdminHomepageSlider />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/announcements">
        <AdminRoute>
          <AdminLayout>
            <AdminAnnouncements />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/:rest*">
        <AdminRoute>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </AdminRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );

  if (isAdminPath) {
    return <Suspense fallback={null}>{routes}</Suspense>;
  }

  return (
    <Layout>
      <Helmet>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </Helmet>
      <Suspense fallback={null}>
        {routes}
      </Suspense>
    </Layout>
  );
}

import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

import { AuthProvider } from "@/hooks/use-auth";
import { ErrorBoundary } from "@/components/ui/error-boundary";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <TooltipProvider>
              <Helmet>
                <title>Online Shopping in Pakistan | Women's Bags, Men's Watches, Slippers & Bedsheets - PakCart</title>
                <meta name="description" content="Shop affordable women's handbags, men's watches, slippers, bedsheets, and kids bags online in Pakistan. Free delivery on orders over Rs. 10,000. Authentic fashion accessories, footwear & home essentials with fast delivery across Pakistan." />
                <meta name="keywords" content="online shopping Pakistan, women bags, men watches, slippers, bedsheets, kids bags, fashion accessories, footwear" />
                <meta property="og:type" content="website" />
              </Helmet>
              <Router />
              <Toaster />
            </TooltipProvider>
          </HelmetProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
