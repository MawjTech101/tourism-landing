-- Seed the first tenant: Otolat Rahlatcom Travel & Tourism
INSERT INTO public.tenants (name, slug, schema_name, plan, is_active)
VALUES ('Otolat Rahlatcom Travel & Tourism', 'otolat', 'otolat', 'pro', true);

INSERT INTO public.site_config (
  tenant_id,
  company_name_ar,
  company_name_en,
  -- Branding
  logo_url,
  logo_dark_url,
  favicon_url,
  -- Colors
  color_primary,
  color_secondary,
  color_accent,
  color_background,
  color_foreground,
  -- Fonts
  font_family_ar,
  font_family_en,
  -- Contact
  phone_numbers,
  whatsapp_number,
  email,
  address_ar,
  address_en,
  google_maps_url,
  -- Social
  social_links,
  -- Hero
  hero_image_url,
  hero_title_ar,
  hero_title_en,
  hero_subtitle_ar,
  hero_subtitle_en,
  hero_cta_text_ar,
  hero_cta_text_en,
  hero_cta_link,
  -- Footer
  footer_about_ar,
  footer_about_en,
  copyright_text_ar,
  copyright_text_en,
  -- WhatsApp
  whatsapp_template,
  -- SEO
  og_image_url,
  meta_title_ar,
  meta_title_en,
  meta_description_ar,
  meta_description_en
)
SELECT
  id,
  'اطلالات رحلتكم للسفر والسياحة',
  'Otolat Rahlatcom Travel & Tourism',
  -- Branding: local assets served from /public (no Supabase upload needed initially)
  '/images/logo.svg',
  '/images/logo-light.svg',
  '/favicon.ico',
  -- Colors: Otolat brand
  '#51487E',
  '#AB4E83',
  '#818181',
  '#FFFFFF',
  '#1a1a2e',
  -- Fonts
  'IBM Plex Sans Arabic',
  'IBM Plex Sans Arabic',
  -- Contact info (placeholder — update with real numbers)
  '["‪+966 XX XXX XXXX"]'::jsonb,
  '+966XXXXXXXXX',
  'info@otolat.com',
  'الرياض، المملكة العربية السعودية',
  'Riyadh, Saudi Arabia',
  'https://maps.google.com/?q=Riyadh+Saudi+Arabia',
  -- Social media (placeholder links)
  '{"instagram": "https://instagram.com/otolat", "twitter": "https://twitter.com/otolat", "tiktok": "https://tiktok.com/@otolat", "snapchat": "https://snapchat.com/add/otolat"}'::jsonb,
  -- Hero: no image initially, will use CSS gradient fallback
  NULL,
  'اكتشف العالم معنا',
  'Discover the World With Us',
  'رحلات سياحية مميزة إلى أجمل الوجهات العالمية بأفضل الأسعار',
  'Premium travel packages to the world''s most beautiful destinations at the best prices',
  'تصفح الرحلات',
  'Browse Trips',
  '/ar/trips',
  -- Footer
  'اطلالات رحلتكم هي وكالة سفر وسياحة رائدة مقرها الرياض، المملكة العربية السعودية. نقدم باقات سياحية مميزة لأجمل الوجهات حول العالم.',
  'Otolat Rahlatcom is a leading travel and tourism agency based in Riyadh, Saudi Arabia. We offer premium travel packages to the world''s most beautiful destinations.',
  '© 2026 اطلالات رحلتكم للسفر والسياحة. جميع الحقوق محفوظة.',
  '© 2026 Otolat Rahlatcom Travel & Tourism. All rights reserved.',
  -- WhatsApp
  'مرحباً، أود الاستفسار عن رحلة: {trip_name}',
  -- SEO
  '/images/og-default.svg',
  'اطلالات رحلتكم | رحلات سياحية مميزة',
  'Otolat Rahlatcom | Premium Travel Packages',
  'اكتشف أجمل الوجهات السياحية مع اطلالات رحلتكم. باقات سياحية شاملة بأفضل الأسعار من الرياض إلى العالم.',
  'Discover the world''s most beautiful destinations with Otolat Rahlatcom. Comprehensive travel packages at the best prices from Riyadh to the world.'
FROM public.tenants WHERE slug = 'otolat';
