import { requireAuth } from "@/lib/auth/guard";
import { getTenant } from "@/lib/tenant/config";
import { createClient } from "@/lib/supabase/server";
import { TripListTable } from "@/components/admin/trip-list-table";
import { Button } from "@/components/ui/button";
import { Plus, Plane } from "lucide-react";
import Link from "next/link";
import type { Trip } from "@/lib/types/trips";

export default async function TripsPage() {
  await requireAuth();
  const tenant = await getTenant();

  if (!tenant) {
    return <p className="text-destructive">Tenant not found.</p>;
  }

  const supabase = await createClient();

  const { data: trips, error } = await supabase
    .from("trips")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-destructive">Failed to load trips: {error.message}</p>;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trips</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your travel packages and itineraries
          </p>
        </div>
        <Button asChild className="rounded-xl shadow-sm">
          <Link href="/admin/trips/new">
            <Plus className="me-2 h-4 w-4" />
            Add Trip
          </Link>
        </Button>
      </div>

      {trips && trips.length > 0 ? (
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <TripListTable trips={trips as Trip[]} tenantId={tenant.id} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Plane className="h-7 w-7 text-muted-foreground/60" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">No trips yet</h2>
          <p className="mb-8 max-w-sm text-sm text-muted-foreground">
            Create your first trip package to start showcasing your travel
            offerings to customers.
          </p>
          <Button asChild className="rounded-xl shadow-sm">
            <Link href="/admin/trips/new">
              <Plus className="me-2 h-4 w-4" />
              Create First Trip
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
