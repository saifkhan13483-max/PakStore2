import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider, Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";
import { Suspense, lazy, useEffect, useState } from "react";

// Robust Lazy Loading with retry logic
const lazyWithRetry = (componentImport: () => Promise<any>) => {
  return lazy(async () => {
    const pageHasBeenForceRefreshed = JSON.parse(
      window.localStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      if (pageHasBeenForceRefreshed) {
        window.localStorage.setItem('page-has-been-force-refreshed', 'false');
      }
      return component;
    } catch (error: any) {
      // Check for common network/module loading errors
      const isDynamicImportError = 
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('error loading dynamically imported module') ||
        error?.name === 'ChunkLoadError';

      if (isDynamicImportError) {
        if (!pageHasBeenForceRefreshed) {
          window.localStorage.setItem('page-has-been-force-refreshed', 'true');
          window.location.reload();
          return { default: () => null };
        }
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
const OrderDetail = lazyWithRetry(() => import("@/pages/OrderDetail"));

import { trackEvent } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

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
    return <Suspense fallback={<PageLoader />}>{routes}</Suspense>;
  }

  return (
    <Layout>
      <Helmet>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preload" as="image" href="https://res.cloudinary.com/dftvtsjcg/image/upload/f_auto,q_auto,w_1920/v1772789701/ChatGPT_Image_Mar_6_2026_02_15_28_PM_1_t8uwak.png" />
      </Helmet>
      <Suspense fallback={<PageLoader />}>
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
                <meta property="og:title" content="Online Shopping in Pakistan | Women's Bags, Men's Watches, Slippers & Bedsheets - PakCart" />
                <meta property="og:description" content="Shop affordable women's handbags, men's watches, slippers, bedsheets & kids bags online. Free delivery over Rs. 10,000. Fast & secure shopping." />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://pakcart.store/" />
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
