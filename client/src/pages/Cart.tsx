import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const subtotal = getTotalPrice();
  const shipping = subtotal > 5000 ? 0 : 250; // Free shipping over 5000
  const total = subtotal + shipping;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col font-body">
      <Navbar />

      <main className="flex-1 py-12 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold mb-8">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-border/50">
              <div className="mb-6 inline-flex p-4 rounded-full bg-muted">
                <ShoppingBagIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
              <Link href="/">
                <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden">
                  {items.map((item) => (
                    <div key={item.id} className="p-6 flex gap-6 items-center border-b last:border-0 hover:bg-muted/10 transition-colors">
                      {/* Image */}
                      <div className="h-24 w-24 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                        {item.images?.[0] && (
                          <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{item.category}</p>
                            <Link href={`/product/${item.slug}`}>
                              <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                                {item.name}
                              </h3>
                            </Link>
                          </div>
                          <span className="font-bold text-lg text-primary">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center border rounded-lg bg-background">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 hover:text-destructive transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="mx-3 text-sm font-medium w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 hover:text-primary transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors text-sm flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={clearCart}
                  className="w-full sm:w-auto text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  Clear Cart
                </Button>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6 sticky top-24">
                  <h3 className="font-display text-xl font-bold mb-6">Order Summary</h3>
                  
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="flex justify-between items-center mb-8">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-primary">{formatPrice(total)}</span>
                  </div>

                  <Button size="lg" className="w-full rounded-full bg-primary hover:bg-primary/90 h-12 text-lg font-semibold">
                    Proceed to Checkout
                  </Button>

                  <div className="mt-6 text-xs text-muted-foreground text-center">
                    <p className="flex items-center justify-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Secure Checkout
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ShoppingBagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
