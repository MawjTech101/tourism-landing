// ─── Database row types ────────────────────────────────────────

export type TripStatus = "active" | "draft" | "archived";
export type ActivityType =
  | "sightseeing"
  | "transport"
  | "free"
  | "shopping"
  | "meal";

export interface Trip {
  id: string;
  tenant_id: string;
  title_ar: string;
  title_en: string;
  slug: string;
  destination_ar: string;
  destination_en: string;
  duration_days: number;
  duration_nights: number;
  price_from: number;
  price_to: number;
  cover_image_url: string | null;
  description_ar: string;
  description_en: string;
  inclusions: InclusionItem[];
  exclusions: InclusionItem[];
  tags: string[];
  is_deal: boolean;
  is_ending_soon: boolean;
  deal_price: number | null;
  deal_expiry: string | null;
  status: TripStatus;
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface InclusionItem {
  text_ar: string;
  text_en: string;
}

export interface Hotel {
  id: string;
  tenant_id: string;
  name: string;
  city_ar: string;
  city_en: string;
  stars: number;
  photo_url: string | null;
  website_url: string | null;
}

export interface TripHotel {
  id: string;
  trip_id: string;
  hotel_id: string;
  nights: number;
  sort_order: number;
  hotel?: Hotel;
  hotels?: Hotel; // Supabase join returns table name as key
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  day_number: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  city_ar: string;
  city_en: string;
  activities?: ItineraryActivity[];
}

export interface ItineraryActivity {
  id: string;
  day_id: string;
  sort_order: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  activity_type: ActivityType;
}

export interface TripMedia {
  id: string;
  trip_id: string;
  url: string;
  alt_text_ar: string;
  alt_text_en: string;
  sort_order: number;
}

// ─── Form state types (client-side, with temp IDs) ─────────────

export interface TripFormData {
  // Basic info
  title_ar: string;
  title_en: string;
  slug: string;
  destination_ar: string;
  destination_en: string;
  duration_days: number;
  duration_nights: number;
  price_from: number;
  price_to: number;
  description_ar: string;
  description_en: string;
  status: TripStatus;
  cover_image_url: string | null;
  // Deal settings
  is_deal: boolean;
  is_ending_soon: boolean;
  deal_price: number | null;
  deal_expiry: string | null;
  // SEO
  meta_title: string | null;
  meta_description: string | null;
  // Tags
  tags: string[];
  // Related
  inclusions: InclusionItem[];
  exclusions: InclusionItem[];
  hotels: HotelFormEntry[];
  days: DayFormEntry[];
  media: MediaFormEntry[];
}

export interface HotelFormEntry {
  _key: string; // client-side key for React
  id?: string; // existing hotel ID
  trip_hotel_id?: string; // existing trip_hotel row ID
  name: string;
  city_ar: string;
  city_en: string;
  stars: number;
  nights: number;
  sort_order: number;
}

export interface ActivityFormEntry {
  _key: string;
  id?: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  activity_type: ActivityType;
  sort_order: number;
}

export interface DayFormEntry {
  _key: string;
  id?: string;
  day_number: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  city_ar: string;
  city_en: string;
  activities: ActivityFormEntry[];
}

export interface MediaFormEntry {
  _key: string;
  id?: string;
  url: string;
  alt_text_ar: string;
  alt_text_en: string;
  sort_order: number;
  file?: File; // only for new uploads not yet saved
}

// ─── Trip with all relations (for edit page) ───────────────────

export interface TripWithRelations extends Trip {
  trip_hotels: (TripHotel & { hotels: Hotel })[];
  itinerary_days: (ItineraryDay & { itinerary_activities: ItineraryActivity[] })[];
  trip_media: TripMedia[];
}
