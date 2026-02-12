import { useLocation } from "wouter";
import { useAuthStore } from "@/store/authStore";
import { useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAdmin, isLoading, isAuthenticated } = useAuthStore();
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
        setLocation("/auth/login");
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground animate-pulse">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
