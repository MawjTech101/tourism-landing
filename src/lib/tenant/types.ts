export interface Tenant {
  id: string;
  slug: string;
  name: string;
  custom_domain: string | null;
  schema_name: string;
  plan: "free" | "pro" | "enterprise";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteConfig {
  id: string;
  tenant_id: string;
  company_name_ar: string;
  company_name_en: string;
  logo_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  color_primary: string;
  color_secondary: string;
  color_accent: string;
  color_background: string;
  color_foreground: string;
  font_family_ar: string;
  font_family_en: string;
  phone_numbers: string[];
  whatsapp_number: string | null;
  email: string | null;
  address_ar: string | null;
  address_en: string | null;
  google_maps_url: string | null;
  social_links: Record<string, string>;
  hero_image_url: string | null;
  hero_title_ar: string | null;
  hero_title_en: string | null;
  hero_subtitle_ar: string | null;
  hero_subtitle_en: string | null;
  hero_cta_text_ar: string | null;
  hero_cta_text_en: string | null;
  hero_cta_link: string | null;
  footer_about_ar: string | null;
  footer_about_en: string | null;
  copyright_text_ar: string | null;
  copyright_text_en: string | null;
  whatsapp_template: string | null;
  og_image_url: string | null;
  meta_title_ar: string | null;
  meta_title_en: string | null;
  meta_description_ar: string | null;
  meta_description_en: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlatformUser {
  id: string;
  auth_id: string;
  tenant_id: string;
  role: "super_admin" | "admin" | "editor";
  email: string;
  display_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminContext {
  user: { id: string; email?: string };
  platformUser: PlatformUser;
  isSuperAdmin: boolean;
}

export const DEFAULT_SITE_CONFIG: Partial<SiteConfig> = {
  color_primary: "#51487E",
  color_secondary: "#AB4E83",
  color_accent: "#818181",
  color_background: "#FFFFFF",
  color_foreground: "#1a1a2e",
  font_family_ar: "IBM Plex Sans Arabic",
  font_family_en: "IBM Plex Sans Arabic",
  company_name_ar: "SafarCMS",
  company_name_en: "SafarCMS",
};
