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
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-8">
        <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex items-center justify-center mb-5">
            <div className="bg-red-100 p-3 sm:p-4 rounded-full">
              <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-600" />
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-center text-gray-900 mb-1 leading-none">
            404
          </h1>

          <h2 className="text-lg sm:text-xl font-semibold text-center text-gray-700 mb-3">
            Page Not Found
          </h2>

          <p className="text-sm sm:text-base text-center text-gray-500 mb-7 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>

          <div className="space-y-3">
            <Button asChild size="lg" className="w-full gap-2 h-11 text-sm sm:text-base">
              <Link href="/">
                <Home className="w-4 h-4 shrink-0" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full gap-2 h-11 text-sm sm:text-base">
              <Link href="/products">
                <ArrowLeft className="w-4 h-4 shrink-0" />
                Continue Shopping
              </Link>
            </Button>
          </div>

          <p className="text-xs text-center text-gray-400 mt-6">
            Need help?{" "}
            <Link href="/contact" className="text-green-600 hover:underline font-medium">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
