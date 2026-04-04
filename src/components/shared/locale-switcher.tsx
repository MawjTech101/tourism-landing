"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";

interface LocaleSwitcherProps {
  variant?: "default" | "light";
}

export function LocaleSwitcher({ variant = "default" }: LocaleSwitcherProps) {
  const locale = useLocale();
  const t = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();

  const toggleLocale = () => {
    const nextLocale = locale === "ar" ? "en" : "ar";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLocale}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
        variant === "light"
          ? "text-white/80 hover:text-white hover:bg-white/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      <Globe size={16} />
      {t("language")}
    </button>
  );
}
