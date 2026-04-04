import { getTenantConfig, getTenant } from "@/lib/tenant/config";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  const config = await getTenantConfig();
  const tenant = await getTenant();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customize your website branding, colors, and contact information
        </p>
      </div>
      <div className="rounded-xl border border-border/40 bg-card p-6 md:p-8">
        <SettingsForm
          initialConfig={config}
          tenantId={tenant?.id || ""}
        />
      </div>
    </div>
  );
}
