import { requireAuth } from "@/lib/auth/guard";
import { getTenant } from "@/lib/tenant/config";
import { TripForm } from "@/components/admin/trip-form";

export default async function NewTripPage() {
  await requireAuth();
  const tenant = await getTenant();

  if (!tenant) {
    return <p className="text-destructive">Tenant not found.</p>;
  }

  return <TripForm mode="create" tenantId={tenant.id} />;
}
