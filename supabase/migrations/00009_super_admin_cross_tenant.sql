-- Super admin cross-tenant access
-- Allows users with super_admin role on ANY tenant to access ALL tenants' data.
-- Regular admins remain scoped to their own tenant via is_admin_of_tenant().

-- 1. Create function to check if user is a platform-wide super admin
CREATE OR REPLACE FUNCTION public.is_platform_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_users
    WHERE auth_id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
  );
$$;

-- 2. Update all admin RLS policies to include super admin bypass

-- trips
DROP POLICY IF EXISTS "Admins can manage trips" ON public.trips;
CREATE POLICY "Admins can manage trips"
  ON public.trips FOR ALL
  USING (
    public.is_admin_of_tenant(tenant_id)
    OR public.is_platform_super_admin()
  );

-- hotels
DROP POLICY IF EXISTS "Admins can manage hotels" ON public.hotels;
CREATE POLICY "Admins can manage hotels"
  ON public.hotels FOR ALL
  USING (
    public.is_admin_of_tenant(tenant_id)
    OR public.is_platform_super_admin()
  );

-- trip_hotels
DROP POLICY IF EXISTS "Admins can manage trip hotels" ON public.trip_hotels;
CREATE POLICY "Admins can manage trip hotels"
  ON public.trip_hotels FOR ALL
  USING (
    trip_id IN (
      SELECT id FROM public.trips WHERE public.is_admin_of_tenant(tenant_id)
    )
    OR public.is_platform_super_admin()
  );

-- itinerary_days
DROP POLICY IF EXISTS "Admins can manage itinerary days" ON public.itinerary_days;
CREATE POLICY "Admins can manage itinerary days"
  ON public.itinerary_days FOR ALL
  USING (
    trip_id IN (
      SELECT id FROM public.trips WHERE public.is_admin_of_tenant(tenant_id)
    )
    OR public.is_platform_super_admin()
  );

-- itinerary_activities
DROP POLICY IF EXISTS "Admins can manage activities" ON public.itinerary_activities;
CREATE POLICY "Admins can manage activities"
  ON public.itinerary_activities FOR ALL
  USING (
    day_id IN (
      SELECT id FROM public.itinerary_days WHERE trip_id IN (
        SELECT id FROM public.trips WHERE public.is_admin_of_tenant(tenant_id)
      )
    )
    OR public.is_platform_super_admin()
  );

-- trip_media
DROP POLICY IF EXISTS "Admins can manage trip media" ON public.trip_media;
CREATE POLICY "Admins can manage trip media"
  ON public.trip_media FOR ALL
  USING (
    trip_id IN (
      SELECT id FROM public.trips WHERE public.is_admin_of_tenant(tenant_id)
    )
    OR public.is_platform_super_admin()
  );

-- pages
DROP POLICY IF EXISTS "Admins can manage pages" ON public.pages;
CREATE POLICY "Admins can manage pages"
  ON public.pages FOR ALL
  USING (
    public.is_admin_of_tenant(tenant_id)
    OR public.is_platform_super_admin()
  );

-- inquiries
DROP POLICY IF EXISTS "Admins can manage inquiries" ON public.inquiries;
CREATE POLICY "Admins can manage inquiries"
  ON public.inquiries FOR ALL
  USING (
    public.is_admin_of_tenant(tenant_id)
    OR public.is_platform_super_admin()
  );

-- site_config (UPDATE policy)
DROP POLICY IF EXISTS "Admins can update site config" ON public.site_config;
CREATE POLICY "Admins can update site config"
  ON public.site_config FOR UPDATE
  USING (
    public.is_admin_of_tenant(tenant_id)
    OR public.is_platform_super_admin()
  );

-- Also allow super admin to INSERT site_config (for new tenants)
DROP POLICY IF EXISTS "Super admins can insert site config" ON public.site_config;
CREATE POLICY "Super admins can insert site config"
  ON public.site_config FOR INSERT
  WITH CHECK (public.is_platform_super_admin());

-- platform_users — super admin can manage users across all tenants
DROP POLICY IF EXISTS "Admins can manage tenant users" ON public.platform_users;
CREATE POLICY "Admins can manage tenant users"
  ON public.platform_users FOR ALL
  USING (
    auth_id = auth.uid()
    OR public.is_platform_super_admin()
  );

-- tenants — super admin full CRUD
DROP POLICY IF EXISTS "Super admins can manage all tenants" ON public.tenants;
CREATE POLICY "Super admins can manage all tenants"
  ON public.tenants FOR ALL
  USING (public.is_platform_super_admin());
