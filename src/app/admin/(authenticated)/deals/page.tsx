import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/tenant/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag, Pencil, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Deal {
  id: string;
  title_en: string;
  title_ar: string;
  destination_en: string | null;
  destination_ar: string | null;
  price_from: number | null;
  deal_price: number | null;
  deal_expiry: string | null;
  is_ending_soon: boolean;
  status: string;
  cover_image_url: string | null;
}

export default async function DealsPage() {
  const tenant = await getTenant();

  if (!tenant) {
    return <div className="text-muted-foreground">Tenant not found.</div>;
  }

  const supabase = await createClient();

  const { data: deals, error } = await supabase
    .from("trips")
    .select(
      "id, title_en, title_ar, destination_en, destination_ar, price_from, deal_price, deal_expiry, is_ending_soon, status, cover_image_url"
    )
    .eq("tenant_id", tenant.id)
    .eq("is_deal", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="text-destructive">
        Failed to load deals: {error.message}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Deals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trips marked as deals appear here. Edit a trip and enable the deal toggle to create one.
        </p>
      </div>

      {!deals || deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Tag className="h-7 w-7 text-muted-foreground/60" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">No deals yet</h2>
          <p className="text-sm text-muted-foreground">
            Mark trips as deals from the trip editor.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(deals as Deal[]).map((deal) => {
            const discount =
              deal.price_from && deal.deal_price
                ? Math.round(((deal.price_from - deal.deal_price) / deal.price_from) * 100)
                : null;

            return (
              <Card
                key={deal.id}
                className="group relative overflow-hidden border-border/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.03]"
              >
                {deal.is_ending_soon && (
                  <div className="absolute top-3 end-3 z-10 flex items-center gap-1.5 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                    <AlertTriangle className="h-3 w-3" />
                    Ending Soon
                  </div>
                )}

                {deal.cover_image_url ? (
                  <div className="relative h-36 w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={deal.cover_image_url}
                      alt={deal.title_en || ""}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    {discount && (
                      <div className="absolute bottom-3 start-3 rounded-lg bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                        -{discount}%
                      </div>
                    )}
                  </div>
                ) : (
                  discount && (
                    <div className="absolute top-3 start-3 z-10 rounded-lg bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                      -{discount}%
                    </div>
                  )
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base font-semibold leading-snug">
                        {deal.title_en || deal.title_ar}
                      </CardTitle>
                      {deal.destination_en && (
                        <CardDescription className="mt-1">
                          {deal.destination_en}
                        </CardDescription>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        deal.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {deal.status}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    {deal.price_from != null && (
                      <span className="text-sm text-muted-foreground line-through">
                        {deal.price_from.toLocaleString()} OMR
                      </span>
                    )}
                    {deal.deal_price != null && (
                      <span className="text-lg font-bold text-foreground">
                        {deal.deal_price.toLocaleString()} OMR
                      </span>
                    )}
                  </div>

                  {deal.deal_expiry && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Expires{" "}
                      {new Date(deal.deal_expiry).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  )}

                  <div className="pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="rounded-lg"
                    >
                      <Link href={`/admin/trips/${deal.id}/edit`}>
                        <Pencil className="me-1.5 h-3.5 w-3.5" />
                        Edit Trip
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
