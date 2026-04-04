import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/tenant/config";
import { TripCard, type TripCardData } from "@/components/shared/trip-card";
import {
  MotionDiv,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import { Plane } from "lucide-react";

export default async function TripsPage() {
  const locale = await getLocale();
  const t = await getTranslations();
  const isAr = locale === "ar";
  const tenant = await getTenant();

  let trips: TripCardData[] = [];

  if (tenant) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("trips")
      .select(
        "id, slug, title_ar, title_en, destination_ar, destination_en, duration_days, duration_nights, price_from, cover_image_url, is_deal, deal_price, is_ending_soon, deal_expiry"
      )
      .eq("tenant_id", tenant.id)
      .eq("status", "active")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    trips = (data as TripCardData[]) || [];
  }

  return (
    <div>
      {/* ─── Page Header ─── */}
      <section className="relative overflow-hidden pt-36 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/[0.03] via-brand-secondary/[0.02] to-transparent" />
        <div className="absolute -top-40 -end-40 h-80 w-80 rounded-full bg-brand-primary/[0.04] blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <MotionDiv variant="fade-up">
            <span className="section-label">
              {t("common.trips")}
            </span>
          </MotionDiv>
          <MotionDiv variant="fade-up" delay={0.1}>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
              {t("sections.allTrips")}
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
                ? "اختر وجهتك المفضلة واحجز رحلتك القادمة"
                : "Choose your favorite destination and book your next trip"}
            </p>
          </MotionDiv>
        </div>
      </section>

      {/* ─── Trips Grid ─── */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        {trips.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <StaggerItem key={trip.id}>
                <TripCard trip={trip} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <MotionDiv variant="fade-up">
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
                <Plane className="h-9 w-9 text-muted-foreground" />
              </div>
              <h2 className="mb-3 text-xl font-bold">{t("trip.noTrips")}</h2>
              <p className="text-muted-foreground">
                {isAr
                  ? "تابعنا لمعرفة آخر الرحلات المتاحة"
                  : "Follow us to stay updated on available trips"}
              </p>
            </div>
          </MotionDiv>
        )}
      </section>
    </div>
  );
}
