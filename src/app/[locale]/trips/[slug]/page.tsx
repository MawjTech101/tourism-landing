import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getTenant, getTenantConfig } from "@/lib/tenant/config";
import { TripCard, type TripCardData } from "@/components/shared/trip-card";
import {
  MotionDiv,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Eye,
  Car,
  Coffee,
  ShoppingBag,
  Utensils,
  CheckCircle2,
  XCircle,
  Star,
  Hotel,
  MessageCircle,
  Calendar,
  ArrowRight,
  Wallet,
  Users,
} from "lucide-react";

const activityIcons: Record<string, React.ElementType> = {
  sightseeing: Eye,
  transport: Car,
  free: Coffee,
  shopping: ShoppingBag,
  meal: Utensils,
};

interface TripDetail {
  id: string;
  tenant_id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  destination_ar: string | null;
  destination_en: string | null;
  duration_days: number;
  duration_nights: number;
  price_from: number | null;
  price_to: number | null;
  cover_image_url: string | null;
  description_ar: string | null;
  description_en: string | null;
  inclusions: { text_ar: string; text_en: string }[] | null;
  exclusions: { text_ar: string; text_en: string }[] | null;
  tags: string[] | null;
  is_deal: boolean;
  deal_price: number | null;
  deal_expiry: string | null;
  is_ending_soon: boolean;
  status: string;
  meta_title: string | null;
  meta_description: string | null;
}

interface ItineraryDay {
  id: string;
  trip_id: string;
  day_number: number;
  title_ar: string | null;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  city_ar: string | null;
  city_en: string | null;
}

interface ItineraryActivity {
  id: string;
  day_id: string;
  sort_order: number;
  title_ar: string | null;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  activity_type: string | null;
}

interface TripHotel {
  hotel_id: string;
  nights: number;
  sort_order: number;
  hotels: {
    id: string;
    name: string;
    city_ar: string | null;
    city_en: string | null;
    stars: number;
    photo_url: string | null;
  };
}

interface TripMedia {
  id: string;
  url: string;
  alt_text_ar: string | null;
  alt_text_en: string | null;
  sort_order: number;
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations();
  const isAr = locale === "ar";
  const tenant = await getTenant();
  const config = await getTenantConfig();

  if (!tenant) notFound();

