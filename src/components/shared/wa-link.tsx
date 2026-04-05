"use client";

import { useCallback } from "react";

interface WaLinkProps {
  message?: string;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}

export function WaLink({
  message = "",
  className,
  children,
  "aria-label": ariaLabel,
}: WaLinkProps) {
  const handleClick = useCallback(async () => {
    try {
      const res = await fetch("/api/contact-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    } catch {
      // silently fail
    }
  }, [message]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
