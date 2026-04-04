"use client";

import { div } from "framer-motion/client";

interface LogoProps {
  logoUrl?: string | null;
  companyName?: string;
  className?: string;
  variant?: "dark" | "light";
}

export function Logo({
  logoUrl,
  companyName = "SafarCMS",
  className = "",
  variant = "dark",
}: LogoProps) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <div className="flex items-center justify-center py-6 rounded-xl shadow-sm  bg-white/90">
        <img
          src={logoUrl}
          alt={companyName}
          className={`h-18 w-auto object-contain rounded-xl  px-4 py-2 backdrop-blur-sm ${className}`}
        />
      </div>
    );
  }

  const textColor = variant === "light" ? "text-white" : "text-brand-primary";

  return (
    <span className={`text-xl font-bold ${textColor} ${className}`}>
      {companyName}
    </span>
  );
}
