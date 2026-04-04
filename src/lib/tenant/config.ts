import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import type { SiteConfig, Tenant } from "./types";
import { DEFAULT_SITE_CONFIG } from "./types";

// React cache: one DB call per request even if called multiple times
export const getTenantConfig = cache(async (): Promise<SiteConfig> => {
  const headerStore = await headers();
  const slug = headerStore.get("x-tenant-slug") || "otolat";

  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!tenant) {
    return DEFAULT_SITE_CONFIG as SiteConfig;
  }

  const { data, error } = await supabase
    .from("site_config")
    .select("*")
    .eq("tenant_id", tenant.id)
    .single();

  if (error || !data) {
    return DEFAULT_SITE_CONFIG as SiteConfig;
  }

  return data as SiteConfig;
});

export const getTenant = cache(async (): Promise<Tenant | null> => {
  const headerStore = await headers();
  const slug = headerStore.get("x-tenant-slug") || "otolat";

  const supabase = await createClient();

  const { data } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .single();

  return data as Tenant | null;
});

export const getTenantSlug = cache(async (): Promise<string> => {
  const headerStore = await headers();
  return headerStore.get("x-tenant-slug") || "otolat";
});
