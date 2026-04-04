"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/guard";
import {
  isValidSlug,
  isValidHexColor,
  isValidEmail,
  isValidDomain,
  sanitizeString,
  RESERVED_SLUGS,
} from "@/lib/security/validate";

interface CreateTenantInput {
  name: string;
  slug: string;
  custom_domain: string;
  plan: "free" | "pro" | "enterprise";
  company_name_ar: string;
  company_name_en: string;
  color_primary: string;
  color_secondary: string;
  color_accent: string;
  admin_email: string;
  admin_password: string;
  admin_display_name: string;
}

const VALID_PLANS = ["free", "pro", "enterprise"] as const;

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function validateCreateTenantInput(
  input: CreateTenantInput,
): string | null {
  // --- name ---
  if (!input.name || typeof input.name !== "string") {
    return "Tenant name is required.";
  }
  const name = sanitizeString(input.name, 100);
  if (name.length === 0) {
    return "Tenant name is required.";
  }

  // --- slug ---
  if (!input.slug || typeof input.slug !== "string") {
    return "Slug is required.";
  }
  if (!isValidSlug(input.slug)) {
    return "Slug must be 2-50 lowercase alphanumeric characters separated by hyphens.";
  }
  if (RESERVED_SLUGS.includes(input.slug)) {
    return "This slug is reserved and cannot be used.";
  }

  // --- custom_domain ---
  if (input.custom_domain && typeof input.custom_domain === "string") {
    const domain = input.custom_domain.trim();
    if (domain.length > 0 && !isValidDomain(domain)) {
      return "Custom domain is invalid. Provide a valid domain without protocol (e.g. example.com).";
    }
  }

  // --- plan ---
  if (!VALID_PLANS.includes(input.plan as (typeof VALID_PLANS)[number])) {
    return "Plan must be one of: free, pro, enterprise.";
  }

  // --- colors ---
  if (!isValidHexColor(input.color_primary)) {
    return "Primary color must be a valid hex color (e.g. #FF5500).";
  }
  if (!isValidHexColor(input.color_secondary)) {
    return "Secondary color must be a valid hex color (e.g. #FF5500).";
  }
  if (!isValidHexColor(input.color_accent)) {
    return "Accent color must be a valid hex color (e.g. #FF5500).";
  }

  // --- admin_email ---
  if (!input.admin_email || !isValidEmail(input.admin_email)) {
    return "A valid admin email is required.";
  }
  if (input.admin_email.length > 254) {
    return "Admin email is too long.";
  }

  // --- admin_password ---
  if (!input.admin_password || typeof input.admin_password !== "string") {
    return "Admin password is required.";
  }
  if (!PASSWORD_RE.test(input.admin_password)) {
    return "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one digit.";
  }

  // --- admin_display_name ---
  if (input.admin_display_name && typeof input.admin_display_name === "string") {
    const displayName = sanitizeString(input.admin_display_name, 100);
    if (displayName.length === 0) {
      return "Admin display name cannot be empty if provided.";
    }
  }

  return null; // all good
}

export async function createTenantAction(input: CreateTenantInput) {
  // Verify caller is super_admin
  const { platformUser } = await requireAdmin();
  if (platformUser.role !== "super_admin") {
    return { error: "Only super admins can create tenants" };
  }

  // ---- Server-side validation ----
  const validationError = validateCreateTenantInput(input);
  if (validationError) {
    return { error: validationError };
  }

  // Sanitize string fields
  const name = sanitizeString(input.name, 100);
  const slug = input.slug; // already validated by isValidSlug
  const customDomain = input.custom_domain
    ? sanitizeString(input.custom_domain, 253)
    : null;
  const companyNameAr = sanitizeString(input.company_name_ar || name, 200);
  const companyNameEn = sanitizeString(input.company_name_en || name, 200);
  const adminDisplayName = sanitizeString(
    input.admin_display_name || "Admin",
    100,
  );

  const supabase = createAdminClient();

  // 1. Create tenant
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({
      name,
      slug,
      custom_domain: customDomain,
      schema_name: `tenant_${slug.replace(/-/g, "_")}`,
      plan: input.plan,
    })
    .select("id")
    .single();

  if (tenantError) {
    if (tenantError.code === "23505") {
      return { error: "A tenant with this slug already exists." };
    }
    return { error: "Failed to create tenant. Please try again." };
  }

  // 2. Create site_config
  const { error: configError } = await supabase.from("site_config").insert({
    tenant_id: tenant.id,
    company_name_ar: companyNameAr,
    company_name_en: companyNameEn,
    color_primary: input.color_primary,
    color_secondary: input.color_secondary,
    color_accent: input.color_accent,
  });

  if (configError) {
    // Rollback: delete tenant
    await supabase.from("tenants").delete().eq("id", tenant.id);
    return { error: "Failed to create site configuration. Please try again." };
  }

  // 3. Create auth user (requires service role key)
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email: input.admin_email,
      password: input.admin_password,
      email_confirm: true,
      user_metadata: {
        display_name: adminDisplayName,
      },
    });

  if (authError) {
    // Rollback
    await supabase.from("site_config").delete().eq("tenant_id", tenant.id);
    await supabase.from("tenants").delete().eq("id", tenant.id);
    return { error: "Failed to create admin user. Please try again." };
  }

  // 4. Create platform_users record
  const { error: puError } = await supabase.from("platform_users").insert({
    auth_id: authUser.user.id,
    tenant_id: tenant.id,
    role: "admin",
    email: input.admin_email,
    display_name: adminDisplayName,
    is_active: true,
  });

  if (puError) {
    // Rollback
    await supabase.auth.admin.deleteUser(authUser.user.id);
    await supabase.from("site_config").delete().eq("tenant_id", tenant.id);
    await supabase.from("tenants").delete().eq("id", tenant.id);
    return { error: "Failed to create platform user. Please try again." };
  }

  // 5. Create storage bucket for the tenant
  await supabase.storage.createBucket(`tenant-${slug}`, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
  });

  return { success: true, tenantId: tenant.id };
}
