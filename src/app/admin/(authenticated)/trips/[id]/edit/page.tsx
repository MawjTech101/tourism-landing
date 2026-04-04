import { requireAuth } from "@/lib/auth/guard";
import { getTenant } from "@/lib/tenant/config";
import { createClient } from "@/lib/supabase/server";
import { TripForm } from "@/components/admin/trip-form";
import { notFound } from "next/navigation";
import type { TripWithRelations } from "@/lib/types/trips";

interface EditTripPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTripPage({ params }: EditTripPageProps) {
  await requireAuth();
  const tenant = await getTenant();
  const { id } = await params;

  if (!tenant) {
    return <p className="text-destructive">Tenant not found.</p>;
  }

  const supabase = await createClient();

  const { data: trip, error } = await supabase
    .from("trips")
    .select(
      `
      *,
      trip_hotels (
        id,
        trip_id,
        hotel_id,
        nights,
        sort_order,
        hotels (
          id,
          tenant_id,
          name,
          city_ar,
          city_en,
          stars,
          photo_url,
          website_url
        )
      ),
      itinerary_days (
        id,
        trip_id,
        day_number,
        title_ar,
        title_en,
        description_ar,
        description_en,
        city_ar,
        city_en,
        itinerary_activities (
          id,
          day_id,
          sort_order,
          title_ar,
          title_en,
          description_ar,
          description_en,
          activity_type
        )
      ),
      trip_media (
        id,
        trip_id,
        url,
        alt_text_ar,
        alt_text_en,
        sort_order
      )
    `,
    )
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .single();

  if (error || !trip) {
    notFound();
  }

  return (
    <TripForm
      mode="edit"
      trip={trip as unknown as TripWithRelations}
      tenantId={tenant.id}
    />
  );
}
