import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onFinish: () => void;
}

export default function LoadingScreen({ onFinish }: LoadingScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, 600);
    }, 2200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-600"
      style={{ opacity: fadeOut ? 0 : 1, pointerEvents: fadeOut ? "none" : "all" }}
    >
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Spinning ring */}
        <svg
          className="absolute inset-0 animate-spin"
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="#e5e7eb"
            strokeWidth="6"
          />
          <path
            d="M64 6 A58 58 0 0 1 122 64"
            stroke="#111827"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>

        {/* Logo in the center */}
        <img
          src="https://res.cloudinary.com/dftvtsjcg/image/upload/v1773296361/Untitled-1-removebg-preview_pgcat0.png"
          alt="Logo"
          className="w-20 h-20 object-contain"
        />
      </div>
    </div>
  );
}
