import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

export default function NotFound() {
  return (
    <>
      <SEO 
        title="Page Not Found (404)"
        description="The page you're looking for doesn't exist. Return to our store to continue shopping."
        robots="noindex,follow"
      />
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md mx-4 shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-2">
              404
            </h1>
            
            <h2 className="text-xl font-semibold text-center text-gray-700 dark:text-gray-300 mb-4">
              Page Not Found
            </h2>

            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              The page you're looking for doesn't exist or has been moved. Let's get you back on track.
            </p>

            <div className="space-y-3">
              <Button asChild size="lg" className="w-full gap-2">
                <Link href="/">
                  <Home className="w-4 h-4" />
                  Back to Home
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full gap-2">
                <Link href="/products">
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-6">
              Need help? <Link href="/contact" className="text-primary hover:underline">Contact us</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
