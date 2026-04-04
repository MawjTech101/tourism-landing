-- Site configuration: one row per tenant, stores all branding & customization
CREATE TABLE public.site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Company info
  company_name_ar VARCHAR(255) NOT NULL DEFAULT '',
  company_name_en VARCHAR(255) NOT NULL DEFAULT '',

  -- Branding
  logo_url TEXT,
  logo_dark_url TEXT,
  favicon_url TEXT,

  -- Theme colors
  color_primary VARCHAR(7) NOT NULL DEFAULT '#51487E',
  color_secondary VARCHAR(7) NOT NULL DEFAULT '#AB4E83',
  color_accent VARCHAR(7) NOT NULL DEFAULT '#818181',
  color_background VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
  color_foreground VARCHAR(7) NOT NULL DEFAULT '#1a1a2e',

  -- Typography
  font_family_ar VARCHAR(100) NOT NULL DEFAULT 'IBM Plex Sans Arabic',
  font_family_en VARCHAR(100) NOT NULL DEFAULT 'IBM Plex Sans Arabic',

  -- Contact info
  phone_numbers JSONB NOT NULL DEFAULT '[]'::jsonb,
  whatsapp_number VARCHAR(20),
  email VARCHAR(255),
  address_ar TEXT,
  address_en TEXT,
  google_maps_url TEXT,

  -- Social media
  social_links JSONB DEFAULT '{}'::jsonb,

  -- Hero banner
  hero_image_url TEXT,
  hero_title_ar TEXT,
  hero_title_en TEXT,
  hero_subtitle_ar TEXT,
  hero_subtitle_en TEXT,
  hero_cta_text_ar VARCHAR(100),
  hero_cta_text_en VARCHAR(100),
  hero_cta_link TEXT,

  -- Footer
  footer_about_ar TEXT,
  footer_about_en TEXT,
  copyright_text_ar VARCHAR(255),
  copyright_text_en VARCHAR(255),

  -- WhatsApp
  whatsapp_template TEXT DEFAULT 'مرحباً، أود الاستفسار عن رحلة: {trip_name}',

  -- SEO defaults
  og_image_url TEXT,
  meta_title_ar VARCHAR(255),
  meta_title_en VARCHAR(255),
  meta_description_ar TEXT,
  meta_description_en TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Public can read site config (needed for public pages)
CREATE POLICY "Site config is publicly readable"
  ON public.site_config FOR SELECT
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE is_active = true)
  );

-- Admins of the tenant can update
CREATE POLICY "Admins can update site config"
  ON public.site_config FOR UPDATE
  USING (
    tenant_id IN (
      SELECT pu.tenant_id FROM public.platform_users pu
      WHERE pu.auth_id = auth.uid() AND pu.role IN ('super_admin', 'admin')
    )
  );
