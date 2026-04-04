-- Tenants table: registry of all travel agencies on the platform
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  custom_domain VARCHAR(255) UNIQUE,
  schema_name VARCHAR(50) NOT NULL,
  plan VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenants_slug ON public.tenants (slug);
CREATE INDEX idx_tenants_custom_domain ON public.tenants (custom_domain) WHERE custom_domain IS NOT NULL;

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active tenants are publicly readable"
  ON public.tenants FOR SELECT
  USING (is_active = true);
