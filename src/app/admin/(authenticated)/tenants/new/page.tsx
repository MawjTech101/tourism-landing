import { requireAdmin } from "@/lib/auth/guard";
import { TenantForm } from "@/components/admin/tenant-form";

export default async function NewTenantPage() {
  const { platformUser } = await requireAdmin();

  if (platformUser.role !== "super_admin") {
    return (
      <div className="text-muted-foreground">
        You need super admin access to create tenants.
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Create New Tenant</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Set up a new tenant with their own website and admin access.
      </p>
      <TenantForm />
    </div>
  );
}
