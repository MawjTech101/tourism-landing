-- =============================================================================
-- Migration 00010: Security Hardening
-- =============================================================================
-- Fixes three RLS gaps in SafarCMS:
--
-- 1. STORAGE: Tenant-scoped uploads/updates/deletes. Previously any
--    authenticated user could upload to or delete from any tenant's folder.
--    Now only admins of the tenant (identified by the first path segment)
--    or platform super admins can modify files.
--
-- 2. PLATFORM_USERS: Adds is_active = true check to the self-access clause.
--    A deactivated user can no longer read/modify their own row to
--    re-escalate access.
--
-- 3. INQUIRIES: Replaces the wide-open WITH CHECK (true) on INSERT with
--    field-level validation (length, allowed values, active tenant).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Storage RLS — Tenant-Scoped Uploads / Updates / Deletes
-- ---------------------------------------------------------------------------
-- Path convention: {tenant_id}/branding/logo.png  or  {tenant_id}/{ts}-{uid}.ext
-- storage.foldername(name) returns a text[] of folder segments.
-- Element [1] (Postgres is 1-indexed) is the tenant UUID.

-- INSERT (upload)
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Admins can upload to their tenant media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
    AND (
      public.is_admin_of_tenant((storage.foldername(name))[1]::uuid)
      OR public.is_platform_super_admin()
    )
  );

-- UPDATE
DROP POLICY IF EXISTS "Authenticated users can update media" ON storage.objects;
CREATE POLICY "Admins can update their tenant media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
    AND (
      public.is_admin_of_tenant((storage.foldername(name))[1]::uuid)
      OR public.is_platform_super_admin()
    )
  );

-- DELETE
DROP POLICY IF EXISTS "Authenticated users can delete media" ON storage.objects;
CREATE POLICY "Admins can delete their tenant media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
    AND (
      public.is_admin_of_tenant((storage.foldername(name))[1]::uuid)
      OR public.is_platform_super_admin()
    )
  );

-- ---------------------------------------------------------------------------
-- 2. platform_users RLS — Require is_active on self-access
-- ---------------------------------------------------------------------------
-- Previous policy: USING (auth_id = auth.uid() OR is_platform_super_admin())
-- Problem: a deactivated user (is_active = false) could still access their
-- own row and potentially re-activate themselves via the ALL policy.

DROP POLICY IF EXISTS "Admins can manage tenant users" ON public.platform_users;
CREATE POLICY "Admins can manage tenant users"
  ON public.platform_users FOR ALL
  USING (
    (auth_id = auth.uid() AND is_active = true)
    OR public.is_platform_super_admin()
  );

-- ---------------------------------------------------------------------------
-- 3. Inquiries INSERT — Input validation instead of WITH CHECK (true)
-- ---------------------------------------------------------------------------
-- The original policy allowed any row to be inserted with zero validation.
-- This replaces it with basic sanity checks enforced at the DB level.

DROP POLICY IF EXISTS "Anyone can submit inquiries" ON public.inquiries;
CREATE POLICY "Validated inquiry submissions"
  ON public.inquiries FOR INSERT
  WITH CHECK (
    -- Required fields with length bounds
    name IS NOT NULL AND length(name) BETWEEN 2 AND 200
    AND phone IS NOT NULL AND length(phone) BETWEEN 5 AND 20
    AND message IS NOT NULL AND length(message) BETWEEN 10 AND 2000
    AND (email IS NULL OR length(email) <= 254)
    -- Must match allowed source values and start as 'new'
    AND source IN ('form', 'whatsapp_click', 'call_click')
    AND status = 'new'
    -- Tenant must exist and be active
    AND tenant_id IN (SELECT id FROM public.tenants WHERE is_active = true)
  );
