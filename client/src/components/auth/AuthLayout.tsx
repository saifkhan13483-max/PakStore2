import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-10 w-10" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            PakCart
          </h1>
          <p className="text-muted-foreground">Secure Pakistani E-Commerce</p>
        </div>

        <Card className="border-border/40 shadow-xl">
          <CardHeader className="space-y-1">
            <h2 className="text-2xl font-semibold text-center">{title}</h2>
            <p className="text-sm text-muted-foreground text-center">
              {description}
            </p>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to PakCart's Terms of Service and Privacy Policy.
          All data is encrypted and handled securely.
        </p>
      </div>
    </div>
  );
}
