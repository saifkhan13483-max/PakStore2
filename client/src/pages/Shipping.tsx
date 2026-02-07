import { Card, CardContent } from "@/components/ui/card";
import { Truck, ShieldCheck, Clock, RefreshCcw } from "lucide-react";

export default function Shipping() {
  const lastUpdated = "February 07, 2026";

  const shippingMethods = [
    {
      title: "Standard Shipping",
      time: "3-5 Business Days",
      cost: "Rs. 200 (Free over Rs. 2,000)",
      description: "Available for all major cities including Karachi, Lahore, Islamabad, and more."
    },
    {
      title: "Express Delivery",
      time: "1-2 Business Days",
      cost: "Rs. 500",
      description: "Priority processing for urgent orders in metropolitan areas."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif text-emerald-900 mb-4">Shipping Information</h1>
        <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {shippingMethods.map((method, index) => (
            <Card key={index} className="border-emerald-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4 text-emerald-700">
                  <Truck className="h-6 w-6" />
                  <h3 className="text-xl font-semibold">{method.title}</h3>
                </div>
                <p className="font-medium text-emerald-900 mb-1">{method.time}</p>
                <p className="text-emerald-700 font-bold mb-3">{method.cost}</p>
                <p className="text-muted-foreground text-sm">{method.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="prose prose-emerald dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-serif text-emerald-800">Order Tracking</h2>
            <p>
              Once your order is dispatched, you will receive a tracking number via SMS and Email. 
              You can use this number on our partner courier websites to track your shipment in real-time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-emerald-800">Delivery Partners</h2>
            <p>
              We partner with Pakistan's most reliable courier services including TCS, Leopard Couriers, 
              and Trax to ensure your artisanal treasures reach you in perfect condition.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-serif text-emerald-800">Cash on Delivery (COD)</h2>
            <p>
              Cash on Delivery is available for orders up to Rs. 50,000 across Pakistan. 
              For orders above this amount, please contact our support for alternative payment methods.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
