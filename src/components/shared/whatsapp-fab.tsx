"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useCallback } from "react";

interface WhatsAppFABProps {
  message?: string;
}

export function WhatsAppFAB({
  message = "\u0645\u0631\u062d\u0628\u0627\u064b\u060c \u0623\u0648\u062f \u0627\u0644\u0627\u0633\u062a\u0641\u0633\u0627\u0631 \u0639\u0646 \u062e\u062f\u0645\u0627\u062a\u0643\u0645",
}: WhatsAppFABProps) {
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
    <motion.button
      type="button"
      onClick={handleClick}
      className="fixed bottom-6 end-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-shadow hover:shadow-xl hover:shadow-[#25D366]/40"
      aria-label="Contact via WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageCircle className="h-7 w-7" fill="white" />
    </motion.button>
  );
}
