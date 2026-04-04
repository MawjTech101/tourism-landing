import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Plus, Building2, Globe, CheckCircle2, XCircle } from "lucide-react";

export default async function TenantsPage() {
  const { platformUser } = await requireAdmin();

  if (platformUser.role !== "super_admin") {
    return (
      <div className="text-muted-foreground">
        You need super admin access to manage tenants.
      </div>
    );
  }

  const supabase = await createClient();

  const { data: tenants, error } = await supabase
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-destructive">
        Failed to load tenants: {error.message}
      </div>
    );
  }

  const { data: configs } = await supabase
    .from("site_config")
    .select("tenant_id, company_name_en, company_name_ar, color_primary");

  const configMap = new Map(
    (configs ?? []).map((c) => [c.tenant_id, c])
  );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tenants</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all tenants on the platform
          </p>
        </div>
        <Button asChild className="rounded-xl shadow-sm">
          <Link href="/admin/tenants/new">
            <Plus className="me-2 h-4 w-4" />
            Add Tenant
          </Link>
        </Button>
      </div>

      {(!tenants || tenants.length === 0) ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Building2 className="h-7 w-7 text-muted-foreground/60" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">No tenants yet</h2>
          <p className="text-sm text-muted-foreground">
            Create your first tenant to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => {
            const cfg = configMap.get(tenant.id);
            return (
              <Card
                key={tenant.id}
                className="group overflow-hidden border-border/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.03]"
              >
                <div
                  className="h-1.5"
                  style={{ backgroundColor: cfg?.color_primary || "#51487E" }}
                />
                <CardContent className="pt-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{tenant.name}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {cfg?.company_name_en || tenant.slug}
                      </p>
                    </div>
                    {tenant.is_active ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                        <XCircle className="h-3 w-3" />
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" />
                      <span className="font-mono text-xs">{tenant.slug}</span>
                      {tenant.custom_domain && (
                        <span className="text-xs">
                          &middot; {tenant.custom_domain}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                        {tenant.plan}
                      </span>
                      <span className="text-xs">
                        Created{" "}
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </span>
                    </div>
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