  const supabase = await createClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!trip) notFound();

  const tripData = trip as TripDetail;

  const [itineraryRes, hotelsRes, mediaRes, relatedRes] = await Promise.all([
    supabase
      .from("itinerary_days")
      .select("*")
      .eq("trip_id", tripData.id)
      .order("day_number", { ascending: true }),
    supabase
      .from("trip_hotels")
      .select(
        "hotel_id, nights, sort_order, hotels(id, name, city_ar, city_en, stars, photo_url)"
      )
      .eq("trip_id", tripData.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("trip_media")
      .select("*")
      .eq("trip_id", tripData.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("trips")
      .select(
        "id, slug, title_ar, title_en, destination_ar, destination_en, duration_days, duration_nights, price_from, cover_image_url, is_deal, deal_price, is_ending_soon, deal_expiry"
      )
      .eq("tenant_id", tenant.id)
      .eq("status", "active")
      .neq("id", tripData.id)
      .limit(3),
  ]);

  const itineraryDays = (itineraryRes.data as ItineraryDay[]) || [];
  const tripHotels = (hotelsRes.data ?? []) as unknown as TripHotel[];
  const tripMedia = (mediaRes.data as TripMedia[]) || [];
  const relatedTrips = (relatedRes.data as TripCardData[]) || [];

  let activitiesByDay: Record<string, ItineraryActivity[]> = {};
  if (itineraryDays.length > 0) {
    const dayIds = itineraryDays.map((d) => d.id);
    const { data: activities } = await supabase
      .from("itinerary_activities")
      .select("*")
      .in("day_id", dayIds)
      .order("sort_order", { ascending: true });

    if (activities) {
      activitiesByDay = (activities as ItineraryActivity[]).reduce(
        (acc, activity) => {
          if (!acc[activity.day_id]) acc[activity.day_id] = [];
          acc[activity.day_id].push(activity);
          return acc;
        },
        {} as Record<string, ItineraryActivity[]>
      );
    }
  }

  const title = isAr ? tripData.title_ar : tripData.title_en;
  const destination = isAr ? tripData.destination_ar : tripData.destination_en;
  const description = isAr
    ? tripData.description_ar
    : tripData.description_en;
  const whatsappNumber =
    config.whatsapp_number?.replace(/[^0-9+]/g, "") || "";
  const whatsappMessage = isAr
    ? `مرحباً، أود الاستفسار عن رحلة: ${tripData.title_ar}`
    : `Hello, I'd like to inquire about trip: ${tripData.title_en}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="pb-28">
      {/* ─── HERO ─── */}
      <section className="relative flex min-h-[65vh] items-end overflow-hidden">
        {tripData.cover_image_url ? (
          <Image
            src={tripData.cover_image_url}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, var(--tenant-primary, #51487E) 0%, var(--tenant-secondary, #AB4E83) 100%)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-14 pt-36">
          {tripData.tags && tripData.tags.length > 0 && (
            <MotionDiv variant="fade-up" delay={0.1}>
              <div className="mb-5 flex flex-wrap gap-2">
                {tripData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/15 bg-white/[0.08] px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-xl"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </MotionDiv>
          )}

          <MotionDiv variant="fade-up" delay={0.2}>
            <h1 className="mb-5 text-4xl font-bold tracking-tight text-white md:text-6xl">
              {title}
            </h1>
          </MotionDiv>

          <MotionDiv variant="fade-up" delay={0.3}>
            <div className="flex flex-wrap items-center gap-3 text-white/90">
              {destination && (
                <div className="flex items-center gap-2 rounded-full bg-white/[0.08] px-4 py-2.5 text-sm backdrop-blur-xl">
                  <MapPin className="h-4 w-4 text-brand-accent" />
                  <span>{destination}</span>
                </div>
              )}
              <div className="flex items-center gap-2 rounded-full bg-white/[0.08] px-4 py-2.5 text-sm backdrop-blur-xl">
                <Clock className="h-4 w-4 text-brand-accent" />
                <span>
                  {tripData.duration_days} {t("trip.days")} / {tripData.duration_nights} {t("trip.nights")}
                </span>
              </div>
              {tripData.is_deal && tripData.deal_price != null && (
                <div className="flex items-center gap-2 rounded-full bg-white/[0.08] px-4 py-2.5 backdrop-blur-xl">
                  <Wallet className="h-4 w-4 text-brand-accent" />
                  <span className="text-lg font-bold">
                    {tripData.deal_price.toLocaleString()} {t("trip.sar")}
                  </span>
                  {tripData.price_from != null && (
                    <span className="text-sm line-through text-white/40">
                      {tripData.price_from.toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* ─── CONTENT ─── Two-column editorial layout */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-16 py-14 lg:grid-cols-3">
          {/* Main content — 2/3 */}
          <div className="lg:col-span-2">
            {/* Description */}
            {description && (
              <MotionDiv variant="fade-up">
                <section className="mb-16">
                  <p className="prose-elegant whitespace-pre-line text-[15px] leading-[1.9] text-muted-foreground">
                    {description}
                  </p>
                </section>
              </MotionDiv>
            )}

            {/* Itinerary */}
            {itineraryDays.length > 0 && (
              <section className="mb-16">
                <MotionDiv variant="fade-up">
                  <div className="mb-10">
                    <span className="section-label">{isAr ? "البرنامج اليومي" : "Day by Day"}</span>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight">{t("trip.itinerary")}</h2>
                  </div>
                </MotionDiv>

                <div className="relative">
                  <div className="absolute start-6 top-3 bottom-3 w-px bg-gradient-to-b from-brand-accent/40 via-brand-accent/15 to-transparent" />

                  <StaggerContainer className="space-y-5" staggerDelay={0.06}>
                    {itineraryDays.map((day) => {
                      const dayTitle = isAr ? day.title_ar : day.title_en;
                      const dayDesc = isAr ? day.description_ar : day.description_en;
                      const dayCity = isAr ? day.city_ar : day.city_en;
                      const dayActivities = activitiesByDay[day.id] || [];

                      return (
                        <StaggerItem key={day.id}>
                          <div className="relative flex gap-5 ps-16">
                            <div className="absolute start-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-sm font-bold text-white shadow-lg shadow-brand-primary/15">
                              {day.day_number}
                            </div>

                            <div className="flex-1 rounded-2xl border border-border/40 bg-card p-7 transition-all duration-500 hover:shadow-lg hover:shadow-brand-primary/[0.04]">
                              <div className="mb-3">
                                {dayTitle && (
                                  <h3 className="text-lg font-bold tracking-tight">{dayTitle}</h3>
                                )}
                                {dayCity && (
                                  <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5 text-brand-accent/60" />
                                    {dayCity}
                                  </div>
                                )}
                              </div>

                              {dayDesc && (
                                <p className="mb-5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                                  {dayDesc}
                                </p>
                              )}

                              {dayActivities.length > 0 && (
                                <div className="space-y-2.5">
                                  {dayActivities.map((activity) => {
                                    const actTitle = isAr ? activity.title_ar : activity.title_en;
                                    const actDesc = isAr ? activity.description_ar : activity.description_en;
                                    const IconComponent = activityIcons[activity.activity_type || "sightseeing"] || Eye;

                                    return (
                                      <div key={activity.id} className="flex gap-3 rounded-xl bg-muted/40 p-3.5">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/8">
                                          <IconComponent className="h-4 w-4 text-brand-primary" />
                                        </div>
                                        <div>
                                          {actTitle && <p className="text-sm font-semibold">{actTitle}</p>}
                                          {actDesc && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{actDesc}</p>}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </StaggerItem>
                      );
                    })}
                  </StaggerContainer>
                </div>
              </section>
            )}

            {/* Hotels */}
            {tripHotels.length > 0 && (
              <section className="mb-16">
                <MotionDiv variant="fade-up">
                  <div className="mb-10">
                    <span className="section-label">{isAr ? "الإقامة" : "Accommodation"}</span>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight">{t("trip.hotels")}</h2>
                  </div>
                </MotionDiv>

                <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {tripHotels.map((th) => {
                    const hotel = th.hotels;
                    if (!hotel) return null;
                    const hotelCity = isAr ? hotel.city_ar : hotel.city_en;

                    return (
                      <StaggerItem key={hotel.id}>
                        <div className="card-shine group overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
                          {hotel.photo_url ? (
                            <div className="relative h-40 overflow-hidden">
                              <Image
                                src={hotel.photo_url}
                                alt={hotel.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                            </div>
                          ) : (
                            <div className="h-40 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10" />
                          )}
                          <div className="p-5">
                            <h3 className="text-base font-bold">{hotel.name}</h3>
                            {hotelCity && (
                              <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 text-brand-accent/60" />
                                {hotelCity}
                              </div>
                            )}
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: hotel.stars || 0 }).map((_, i) => (
                                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                              <span className="rounded-full bg-brand-primary/[0.06] px-3 py-1 text-xs font-semibold text-brand-primary">
                                {th.nights} {t("trip.nights")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              </section>
            )}

            {/* Inclusions / Exclusions */}
            {((tripData.inclusions && tripData.inclusions.length > 0) ||
              (tripData.exclusions && tripData.exclusions.length > 0)) && (
              <section className="mb-16">
                <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {tripData.inclusions && tripData.inclusions.length > 0 && (
                    <StaggerItem>
                      <div className="rounded-2xl border border-green-200/40 bg-green-50/40 p-7 dark:border-green-900/20 dark:bg-green-950/15">
                        <h3 className="mb-5 flex items-center gap-2 font-bold text-green-700 dark:text-green-400">
                          <CheckCircle2 className="h-5 w-5" />
                          {t("trip.included")}
                        </h3>
                        <ul className="space-y-3">
                          {tripData.inclusions.map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                              <span className="text-sm leading-relaxed">{isAr ? item.text_ar : item.text_en}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </StaggerItem>
                  )}
                  {tripData.exclusions && tripData.exclusions.length > 0 && (
                    <StaggerItem>
                      <div className="rounded-2xl border border-red-200/40 bg-red-50/40 p-7 dark:border-red-900/20 dark:bg-red-950/15">
                        <h3 className="mb-5 flex items-center gap-2 font-bold text-red-700 dark:text-red-400">
                          <XCircle className="h-5 w-5" />
                          {t("trip.notIncluded")}
                        </h3>
                        <ul className="space-y-3">
                          {tripData.exclusions.map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                              <span className="text-sm leading-relaxed">{isAr ? item.text_ar : item.text_en}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </StaggerItem>
                  )}
                </StaggerContainer>
              </section>
            )}
          </div>

          {/* ─── SIDEBAR ─── Quick facts + CTA */}
          <div className="lg:col-span-1">
            <MotionDiv variant="fade-up" delay={0.2}>
              <div className="sticky top-24 space-y-6">
                {/* Quick Facts Card */}
                <div className="rounded-2xl border border-border/40 bg-card p-7">
                  <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {isAr ? "تفاصيل سريعة" : "Quick Facts"}
                  </h3>
                  <div className="space-y-4">
                    {destination && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/[0.06]">
                          <MapPin className="h-4 w-4 text-brand-primary" />
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                            {isAr ? "الوجهة" : "Destination"}
                          </span>
                          <p className="text-sm font-medium">{destination}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/[0.06]">
                        <Clock className="h-4 w-4 text-brand-primary" />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                          {isAr ? "المدة" : "Duration"}
                        </span>
                        <p className="text-sm font-medium">
                          {tripData.duration_days} {t("trip.days")} / {tripData.duration_nights} {t("trip.nights")}
                        </p>
                      </div>
                    </div>
                    {tripHotels.length > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/[0.06]">
                          <Hotel className="h-4 w-4 text-brand-primary" />
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                            {isAr ? "الفنادق" : "Hotels"}
                          </span>
                          <p className="text-sm font-medium">
                            {tripHotels.length} {isAr ? "فندق" : tripHotels.length === 1 ? "hotel" : "hotels"}
                          </p>
                        </div>
                      </div>
                    )}
                    {itineraryDays.length > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/[0.06]">
                          <Calendar className="h-4 w-4 text-brand-primary" />
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                            {isAr ? "البرنامج" : "Itinerary"}
                          </span>
                          <p className="text-sm font-medium">
                            {itineraryDays.length} {isAr ? "يوم مفصل" : "detailed days"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Card */}
                <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
                  <div
                    className="p-7 text-white"
                    style={{
                      background:
                        "linear-gradient(160deg, var(--tenant-primary, #51487E), var(--tenant-secondary, #AB4E83))",
                    }}
                  >
                    {tripData.is_deal && tripData.deal_price != null ? (
                      <>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                          {t("trip.from")}
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-4xl font-bold tracking-tight">
                            {tripData.deal_price.toLocaleString()}
                          </span>
                          <span className="text-sm text-white/60">{t("trip.sar")}</span>
                        </div>
                        {tripData.price_from != null && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm line-through text-white/40">
                              {tripData.price_from.toLocaleString()} {t("trip.sar")}
                            </span>
                            <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-bold backdrop-blur-sm">
                              -{Math.round(((tripData.price_from - tripData.deal_price) / tripData.price_from) * 100)}%
                            </span>
                          </div>
                        )}
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-white/40">
                          <Users className="h-3 w-3" />
                          {isAr ? "للشخص الواحد" : "Per person"}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm font-medium text-white/70">
                        {isAr ? "تواصل معنا للحصول على السعر" : "Contact us for pricing"}
                      </p>
                    )}
                  </div>

                  <div className="p-5">
                    {whatsappNumber && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#25D366]/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                      >
                        <MessageCircle className="h-5 w-5" fill="white" />
                        {t("common.whatsapp")}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </MotionDiv>
          </div>
        </div>

        {/* Photo Gallery */}
        {tripMedia.length > 0 && (
          <section className="pb-16">
            <MotionDiv variant="fade-up">
              <div className="mb-10">
                <span className="section-label">{isAr ? "معرض الصور" : "Photo Gallery"}</span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">{t("trip.gallery")}</h2>
              </div>
            </MotionDiv>
            <StaggerContainer className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {tripMedia.map((media) => {
                const altText = isAr ? media.alt_text_ar : media.alt_text_en;
                return (
                  <StaggerItem key={media.id}>
                    <div className="group relative aspect-square overflow-hidden rounded-2xl">
                      <Image
                        src={media.url}
                        alt={altText || title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </section>
        )}

        {/* Related Trips */}
        {relatedTrips.length > 0 && (
          <section className="pb-16">
            <MotionDiv variant="fade-up">
              <div className="mb-10">
                <span className="section-label">{isAr ? "رحلات مشابهة" : "You Might Also Like"}</span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">{t("sections.relatedTrips")}</h2>
              </div>
            </MotionDiv>
            <StaggerContainer className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {relatedTrips.map((relTrip) => (
                <StaggerItem key={relTrip.id}>
                  <TripCard trip={relTrip} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        )}
      </div>

      {/* Sticky bottom CTA (mobile only, desktop has sidebar) */}
      {whatsappNumber && (
        <div className="fixed inset-x-0 bottom-0 z-40 glass border-t border-border/30 lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
            <div className="hidden sm:block">
              <p className="text-sm font-bold">{title}</p>
              <p className="text-xs text-muted-foreground">
                {tripData.is_deal && tripData.deal_price != null
                  ? `${tripData.deal_price.toLocaleString()} ${t("trip.sar")}`
                  : ""}
              </p>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#25D366]/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" fill="white" />
              {t("common.whatsapp")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
