import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { AdminContext, PlatformUser } from "@/lib/tenant/types";

export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return user;
}

export async function requireAdmin(): Promise<AdminContext> {
  // Single client for all queries — avoids cookie race conditions
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Fetch ALL platform_user records for this auth user (may span tenants)
  const { data: platformUsers, error: puError } = await supabase
    .from("platform_users")
    .select("*")
    .eq("auth_id", user.id);

  if (puError || !platformUsers || platformUsers.length === 0) {
    redirect("/admin/login?error=unauthorized");
  }

  const isSuperAdmin = platformUsers.some(
    (pu: PlatformUser) => pu.role === "super_admin" && pu.is_active
  );

  // Resolve current tenant from middleware header
  const headerStore = await headers();
  const slug = headerStore.get("x-tenant-slug") || "otolat";

  const { data: currentTenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .single();

  // Find the record matching the current tenant
  let platformUser = platformUsers.find(
    (pu: PlatformUser) => pu.tenant_id === currentTenant?.id
  );

  // Super admin visiting a tenant they don't have a record on — use their home record
  if (!platformUser && isSuperAdmin) {
    platformUser = platformUsers.find(
      (pu: PlatformUser) => pu.role === "super_admin"
    );
  }

  // Regular admin with no matching record for this tenant
  if (!platformUser) {
    redirect("/admin/login?error=unauthorized");
  }

  return {
    user,
    platformUser: platformUser as PlatformUser,
    isSuperAdmin,
  };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: platformUsers } = await supabase
    .from("platform_users")
    .select("*")
    .eq("auth_id", user.id);

  if (!platformUsers || platformUsers.length === 0) return null;

  const primary =
    platformUsers.find((pu: PlatformUser) => pu.role === "super_admin") ||
    platformUsers[0];

  return primary as PlatformUser;
}
