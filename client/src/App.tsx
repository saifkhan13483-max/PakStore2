import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider, Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";

// Page Imports
import Home from "@/pages/Home";
const Products = () => <div>Products Listing Page</div>;
const ProductDetail = () => <div>Product Detail Page</div>;
const Cart = () => <div>Shopping Cart Page</div>;
const Checkout = () => <div>Checkout Page</div>;
const ThankYou = () => <div>Thank You Page</div>;
const About = () => <div>About Us Page</div>;
const Contact = () => <div>Contact Us Page</div>;
const Privacy = () => <div>Privacy Policy Page</div>;
const Terms = () => <div>Terms & Conditions Page</div>;

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/products/:slug" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/thank-you" component={ThankYou} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
