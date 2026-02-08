import { Button } from "@/components/ui/button";
import { SiGoogle } from "react-icons/si";
import { Loader2 } from "lucide-react";

interface SocialAuthButtonProps {
  isLoading?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function SocialAuthButton({ isLoading, onClick, disabled }: SocialAuthButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-white text-gray-700 border-gray-300 hover:bg-gray-50 h-11 relative"
      onClick={onClick}
      disabled={disabled || isLoading}
      data-testid="button-google-signin"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <SiGoogle className="mr-2 h-4 w-4 text-[#4285F4]" />
      )}
      {isLoading ? "Signing in..." : "Continue with Google"}
    </Button>
  );
}
