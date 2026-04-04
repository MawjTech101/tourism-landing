import { getTranslations, getLocale } from "next-intl/server";
import { getTenantConfig, getTenant } from "@/lib/tenant/config";
import { createClient } from "@/lib/supabase/server";
import { TripCard, type TripCardData } from "@/components/shared/trip-card";
import { Link } from "@/i18n/navigation";
import {
  MotionDiv,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import {
  Plane,
  MapPin,
  Phone,
  Star,
  Tag,
  ArrowRight,
  Shield,
  Clock,
  HeartHandshake,
  Globe,
  Users,
  Award,
  Compass,
} from "lucide-react";

export default async function HomePage() {
  const config = await getTenantConfig();
  const locale = await getLocale();
  const t = await getTranslations();
  const isAr = locale === "ar";
  const tenant = await getTenant();

  const heroTitle = isAr ? config.hero_title_ar : config.hero_title_en;
  const heroSubtitle = isAr
    ? config.hero_subtitle_ar
    : config.hero_subtitle_en;
  const heroCta = isAr ? config.hero_cta_text_ar : config.hero_cta_text_en;

  let deals: TripCardData[] = [];
  let trips: TripCardData[] = [];

  if (tenant) {
    const supabase = await createClient();

    const [dealsRes, tripsRes] = await Promise.all([
      supabase
        .from("trips")
        .select(
          "id, slug, title_ar, title_en, destination_ar, destination_en, duration_days, duration_nights, price_from, cover_image_url, is_deal, deal_price, is_ending_soon, deal_expiry"
        )
        .eq("tenant_id", tenant.id)
        .eq("status", "active")
        .eq("is_deal", true)
        .order("sort_order", { ascending: true })
        .limit(3),
      supabase
        .from("trips")
        .select(
          "id, slug, title_ar, title_en, destination_ar, destination_en, duration_days, duration_nights, price_from, cover_image_url, is_deal, deal_price, is_ending_soon, deal_expiry"
        )
        .eq("tenant_id", tenant.id)
        .eq("status", "active")
        .order("sort_order", { ascending: true })
        .limit(6),
    ]);

    deals = (dealsRes.data as TripCardData[]) || [];
    trips = (tripsRes.data as TripCardData[]) || [];
  }

  const companyName = isAr ? config.company_name_ar : config.company_name_en;

  return (
    <div className="overflow-hidden">
      {/* ─── HERO ─── Full viewport, cinematic */}
      <section
        className="relative flex min-h-screen items-center justify-center overflow-hidden"
        style={
          config.hero_image_url
            ? {
                backgroundImage: `url(${config.hero_image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: config.hero_image_url
              ? "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.65) 100%)"
              : `linear-gradient(160deg, var(--tenant-primary, #51487E) 0%, var(--tenant-secondary, #AB4E83) 60%, var(--tenant-primary, #51487E) 100%)`,
          }}
        />

        {/* Decorative orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -start-40 h-[600px] w-[600px] rounded-full bg-white/[0.04] blur-[100px]" />
          <div className="absolute -bottom-40 -end-40 h-[500px] w-[500px] rounded-full bg-white/[0.04] blur-[100px]" />
          <div className="absolute top-1/4 end-1/4 h-72 w-72 rounded-full bg-brand-secondary/[0.08] blur-[80px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center text-white">
          <MotionDiv variant="fade-up" delay={0.2}>
            <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.08] px-6 py-3 text-sm backdrop-blur-xl">
              <Compass className="h-4 w-4 text-brand-accent" />
              <span className="tracking-wide">
                {isAr ? "وكالة سفر وسياحة" : "Travel & Tourism Agency"}
              </span>
            </div>
          </MotionDiv>

          <MotionDiv variant="fade-up" delay={0.4}>
            <h1 className="mb-8 text-5xl font-bold leading-[1.08] tracking-tight md:text-7xl lg:text-[5.5rem]">
              {heroTitle || t("hero.defaultTitle")}
            </h1>
          </MotionDiv>

          <MotionDiv variant="fade-up" delay={0.6}>
            <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl">
              {heroSubtitle || t("hero.defaultSubtitle")}
            </p>
          </MotionDiv>

          <MotionDiv variant="fade-up" delay={0.8}>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/trips"
                className="group inline-flex items-center gap-3 rounded-2xl bg-white px-9 py-4.5 text-base font-semibold text-brand-primary shadow-2xl shadow-black/20 transition-all duration-500 hover:shadow-brand-primary/25 hover:scale-[1.03]"
              >
                {heroCta || t("hero.cta")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/[0.08] px-8 py-4.5 text-base font-medium text-white backdrop-blur-sm transition-all duration-500 hover:bg-white/15 hover:border-white/40"
              >
                <Phone className="h-4 w-4" />
                {t("common.contact")}
              </Link>
            </div>
          </MotionDiv>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <MotionDiv variant="fade-in" delay={1.4}>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                {isAr ? "اكتشف المزيد" : "Scroll to explore"}
              </span>
              <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
                <div className="h-2 w-1 animate-bounce rounded-full bg-white/50" />
              </div>
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* ─── STATS BAR ─── Trust indicators */}
      <section className="relative z-10 border-b border-border/50 bg-card">
        <div className="mx-auto max-w-6xl px-6">
          <StaggerContainer className="grid grid-cols-2 divide-x divide-border/50 md:grid-cols-4 rtl:divide-x-reverse">
            {[
              {
                icon: Globe,
                value: "50+",
                label: isAr ? "وجهة سياحية" : "Destinations",
              },
              {
                icon: Users,
                value: "10K+",
                label: isAr ? "مسافر سعيد" : "Happy Travelers",
              },
              {
                icon: Award,
                value: "15+",
                label: isAr ? "سنة خبرة" : "Years Experience",
              },
              {
                icon: Star,
                value: "4.9",
                label: isAr ? "تقييم العملاء" : "Client Rating",
              },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="flex flex-col items-center gap-2 py-8 md:py-10">
                  <stat.icon className="mb-1 h-5 w-5 text-brand-accent" />
                  <span className="stat-number text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    {stat.value}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─── Rich value props */}
      <section className="py-28 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <MotionDiv variant="fade-up" className="mb-5 text-center">
            <span className="section-label">
              {isAr ? "لماذا نحن" : "Why Choose Us"}
            </span>
          </MotionDiv>
          <MotionDiv variant="fade-up" delay={0.1} className="mb-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              {isAr
                ? "تجربة سفر لا تُنسى"
                : "An Unforgettable Travel Experience"}
            </h2>
          </MotionDiv>
          <MotionDiv variant="fade-up" delay={0.15} className="mb-4 text-center">
            <div className="ornament mx-auto">
              <span className="diamond" />
            </div>
          </MotionDiv>
          <MotionDiv variant="fade-up" delay={0.2} className="mb-16 text-center">
            <p className="mx-auto max-w-2xl text-muted-foreground leading-relaxed">
              {isAr
                ? "نقدم لك خدمات سفر متكاملة بمعايير عالمية، من التخطيط إلى العودة، لنضمن لك رحلة استثنائية"
                : "We deliver end-to-end travel services with world-class standards, from planning to return, ensuring an exceptional journey"}
            </p>
          </MotionDiv>

          <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: MapPin,
                title: isAr ? "وجهات مختارة بعناية" : "Curated Destinations",
                desc: isAr
                  ? "نختار لكم أجمل الوجهات حول العالم بعناية فائقة لضمان تجربة فريدة"
                  : "We handpick the world's most beautiful destinations to ensure a unique experience",
                accent: "from-brand-primary/15 to-brand-primary/5",
              },
              {
                icon: Star,
                title: isAr ? "فنادق فاخرة" : "Luxury Hotels",
                desc: isAr
                  ? "إقامة في أرقى الفنادق والمنتجعات المصنفة عالمياً مع أفضل الخدمات"
                  : "Stay in world-class hotels and resorts with premium amenities and services",
                accent: "from-brand-secondary/15 to-brand-secondary/5",
              },
              {
                icon: Shield,
                title: isAr ? "حجز آمن ومضمون" : "Safe & Guaranteed",
                desc: isAr
                  ? "حجوزاتكم مؤمنة ومضمونة مع سياسة إلغاء مرنة وخدمة عملاء متواصلة"
                  : "Your bookings are secured and guaranteed with flexible cancellation policies",
                accent: "from-brand-accent/15 to-brand-accent/5",
              },
              {
                icon: HeartHandshake,
                title: isAr ? "خدمة شخصية" : "Personal Touch",
                desc: isAr
                  ? "فريق متخصص يرافقكم في كل خطوة لتلبية جميع احتياجاتكم ورغباتكم"
                  : "A dedicated team accompanies you every step of the way for all your needs",
                accent: "from-brand-primary/15 to-brand-secondary/5",
              },
            ].map((feature) => (
              <StaggerItem key={feature.title}>
                <div className="card-shine group flex h-full flex-col rounded-3xl border border-border/40 bg-card p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-primary/[0.06]">
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent}`}>
                    <feature.icon className="h-6 w-6 text-brand-primary" />
                  </div>
                  <h3 className="mb-3 text-lg font-bold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── DEALS ─── */}
      {deals.length > 0 && (
        <section className="relative py-28 md:py-32">
          {/* Warm tinted background */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-secondary/[0.02] via-brand-primary/[0.04] to-transparent" />

          <div className="relative mx-auto max-w-7xl px-6">
            <MotionDiv variant="fade-up" className="mb-5 text-center">
              <span className="section-label">
                {isAr ? "عروض حصرية" : "Exclusive Offers"}
              </span>
            </MotionDiv>
            <MotionDiv variant="fade-up" delay={0.1} className="mb-4 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                <span className="text-gradient">{t("sections.deals")}</span>
              </h2>
            </MotionDiv>
            <MotionDiv variant="fade-up" delay={0.15} className="mb-4 text-center">
              <div className="ornament mx-auto">
                <span className="diamond" />
              </div>
            </MotionDiv>
            <MotionDiv variant="fade-up" delay={0.2} className="mb-16 text-center">
              <p className="mx-auto max-w-xl text-muted-foreground">
                {isAr
                  ? "استفد من أفضل العروض والخصومات الحصرية على رحلاتنا المميزة"
                  : "Take advantage of exclusive deals and discounts on our premium trips"}
              </p>
            </MotionDiv>

            <StaggerContainer className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {deals.map((deal) => (
                <StaggerItem key={deal.id}>
                  <TripCard trip={deal} />
                </StaggerItem>
              ))}
            </StaggerContainer>

            <MotionDiv variant="fade-up" className="mt-14 text-center">
              <Link
                href="/deals"
                className="group inline-flex items-center gap-3 rounded-2xl border-2 border-brand-primary/15 px-8 py-4 text-sm font-semibold text-brand-primary transition-all duration-500 hover:border-brand-primary hover:bg-brand-primary hover:text-white hover:shadow-xl hover:shadow-brand-primary/15"
              >
                {isAr ? "جميع العروض" : "View All Offers"}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
            </MotionDiv>
          </div>
        </section>
      )}

      {/* ─── FEATURED DESTINATIONS ─── Large visual cards */}
      {trips.length >= 2 && (
        <section className="py-28 md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <MotionDiv variant="fade-up" className="mb-5 text-center">
              <span className="section-label">
                {isAr ? "وجهات مميزة" : "Featured Destinations"}
              </span>
            </MotionDiv>
            <MotionDiv variant="fade-up" delay={0.1} className="mb-4 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                {isAr ? "اكتشف عالماً من المغامرات" : "Discover a World of Adventure"}
              </h2>
            </MotionDiv>
            <MotionDiv variant="fade-up" delay={0.15} className="mb-16 text-center">
              <div className="ornament mx-auto">
                <span className="diamond" />
              </div>
            </MotionDiv>

            {/* Two large hero cards for first 2 trips */}
            <StaggerContainer className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {trips.slice(0, 2).map((trip) => (
                <StaggerItem key={trip.id}>
                  <DestinationHeroCard trip={trip} isAr={isAr} t={t} />
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Remaining trips in standard grid */}
            {trips.length > 2 && (
              <StaggerContainer className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-4">
                {trips.slice(2, 6).map((trip) => (
                  <StaggerItem key={trip.id}>
                    <TripCard trip={trip} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}

            <MotionDiv variant="fade-up" className="mt-14 text-center">
              <Link
                href="/trips"
                className="group inline-flex items-center gap-3 rounded-2xl border-2 border-brand-primary/15 px-8 py-4 text-sm font-semibold text-brand-primary transition-all duration-500 hover:border-brand-primary hover:bg-brand-primary hover:text-white hover:shadow-xl hover:shadow-brand-primary/15"
              >
                {isAr ? "جميع الرحلات" : "Explore All Trips"}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
            </MotionDiv>
          </div>
        </section>
      )}

      {/* ─── NO TRIPS FALLBACK ─── (when no trips exist) */}
      {trips.length === 0 && deals.length === 0 && (
        <section className="py-28">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
              <Plane className="h-9 w-9 text-muted-foreground" />
            </div>
            <h2 className="mb-3 text-2xl font-bold">{t("trip.noTrips")}</h2>
            <p className="text-muted-foreground">
              {isAr
                ? "تابعنا لمعرفة آخر الرحلات المتاحة"
                : "Follow us to stay updated on available trips"}
            </p>
          </div>
        </section>
      )}

      {/* ─── CTA SECTION ─── Elegant gradient card */}
      <section className="relative py-28 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <MotionDiv variant="scale-in">
            <div className="relative overflow-hidden rounded-[2rem] text-white">
              {/* Multi-layer background */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(160deg, var(--tenant-primary, #51487E) 0%, var(--tenant-secondary, #AB4E83) 100%)",
                }}
              />
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -end-24 h-80 w-80 rounded-full bg-white/[0.06] blur-[60px]" />
                <div className="absolute -bottom-24 -start-24 h-64 w-64 rounded-full bg-white/[0.06] blur-[60px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-brand-accent/10 blur-[40px]" />
              </div>

              <div className="relative z-10 px-8 py-16 text-center md:px-16 md:py-24">
                <span className="mb-6 inline-block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
                  {isAr ? "تواصل معنا" : "Get in Touch"}
                </span>
                <h2 className="mb-5 text-3xl font-bold tracking-tight md:text-5xl">
                  {isAr
                    ? "هل تبحث عن رحلة مميزة؟"
                    : "Looking for a Special Trip?"}
                </h2>
                <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-white/60 md:text-lg">
                  {isAr
                    ? "تواصل معنا مباشرة عبر واتساب وسنساعدك في اختيار الرحلة المناسبة لك"
                    : "Contact us directly via WhatsApp and we'll help you choose the perfect trip"}
                </p>

                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  {config.whatsapp_number && (
                    <a
                      href={`https://wa.me/${config.whatsapp_number.replace(/[^0-9+]/g, "")}?text=${encodeURIComponent(config.whatsapp_template || "مرحباً")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 rounded-2xl bg-white px-9 py-4.5 text-base font-semibold text-[#25D366] shadow-2xl shadow-black/10 transition-all duration-500 hover:scale-[1.03] hover:shadow-xl"
                    >
                      {t("common.whatsapp")}
                    </a>
                  )}
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/[0.08] px-8 py-4.5 text-base font-medium backdrop-blur-sm transition-all duration-500 hover:bg-white/15"
                  >
                    {t("common.contact")}
                  </Link>
                </div>
              </div>
            </div>
          </MotionDiv>
        </div>
      </section>
    </div>
  );
}

/* ─── Destination Hero Card ─── Large visual card with overlay text */
import Image from "next/image";

async function DestinationHeroCard({
  trip,
  isAr,
  t,
}: {
  trip: TripCardData;
  isAr: boolean;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  const title = isAr ? trip.title_ar : trip.title_en;
  const destination = isAr ? trip.destination_ar : trip.destination_en;

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group relative flex aspect-[4/3] overflow-hidden rounded-3xl md:aspect-[16/10]"
    >
      {trip.cover_image_url ? (
        <Image
          src={trip.cover_image_url}
          alt={title}
          fill
          className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/30 to-brand-secondary/30" />
      )}

      {/* Multi-layer overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 rtl:bg-gradient-to-l" />

      {/* Deal badge */}
      {trip.is_deal && (
        <div className="absolute start-5 top-5 flex items-center gap-1.5 rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-primary/30 backdrop-blur-sm">
          <Tag className="h-3 w-3" />
          {t("sections.deals")}
        </div>
      )}

      {/* Content overlay */}
      <div className="relative z-10 mt-auto w-full p-7 md:p-9">
        {destination && (
          <div className="mb-3 flex items-center gap-2 text-white/70">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-sm">{destination}</span>
          </div>
        )}
        <h3 className="mb-4 text-2xl font-bold leading-tight text-white md:text-3xl">
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-white/70">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {trip.duration_days} {t("trip.days")}
              </span>
            </div>
            {trip.price_from != null && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-white">
                  {trip.is_deal && trip.deal_price != null
                    ? trip.deal_price.toLocaleString()
                    : trip.price_from.toLocaleString()}
                </span>
                <span className="text-xs text-white/50">{t("trip.sar")}</span>
              </div>
            )}
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all duration-500 group-hover:bg-white group-hover:text-brand-primary group-hover:shadow-lg">
            <ArrowRight className="h-5 w-5 rtl:rotate-180" />
          </span>
        </div>
      </div>
    </Link>
  );
}
