import { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-start sm:items-center justify-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-md space-y-5 sm:space-y-7">
        <div className="text-center space-y-1.5">
          <div className="flex justify-center">
            <div className="p-2.5 sm:p-3 rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            PakCart
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Secure Pakistani E-Commerce</p>
        </div>

        <div className="bg-white rounded-2xl border border-border/40 shadow-xl px-5 py-6 sm:px-7 sm:py-8">
          <div className="mb-5 sm:mb-6 space-y-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-center">{title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground text-center leading-snug">
              {description}
            </p>
          </div>
          {children}
        </div>

        <p className="text-center text-xs text-muted-foreground px-2">
          By continuing, you agree to PakCart's Terms of Service and Privacy Policy.
          All data is encrypted and handled securely.
        </p>
      </div>
    </div>
  );
}
