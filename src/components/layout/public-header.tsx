"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { Logo } from "@/components/shared/logo";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PublicHeaderProps {
  logoUrl?: string | null;
  companyName?: string;
}

export function PublicHeader({ logoUrl, companyName }: PublicHeaderProps) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/trips", label: t("trips") },
    { href: "/deals", label: t("deals") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  const isTransparent = isHomePage && !scrolled && !mobileMenuOpen;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-700 ease-out ${
        isTransparent
          ? "bg-transparent"
          : "glass border-b border-border/30 shadow-sm shadow-black/[0.03]"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
        <Link href="/" className="relative z-10">
          <Logo
            logoUrl={logoUrl}
            companyName={companyName}
            variant={isTransparent ? "light" : "dark"}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-4 py-2 text-[13px] font-medium tracking-wide transition-all duration-300 ${
                  isTransparent
                    ? isActive
                      ? "text-white bg-white/12"
                      : "text-white/70 hover:text-white hover:bg-white/8"
                    : isActive
                      ? "text-brand-primary bg-brand-primary/[0.06]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Vertical divider */}
          <div className={`mx-3 h-5 w-px ${isTransparent ? "bg-white/15" : "bg-border"}`} />

          <LocaleSwitcher variant={isTransparent ? "light" : "default"} />
        </nav>

        {/* Mobile menu button */}
        <button
          className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-lg transition-colors md:hidden ${
            isTransparent
              ? "text-white hover:bg-white/10"
              : "text-foreground hover:bg-muted"
          }`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden border-t border-border/30 glass md:hidden"
          >
            <nav className="flex flex-col gap-1 p-5">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    className={`block rounded-xl px-4 py-3.5 text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-brand-primary/[0.06] text-brand-primary"
                        : "text-foreground hover:bg-muted/60"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-3 border-t border-border/30 pt-3 px-2">
                <LocaleSwitcher />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
