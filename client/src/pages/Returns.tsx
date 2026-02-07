import { RefreshCcw, ShieldCheck, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Returns() {
  const lastUpdated = "February 07, 2026";

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif text-emerald-900 mb-4">Returns & Exchanges</h1>
        <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-emerald-100 bg-emerald-50/30">
            <CardContent className="pt-6 text-center">
              <RefreshCcw className="h-10 w-10 mx-auto mb-4 text-emerald-700" />
              <h3 className="font-bold text-emerald-900 mb-2">7 Days Return</h3>
              <p className="text-sm text-muted-foreground">Easy returns within 7 days of delivery</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-100 bg-emerald-50/30">
            <CardContent className="pt-6 text-center">
              <ShieldCheck className="h-10 w-10 mx-auto mb-4 text-emerald-700" />
              <h3 className="font-bold text-emerald-900 mb-2">Quality Guarantee</h3>
              <p className="text-sm text-muted-foreground">Full refund for damaged or defective items</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-100 bg-emerald-50/30">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-10 w-10 mx-auto mb-4 text-emerald-700" />
              <h3 className="font-bold text-emerald-900 mb-2">Simple Process</h3>
              <p className="text-sm text-muted-foreground">Contact support to initiate your return</p>
            </CardContent>
          </Card>
        </div>

        <div className="prose prose-emerald dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-serif text-emerald-800">Return Policy</h2>
            <p>
              We want you to be completely satisfied with your purchase from PakCart. If you are not happy 
              with your order, you can return it within 7 days of receipt, provided the items are:
            </p>
            <ul>
              <li>In their original, unused condition</li>
              <li>With all original packaging and tags intact</li>
              <li>Accompanied by the original invoice or proof of purchase</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-emerald-800">Exchanges</h2>
            <p>
              Need a different size or color? We offer easy exchanges for eligible products. 
              The exchange process follows the same timeline as returns. If the requested item is out of stock, 
              we will issue a store credit or refund.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-emerald-800">Refund Process</h2>
            <p>
              Once your return is received and inspected, we will notify you of the approval or rejection 
              of your refund. If approved, your refund will be processed via your original payment method 
              or bank transfer within 7-10 business days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
