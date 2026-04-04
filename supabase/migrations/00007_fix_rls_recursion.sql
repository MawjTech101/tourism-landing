-- Fix infinite recursion in RLS policies
-- The old policies on trips/pages/inquiries/etc queried platform_users,
-- but platform_users had its own RLS that queried itself, causing recursion.
-- Solution: SECURITY DEFINER function that bypasses RLS for the admin check.

CREATE OR REPLACE FUNCTION public.is_admin_of_tenant(check_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_users
    WHERE auth_id = auth.uid()
      AND tenant_id = check_tenant_id
      AND role IN ('super_admin', 'admin', 'editor')
      AND is_active = true
  );
$$;

-- Fix platform_users policies
DROP POLICY IF EXISTS "Admins can manage tenant users" ON public.platform_users;
DROP POLICY IF EXISTS "Users can read own records" ON public.platform_users;

CREATE POLICY "Users can read own records"
  ON public.platform_users FOR SELECT
  USING (auth_id = auth.uid());

CREATE POLICY "Admins can manage tenant users"
  ON public.platform_users FOR ALL
  USING (auth_id = auth.uid());

-- Fix all other table policies to use the function
DROP POLICY IF EXISTS "Admins can manage trips" ON public.trips;
CREATE POLICY "Admins can manage trips"
  ON public.trips FOR ALL
  USING (public.is_admin_of_tenant(tenant_id));

DROP POLICY IF EXISTS "Admins can manage hotels" ON public.hotels;
CREATE POLICY "Admins can manage hotels"
  ON public.hotels FOR ALL
  USING (public.is_admin_of_tenant(tenant_id));

DROP POLICY IF EXISTS "Admins can manage trip hotels" ON public.trip_hotels;
CREATE POLICY "Admins can manage trip hotels"
  ON public.trip_hotels FOR ALL
  USING (
    trip_id IN (
      SELECT id FROM public.trips WHERE public.is_admin_of_tenant(tenant_id)
    )
  );

DROP POLICY IF EXISTS "Admins can manage itinerary days" ON public.itinerary_days;
CREATE POLICY "Admins can manage itinerary days"
  ON public.itinerary_days FOR ALL
  USING (
    trip_id IN (
      SELECT id FROM public.trips WHERE public.is_admin_of_tenant(tenant_id)
    )
  );

DROP POLICY IF EXISTS "Admins can manage activities" ON public.itinerary_activities;
CREATE POLICY "Admins can manage activities"
  ON public.itinerary_activities FOR ALL
  USING (
    day_id IN (
      SELECT id FROM public.itinerary_days WHERE trip_id IN (
        SELECT id FROM public.trips WHERE public.is_admin_of_tenant(tenant_id)
      )
    )
  );

DROP POLICY IF EXISTS "Admins can manage trip media" ON public.trip_media;
CREATE POLICY "Admins can manage trip media"
  ON public.trip_media FOR ALL
  USING (
    trip_id IN (
      SELECT id FROM public.trips WHERE public.is_admin_of_tenant(tenant_id)
    )
  );

DROP POLICY IF EXISTS "Admins can manage pages" ON public.pages;
CREATE POLICY "Admins can manage pages"
  ON public.pages FOR ALL
  USING (public.is_admin_of_tenant(tenant_id));

DROP POLICY IF EXISTS "Admins can manage inquiries" ON public.inquiries;
CREATE POLICY "Admins can manage inquiries"
  ON public.inquiries FOR ALL
  USING (public.is_admin_of_tenant(tenant_id));

DROP POLICY IF EXISTS "Admins can update site config" ON public.site_config;
CREATE POLICY "Admins can update site config"
  ON public.site_config FOR UPDATE
  USING (public.is_admin_of_tenant(tenant_id));
