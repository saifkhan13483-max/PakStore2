import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      // Encode the current location to redirect back after login
      const redirectParam = encodeURIComponent(location);
      setLocation(`/auth/login?redirect=${redirectParam}`);
    }
  }, [loading, user, location, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground animate-pulse">Verifying your session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be handled by useEffect redirect
  }

  return <>{children}</>;
}
