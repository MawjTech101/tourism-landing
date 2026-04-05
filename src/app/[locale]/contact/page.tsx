import { getTranslations, getLocale } from "next-intl/server";
import { getTenant, getTenantConfig } from "@/lib/tenant/config";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
} from "lucide-react";
import { WaLink } from "@/components/shared/wa-link";
import { MotionDiv } from "@/components/shared/motion";
import { ContactForm } from "./contact-form";

export default async function ContactPage() {
  const locale = await getLocale();
  const t = await getTranslations();
  const isAr = locale === "ar";
  const tenant = await getTenant();
  const config = await getTenantConfig();

  const address = isAr ? config.address_ar : config.address_en;
  const whatsappMessage = isAr
    ? "مرحباً، أود الاستفسار عن خدماتكم"
    : "Hello, I'd like to inquire about your services";

  return (
    <div>
      {/* ─── Page Header ─── */}
      <section className="relative overflow-hidden pt-36 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/[0.03] via-brand-secondary/[0.02] to-transparent" />
        <div className="absolute -top-40 -end-40 h-80 w-80 rounded-full bg-brand-primary/[0.04] blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <MotionDiv variant="fade-up">
            <span className="section-label">
              {t("common.contact")}
            </span>
          </MotionDiv>
          <MotionDiv variant="fade-up" delay={0.1}>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
              {t("page.contactUs")}
            </h1>
          </MotionDiv>
          <MotionDiv variant="fade-up" delay={0.15}>
            <div className="ornament mx-auto mt-6">
              <span className="diamond" />
            </div>
          </MotionDiv>
          <MotionDiv variant="fade-up" delay={0.2}>
            <p className="mx-auto mt-5 max-w-xl text-muted-foreground leading-relaxed">
              {isAr
                ? "نحن هنا لمساعدتك. تواصل معنا وسنرد عليك في أقرب وقت"
                : "We're here to help. Reach out and we'll get back to you shortly"}
            </p>
          </MotionDiv>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-5">
          {/* Contact Info */}
          <div className="lg:col-span-2">
            <MotionDiv variant="slide-left">
              <div className="space-y-4">
                {/* WhatsApp */}
                {config.whatsapp_number && (
                  <WaLink
                    message={whatsappMessage}
                    className="card-shine group flex w-full items-start gap-4 rounded-2xl border border-border/40 bg-card p-6 text-start transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#25D366]/[0.06] cursor-pointer"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/8 transition-colors group-hover:bg-[#25D366]/15">
                      <MessageCircle className="h-5 w-5 text-[#25D366]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">WhatsApp</h3>
                      <span
                        className="text-sm text-muted-foreground transition-colors hover:text-brand-primary"
                        dir="ltr"
                      >
                        {config.whatsapp_number}
                      </span>
                    </div>
                  </WaLink>
                )}

                {/* Phone Numbers */}
                {config.phone_numbers &&
                  config.phone_numbers.length > 0 &&
                  config.phone_numbers.map((phone, i) => (
                    <div
                      key={i}
                      className="card-shine group flex items-start gap-4 rounded-2xl border border-border/40 bg-card p-6 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/[0.06] transition-colors group-hover:bg-brand-primary/10">
                        <Phone className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">{t("common.callNow")}</h3>
                        <a
                          href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                          className="text-sm text-muted-foreground transition-colors hover:text-brand-primary"
                          dir="ltr"
                        >
                          {phone}
                        </a>
                      </div>
                    </div>
                  ))}

                {/* Email */}
                {config.email && (
                  <div className="card-shine group flex items-start gap-4 rounded-2xl border border-border/40 bg-card p-6 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/[0.06] transition-colors group-hover:bg-brand-primary/10">
                      <Mail className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{isAr ? "البريد الإلكتروني" : "Email"}</h3>
                      <a
                        href={`mailto:${config.email}`}
                        className="text-sm text-muted-foreground transition-colors hover:text-brand-primary"
                      >
                        {config.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Address */}
                {address && (
                  <div className="card-shine group flex items-start gap-4 rounded-2xl border border-border/40 bg-card p-6 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/[0.06] transition-colors group-hover:bg-brand-primary/10">
                      <MapPin className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{isAr ? "العنوان" : "Address"}</h3>
                      <p className="text-sm text-muted-foreground">{address}</p>
                    </div>
                  </div>
                )}

                {/* Business Hours */}
                <div className="card-shine group flex items-start gap-4 rounded-2xl border border-border/40 bg-card p-6 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-accent/8 transition-colors group-hover:bg-brand-accent/15">
                    <Clock className="h-5 w-5 text-brand-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">
                      {isAr ? "ساعات العمل" : "Business Hours"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isAr ? "السبت - الخميس: ٩ ص - ٦ م" : "Sat - Thu: 9 AM - 6 PM"}
                    </p>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                {config.whatsapp_number && (
                  <WaLink
                    message={whatsappMessage}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-4.5 text-sm font-semibold text-white shadow-lg shadow-[#25D366]/15 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#25D366]/25 cursor-pointer"
                  >
                    <MessageCircle className="h-5 w-5" fill="white" />
                    {t("common.whatsapp")}
                  </WaLink>
                )}
              </div>
            </MotionDiv>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <MotionDiv variant="slide-right">
              <div className="rounded-2xl border border-border/40 bg-card p-8 md:p-10">
                <div className="mb-8">
                  <span className="section-label">{isAr ? "راسلنا" : "Send a Message"}</span>
                  <h2 className="mt-2 text-xl font-bold tracking-tight">
                    {t("inquiry.title")}
                  </h2>
                </div>
                <ContactForm tenantId={tenant?.id || ""} />
              </div>
            </MotionDiv>
          </div>
        </div>

        {/* Map Embed */}
        {config.google_maps_url && (
          <MotionDiv variant="fade-up" className="mt-20">
            <div className="overflow-hidden rounded-2xl border border-border/40">
              <iframe
                src={config.google_maps_url}
                width="100%"
                height="420"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={isAr ? "موقعنا على الخريطة" : "Our location on the map"}
              />
            </div>
          </MotionDiv>
        )}
      </section>
    </div>
  );
}
