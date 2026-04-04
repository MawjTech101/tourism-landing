-- Trips table
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title_ar VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  slug VARCHAR(255) NOT NULL,
  destination_ar VARCHAR(255) NOT NULL,
  destination_en VARCHAR(255),
  duration_days INTEGER NOT NULL,
  duration_nights INTEGER NOT NULL,
  price_from DECIMAL(10,2),
  price_to DECIMAL(10,2),
  cover_image_url TEXT,
  description_ar TEXT,
  description_en TEXT,
  inclusions JSONB DEFAULT '[]'::jsonb,
  exclusions JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  is_deal BOOLEAN NOT NULL DEFAULT false,
  is_ending_soon BOOLEAN NOT NULL DEFAULT false,
  deal_price DECIMAL(10,2),
  deal_expiry TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
  sort_order INTEGER DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_trips_tenant_id ON public.trips (tenant_id);
CREATE INDEX idx_trips_status ON public.trips (tenant_id, status);
CREATE INDEX idx_trips_deal ON public.trips (tenant_id, is_deal) WHERE is_deal = true;

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active trips are publicly readable"
  ON public.trips FOR SELECT
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE is_active = true)
  );

CREATE POLICY "Admins can manage trips"
  ON public.trips FOR ALL
  USING (
    tenant_id IN (
      SELECT pu.tenant_id FROM public.platform_users pu
      WHERE pu.auth_id = auth.uid() AND pu.role IN ('super_admin', 'admin', 'editor')
    )
  );

-- Hotels table
CREATE TABLE public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  city_ar VARCHAR(100),
  city_en VARCHAR(100),
  stars INTEGER CHECK (stars >= 1 AND stars <= 5),
  photo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hotels_tenant_id ON public.hotels (tenant_id);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hotels are publicly readable"
  ON public.hotels FOR SELECT
  USING (tenant_id IN (SELECT id FROM public.tenants WHERE is_active = true));

CREATE POLICY "Admins can manage hotels"
  ON public.hotels FOR ALL
  USING (
    tenant_id IN (
      SELECT pu.tenant_id FROM public.platform_users pu
      WHERE pu.auth_id = auth.uid() AND pu.role IN ('super_admin', 'admin', 'editor')
    )
  );

-- Trip-Hotel junction
CREATE TABLE public.trip_hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  nights INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.trip_hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip hotels are publicly readable"
  ON public.trip_hotels FOR SELECT
  USING (
    trip_id IN (SELECT id FROM public.trips WHERE tenant_id IN (SELECT id FROM public.tenants WHERE is_active = true))
  );

CREATE POLICY "Admins can manage trip hotels"
  ON public.trip_hotels FOR ALL
  USING (
    trip_id IN (
      SELECT t.id FROM public.trips t
      WHERE t.tenant_id IN (
        SELECT pu.tenant_id FROM public.platform_users pu
        WHERE pu.auth_id = auth.uid() AND pu.role IN ('super_admin', 'admin', 'editor')
      )
    )
  );

-- Itinerary days
CREATE TABLE public.itinerary_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  description_ar TEXT,
  description_en TEXT,
  city_ar VARCHAR(100),
  city_en VARCHAR(100)
);

CREATE INDEX idx_itinerary_days_trip ON public.itinerary_days (trip_id, day_number);

ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Itinerary days are publicly readable"
  ON public.itinerary_days FOR SELECT
  USING (
    trip_id IN (SELECT id FROM public.trips WHERE tenant_id IN (SELECT id FROM public.tenants WHERE is_active = true))
  );

CREATE POLICY "Admins can manage itinerary days"
  ON public.itinerary_days FOR ALL
  USING (
    trip_id IN (
      SELECT t.id FROM public.trips t
      WHERE t.tenant_id IN (
        SELECT pu.tenant_id FROM public.platform_users pu
        WHERE pu.auth_id = auth.uid() AND pu.role IN ('super_admin', 'admin', 'editor')
      )
    )
  );

-- Itinerary activities
CREATE TABLE public.itinerary_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES public.itinerary_days(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  title_ar VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  description_ar TEXT,
  description_en TEXT,
  activity_type VARCHAR(30) CHECK (activity_type IN ('sightseeing', 'transport', 'free', 'shopping', 'meal'))
);

ALTER TABLE public.itinerary_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activities are publicly readable"
  ON public.itinerary_activities FOR SELECT
  USING (
    day_id IN (
      SELECT id FROM public.itinerary_days WHERE trip_id IN (
        SELECT id FROM public.trips WHERE tenant_id IN (SELECT id FROM public.tenants WHERE is_active = true)
      )
    )
  );

CREATE POLICY "Admins can manage activities"
  ON public.itinerary_activities FOR ALL
  USING (
    day_id IN (
      SELECT id FROM public.itinerary_days WHERE trip_id IN (
        SELECT t.id FROM public.trips t
        WHERE t.tenant_id IN (
          SELECT pu.tenant_id FROM public.platform_users pu
          WHERE pu.auth_id = auth.uid() AND pu.role IN ('super_admin', 'admin', 'editor')
        )
      )
    )
  );

-- Trip media
CREATE TABLE public.trip_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text_ar VARCHAR(255),
  alt_text_en VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trip_media_trip ON public.trip_media (trip_id, sort_order);

ALTER TABLE public.trip_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip media is publicly readable"
  ON public.trip_media FOR SELECT
  USING (
    trip_id IN (SELECT id FROM public.trips WHERE tenant_id IN (SELECT id FROM public.tenants WHERE is_active = true))
  );

CREATE POLICY "Admins can manage trip media"
  ON public.trip_media FOR ALL
  USING (
    trip_id IN (
      SELECT t.id FROM public.trips t
      WHERE t.tenant_id IN (
        SELECT pu.tenant_id FROM public.platform_users pu
        WHERE pu.auth_id = auth.uid() AND pu.role IN ('super_admin', 'admin', 'editor')
      )
    )
  );

-- Pages (About, Terms, etc.)
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  content_ar TEXT,
  content_en TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published pages are publicly readable"
  ON public.pages FOR SELECT
  USING (
    is_published = true AND
    tenant_id IN (SELECT id FROM public.tenants WHERE is_active = true)
  );

CREATE POLICY "Admins can manage pages"
  ON public.pages FOR ALL
  USING (
    tenant_id IN (
      SELECT pu.tenant_id FROM public.platform_users pu
      WHERE pu.auth_id = auth.uid() AND pu.role IN ('super_admin', 'admin', 'editor')
    )
  );

-- Inquiries
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(255),
  message TEXT,
  source VARCHAR(30) CHECK (source IN ('whatsapp_click', 'call_click', 'form')),
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inquiries_tenant ON public.inquiries (tenant_id, created_at DESC);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage inquiries"
  ON public.inquiries FOR ALL
  USING (
    tenant_id IN (
      SELECT pu.tenant_id FROM public.platform_users pu
      WHERE pu.auth_id = auth.uid() AND pu.role IN ('super_admin', 'admin', 'editor')
    )
  );

-- Allow public inserts for inquiry form
CREATE POLICY "Anyone can submit inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);
