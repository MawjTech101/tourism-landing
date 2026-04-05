import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { WhatsAppFAB } from "@/components/shared/whatsapp-fab";
import { getTenantConfig } from "@/lib/tenant/config";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const config = await getTenantConfig();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div dir={dir} lang={locale}>
      <NextIntlClientProvider messages={messages}>
        <ThemeProvider>
          <PublicHeader
            logoUrl={config.logo_url}
            companyName={
              locale === "ar"
                ? config.company_name_ar
                : config.company_name_en
            }
          />
          <main className="min-h-screen">{children}</main>
          <PublicFooter />
          {config.whatsapp_number && (
            <WhatsAppFAB />
          )}
        </ThemeProvider>
      </NextIntlClientProvider>
    </div>
  );
}
