import { requireAuth } from "@/lib/auth/guard";
import { getTenantSlug } from "@/lib/tenant/config";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import type { PlatformUser } from "@/lib/tenant/types";

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth gate — redirects to login if not authenticated
  const user = await requireAuth();

  // Fetch admin context for UI (non-blocking — won't redirect on failure)
  const supabase = await createClient();
  const { data: platformUsers } = await supabase
    .from("platform_users")
    .select("*")
    .eq("auth_id", user.id);

  const isSuperAdmin = (platformUsers || []).some(
    (pu: PlatformUser) => pu.role === "super_admin" && pu.is_active
  );

  const currentSlug = await getTenantSlug();

  let allTenants: Array<{ id: string; slug: string; name: string }> = [];
  if (isSuperAdmin) {
    const { data } = await supabase
      .from("tenants")
      .select("id, slug, name")
      .eq("is_active", true)
      .order("name");
    allTenants = data || [];
  }

  return (
    <SidebarProvider>
      <AdminSidebar isSuperAdmin={isSuperAdmin} />
      <SidebarInset>
        <AdminTopbar
          isSuperAdmin={isSuperAdmin}
          currentSlug={currentSlug}
          tenants={allTenants}
        />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
