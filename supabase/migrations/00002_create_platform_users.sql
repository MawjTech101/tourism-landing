-- Platform users: maps Supabase Auth users to tenants with roles
CREATE TABLE public.platform_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin', 'admin', 'editor')),
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(auth_id, tenant_id)
);

CREATE INDEX idx_platform_users_auth_id ON public.platform_users (auth_id);
CREATE INDEX idx_platform_users_tenant_id ON public.platform_users (tenant_id);

ALTER TABLE public.platform_users ENABLE ROW LEVEL SECURITY;

-- Users can read their own records
CREATE POLICY "Users can read own records"
  ON public.platform_users FOR SELECT
  USING (auth.uid() = auth_id);

-- Admins can manage users in their tenant
CREATE POLICY "Admins can manage tenant users"
  ON public.platform_users FOR ALL
  USING (
    tenant_id IN (
      SELECT pu.tenant_id FROM public.platform_users pu
      WHERE pu.auth_id = auth.uid() AND pu.role IN ('super_admin', 'admin')
    )
  );
