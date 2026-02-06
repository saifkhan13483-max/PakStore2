import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider, Helmet } from "react-helmet-async";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ProductDetails from "@/pages/ProductDetails";
import Cart from "@/pages/Cart";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Home} />
      <Route path="/products/:slug" component={ProductDetails} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Home} />
      <Route path="/thank-you" component={Home} />
      <Route path="/about" component={Home} />
      <Route path="/contact" component={Home} />
      <Route path="/privacy" component={Home} />
      <Route path="/terms" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Helmet>
            <title>NoorBazaar | Authentic Pakistani Artisanal Products</title>
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
