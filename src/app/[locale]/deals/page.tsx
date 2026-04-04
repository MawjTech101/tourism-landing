import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/tenant/config";
import { TripCard, type TripCardData } from "@/components/shared/trip-card";
import { CountdownTimer } from "@/components/shared/countdown-timer";
import {
  MotionDiv,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import { Link } from "@/i18n/navigation";
import { Tag, Flame } from "lucide-react";

export default async function DealsPage() {
  const locale = await getLocale();
  const t = await getTranslations();
  const isAr = locale === "ar";
  const tenant = await getTenant();

  let deals: TripCardData[] = [];
  let endingSoonDeals: TripCardData[] = [];

  if (tenant) {
    const supabase = await createClient();

    const { data } = await supabase
      .from("trips")
      .select(
        "id, slug, title_ar, title_en, destination_ar, destination_en, duration_days, duration_nights, price_from, cover_image_url, is_deal, deal_price, is_ending_soon, deal_expiry"
      )
      .eq("tenant_id", tenant.id)
      .eq("status", "active")
      .eq("is_deal", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    const allDeals = (data as TripCardData[]) || [];
    endingSoonDeals = allDeals.filter((d) => d.is_ending_soon);
    deals = allDeals.filter((d) => !d.is_ending_soon);
  }

  const hasAnyDeals = deals.length > 0 || endingSoonDeals.length > 0;

  return (
    <div>
      {/* ─── Page Header ─── */}
      <section className="relative overflow-hidden pt-36 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/[0.03] via-brand-secondary/[0.02] to-transparent" />
        <div className="absolute -top-40 -end-40 h-80 w-80 rounded-full bg-brand-secondary/[0.04] blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <MotionDiv variant="fade-up">
            <span className="section-label">
              {t("common.deals")}
            </span>
          </MotionDiv>
          <MotionDiv variant="fade-up" delay={0.1}>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
              <span className="text-gradient">{t("sections.deals")}</span>
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
                ? "استفد من أفضل العروض والخصومات على الرحلات"
                : "Take advantage of the best deals and discounts on trips"}
            </p>
          </MotionDiv>
        </div>
      </section>

      {/* ─── Ending Soon ─── */}
      {endingSoonDeals.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <MotionDiv variant="fade-up" className="mb-10">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/8">
                <Flame className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <span className="section-label text-red-500/80">{isAr ? "عرض محدود" : "Limited Time"}</span>
                <h2 className="text-2xl font-bold tracking-tight">
                  {t("sections.endingSoon")}
                </h2>
              </div>
            </div>
          </MotionDiv>

          <StaggerContainer className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {endingSoonDeals.map((deal) => (
              <StaggerItem key={deal.id}>
                <div className="flex flex-col">
                  <TripCard trip={deal} />
                  {deal.deal_expiry && (
                    <div className="mt-4 flex justify-center">
                      <CountdownTimer expiryDate={deal.deal_expiry} />
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      {/* ─── All Deals ─── */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        {deals.length > 0 ? (
          <>
            {endingSoonDeals.length > 0 && (
              <MotionDiv variant="fade-up" className="mb-10">
                <span className="section-label">{isAr ? "المزيد من العروض" : "More Offers"}</span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">
                  {t("sections.deals")}
                </h2>
              </MotionDiv>
            )}
            <StaggerContainer className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {deals.map((deal) => (
                <StaggerItem key={deal.id}>
                  <TripCard trip={deal} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </>
        ) : (
          !hasAnyDeals && (
            <MotionDiv variant="fade-up">
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
                  <Tag className="h-9 w-9 text-muted-foreground" />
                </div>
                <h2 className="mb-3 text-xl font-bold">{t("deal.noDeals")}</h2>
                <p className="mb-10 text-muted-foreground">
                  {isAr
                    ? "تابعنا لمعرفة آخر العروض والخصومات"
                    : "Follow us to stay updated on deals and discounts"}
                </p>
                <Link
                  href="/trips"
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand-primary px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-brand-primary/15 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
                >
                  {t("common.trips")}
                </Link>
              </div>
            </MotionDiv>
          )
        )}
      </section>
    </div>
  );
}
