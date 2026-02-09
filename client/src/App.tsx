import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider, Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";
import { Suspense, lazy, useEffect } from "react";
import { Loader2 } from "lucide-react";

// Page Imports with Code Splitting
const Home = lazy(() => import("@/pages/Home"));
const Products = lazy(() => import("@/pages/Products"));
const Signup = lazy(() => import("@/pages/auth/Signup"));
const Login = lazy(() => import("@/pages/auth/Login"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const ThankYou = lazy(() => import("@/pages/ThankYou"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Profile = lazy(() => import("@/pages/auth/Profile"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/Products"));

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
  }, [location]);

  const isAdminPath = location.startsWith("/admin");

  const routes = (
    <Switch>
      <Route path="/" component={Home} />
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
      </Helmet>
      <Suspense fallback={<PageLoader />}>
        {routes}
      </Suspense>
    </Layout>
  );
}

import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

function App() {
  const { user } = useAuthStore();
  const { syncWithFirebase } = useCartStore();

  useEffect(() => {
    if (user) {
      syncWithFirebase(user.uid);
    }
  }, [user, syncWithFirebase]);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Helmet>
            <title>PakCart | Authentic Pakistani Artisanal Products</title>
            <meta name="description" content="Discover premium Pakistani artisanal products, from Kashmiri Pashminas to Multani Khussas. Quality items delivered to your doorstep." />
          </Helmet>
          <Router />
          <Toaster />
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
