import { useLocation } from "wouter";
import { useAuthStore } from "@/store/authStore";
import { useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAdmin, isLoading, isAuthenticated } = useAuthStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Please login to access the admin area.",
        });
        setLocation("/login");
      } else if (!isAdmin) {
        toast({
          variant: "destructive",
          title: "Unauthorized",
          description: "You do not have permission to access the admin area.",
        });
        setLocation("/");
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, setLocation, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
