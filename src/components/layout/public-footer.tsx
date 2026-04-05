import { getLocale, getTranslations } from "next-intl/server";
import { getTenantConfig } from "@/lib/tenant/config";
import { Logo } from "@/components/shared/logo";
import { WaLink } from "@/components/shared/wa-link";
import { Instagram, Twitter, Music2, Ghost, ArrowRight } from "lucide-react";

const socialIcons: Record<string, React.ElementType> = {
  instagram: Instagram,
  twitter: Twitter,
  tiktok: Music2,
  snapchat: Ghost,
};

export async function PublicFooter() {
  const config = await getTenantConfig();
  const locale = await getLocale();
  const t = await getTranslations("footer");
  const tCommon = await getTranslations("common");
  const isAr = locale === "ar";

  const companyName = isAr ? config.company_name_ar : config.company_name_en;
  const footerAbout = isAr ? config.footer_about_ar : config.footer_about_en;
  const copyright = isAr ? config.copyright_text_ar : config.copyright_text_en;
  const address = isAr ? config.address_ar : config.address_en;
  const socialLinks = (config.social_links || {}) as Record<string, string>;

  return (
    <footer className="relative overflow-hidden bg-[oklch(0.12_0.015_285)] text-white">
      {/* Decorative top accent */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--tenant-accent, #C49B66), transparent)",
        }}
      />

      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 start-1/4 h-80 w-80 rounded-full bg-brand-primary/[0.04] blur-[100px]" />
        <div className="absolute -bottom-40 end-1/4 h-80 w-80 rounded-full bg-brand-secondary/[0.04] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-10">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-12">
          {/* About — Larger section */}
          <div className="md:col-span-5">
            <Logo logoUrl={config.logo_url} companyName={companyName} variant="light" />
            <p className="mt-6 max-w-md text-sm leading-[1.8] text-white/40">
              {footerAbout || ""}
            </p>

            {/* Social icons */}
            {Object.keys(socialLinks).length > 0 && (
              <div className="mt-8 flex gap-3">
                {Object.entries(socialLinks).map(([platform, url]) => {
                  const Icon = socialIcons[platform];
                  if (!Icon || !url) return null;
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] text-white/50 transition-all duration-300 hover:border-brand-accent/30 hover:bg-brand-accent/10 hover:text-brand-accent"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h3 className="mb-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-accent/70">
              {t("quickLinks")}
            </h3>
            <ul className="space-y-4">
              {[
                { href: `/${locale}`, label: tCommon("home") },
                { href: `/${locale}/trips`, label: tCommon("trips") },
                { href: `/${locale}/deals`, label: tCommon("deals") },
                { href: `/${locale}/about`, label: tCommon("about") },
                { href: `/${locale}/contact`, label: tCommon("contact") },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-white/40 transition-all duration-300 hover:text-white/90"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 rtl:rotate-180" />
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h3 className="mb-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-accent/70">
              {t("contactUs")}
            </h3>
            <ul className="space-y-5">
              {config.whatsapp_number && (
                <li>
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25">
                    WhatsApp
                  </span>
                  <WaLink
                    className="text-sm text-white/50 transition-colors duration-300 hover:text-white/90 cursor-pointer"
                  >
                    <span dir="ltr">{config.whatsapp_number}</span>
                  </WaLink>
                </li>
              )}
              {config.email && (
                <li>
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25">
                    Email
                  </span>
                  <a
                    href={`mailto:${config.email}`}
                    className="text-sm text-white/50 transition-colors duration-300 hover:text-white/90"
                  >
                    {config.email}
                  </a>
                </li>
              )}
              {address && (
                <li>
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25">
                    {isAr ? "العنوان" : "Address"}
                  </span>
                  <span className="text-sm text-white/50">{address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-[11px] text-white/25">
            {copyright ||
              `© ${new Date().getFullYear()} ${companyName}. ${t("rights")}`}
          </p>
          <p className="text-[11px] text-white/15">
            Powered by SafarCMS
          </p>
        </div>
      </div>
    </footer>
  );
}
