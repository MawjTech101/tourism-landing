import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MapPin, Clock, Tag, ArrowUpRight } from "lucide-react";
import Image from "next/image";

export interface TripCardData {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  destination_ar: string | null;
  destination_en: string | null;
  duration_days: number;
  duration_nights: number;
  price_from: number | null;
  cover_image_url: string | null;
  is_deal: boolean;
  deal_price: number | null;
  is_ending_soon: boolean;
  deal_expiry: string | null;
}

export async function TripCard({ trip }: { trip: TripCardData }) {
  const locale = await getLocale();
  const t = await getTranslations();
  const isAr = locale === "ar";

  const title = isAr ? trip.title_ar : trip.title_en;
  const destination = isAr ? trip.destination_ar : trip.destination_en;

  // Calculate discount percentage
  const hasDiscount =
    trip.is_deal &&
    trip.deal_price != null &&
    trip.price_from != null &&
    trip.price_from > trip.deal_price;
  const discountPct = hasDiscount
    ? Math.round(
        ((trip.price_from! - trip.deal_price!) / trip.price_from!) * 100
      )
    : 0;

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="card-shine group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-primary/[0.06]"
    >
      {/* Cover Image */}
      <div className="relative h-56 overflow-hidden">
        {trip.cover_image_url ? (
          <Image
            src={trip.cover_image_url}
            alt={title}
            fill
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20" />
        )}

        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute start-4 top-4 flex flex-col gap-2">
          {trip.is_deal && (
            <div className="flex items-center gap-1.5 rounded-full bg-brand-primary/90 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-brand-primary/25 backdrop-blur-sm">
              <Tag className="h-3 w-3" />
              {t("sections.deals")}
            </div>
          )}
          {hasDiscount && discountPct > 0 && (
            <div className="rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
              -{discountPct}%
            </div>
          )}
        </div>

        {/* Arrow indicator */}
        <div className="absolute end-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-brand-primary opacity-0 shadow-lg backdrop-blur-sm transition-all duration-500 group-hover:opacity-100 group-hover:scale-100 scale-75">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-3 line-clamp-2 text-lg font-bold leading-snug tracking-tight transition-colors duration-300 group-hover:text-brand-primary">
          {title}
        </h3>

        <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted-foreground">
          {destination && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-accent/70" />
              <span className="line-clamp-1">{destination}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-brand-accent/70" />
            <span>
              {trip.duration_days} {t("trip.days")} / {trip.duration_nights}{" "}
              {t("trip.nights")}
            </span>
          </div>
        </div>

        {/* Price (deals only) + CTA */}
        <div className="mt-auto flex items-end justify-between border-t border-border/40 pt-5">
          {trip.is_deal && trip.deal_price != null ? (
            <div>
              <span className="section-label text-[10px]">{t("trip.from")}</span>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-brand-primary">
                  {trip.deal_price.toLocaleString()}
                </span>
                {trip.price_from != null && (
                  <span className="text-sm text-muted-foreground/60 line-through">
                    {trip.price_from.toLocaleString()}
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground">
                  {t("trip.sar")}
                </span>
              </div>
            </div>
          ) : (
            <div />
          )}

          <span className="rounded-xl bg-brand-primary/[0.06] px-4 py-2.5 text-sm font-semibold text-brand-primary transition-all duration-500 group-hover:bg-brand-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-brand-primary/20">
            {t("common.viewDetails")}
          </span>
        </div>
      </div>
    </Link>
  );
}
