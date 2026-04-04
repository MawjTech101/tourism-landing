import { type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Resolves tenant slug from the request hostname.
 *
 * Priority:
 *  1. Local dev: cookie override (dev-tenant-slug) → env default
 *  2. Subdomain: {slug}.basedomain.com → slug
 *  3. Custom domain: DB lookup by custom_domain column
 *  4. Fallback: default tenant from env
 */
export async function resolveTenantSlug(
  hostname: string,
  request?: NextRequest
): Promise<string> {
  const defaultTenant = process.env.NEXT_PUBLIC_DEFAULT_TENANT || "otolat";

  // Local development
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    // Check for dev override cookie (set by TenantSwitcher)
    const devOverride = request?.cookies.get("dev-tenant-slug")?.value;
    if (devOverride) return devOverride;
    return defaultTenant;
  }

  // Strip port
  const cleanHost = hostname.replace(/:.*$/, "");

  // Subdomain pattern: {slug}.safarcms.com
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "safarcms.com";
  if (cleanHost.endsWith(`.${baseDomain}`)) {
    const slug = cleanHost.replace(`.${baseDomain}`, "");
    if (slug && !slug.includes(".")) {
      return slug;
    }
  }

  // Custom domain: query DB
  if (request) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // No-op in resolution context
          },
        },
      }
    );

    const { data: tenant } = await supabase
      .from("tenants")
      .select("slug")
      .eq("custom_domain", cleanHost)
      .eq("is_active", true)
      .single();

    if (tenant) {
      return tenant.slug;
    }
  }

  // Fallback
  return defaultTenant;
}
