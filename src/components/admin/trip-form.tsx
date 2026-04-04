"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Upload,
  ImageIcon,
  Star,
  ArrowLeft,
} from "lucide-react";
import type {
  TripFormData,
  TripWithRelations,
  HotelFormEntry,
  DayFormEntry,
  ActivityFormEntry,
  MediaFormEntry,
  InclusionItem,
  TripStatus,
  ActivityType,
} from "@/lib/types/trips";
import Link from "next/link";

// ─── Helpers ───────────────────────────────────────────────────

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function buildInitialData(trip?: TripWithRelations): TripFormData {
  if (!trip) {
    return {
      title_ar: "",
      title_en: "",
      slug: "",
      destination_ar: "",
      destination_en: "",
      duration_days: 1,
      duration_nights: 0,
      price_from: 0,
      price_to: 0,
      description_ar: "",
      description_en: "",
      status: "draft",
      cover_image_url: null,
      is_deal: false,
      is_ending_soon: false,
      deal_price: null,
      deal_expiry: null,
      meta_title: null,
      meta_description: null,
      tags: [],
      inclusions: [],
      exclusions: [],
      hotels: [],
      days: [],
      media: [],
    };
  }

  return {
    title_ar: trip.title_ar,
    title_en: trip.title_en,
    slug: trip.slug,
    destination_ar: trip.destination_ar,
    destination_en: trip.destination_en,
    duration_days: trip.duration_days,
    duration_nights: trip.duration_nights,
    price_from: trip.price_from,
    price_to: trip.price_to,
    description_ar: trip.description_ar,
    description_en: trip.description_en,
    status: trip.status,
    cover_image_url: trip.cover_image_url,
    is_deal: trip.is_deal,
    is_ending_soon: trip.is_ending_soon,
    deal_price: trip.deal_price,
    deal_expiry: trip.deal_expiry,
    meta_title: trip.meta_title,
    meta_description: trip.meta_description,
    tags: trip.tags || [],
    inclusions: trip.inclusions || [],
    exclusions: trip.exclusions || [],
    hotels: (trip.trip_hotels || []).map((th) => ({
      _key: uid(),
      id: th.hotels?.id,
      trip_hotel_id: th.id,
      name: th.hotels?.name || "",
      city_ar: th.hotels?.city_ar || "",
      city_en: th.hotels?.city_en || "",
      stars: th.hotels?.stars || 3,
      nights: th.nights,
      sort_order: th.sort_order,
    })),
    days: (trip.itinerary_days || [])
      .sort((a, b) => a.day_number - b.day_number)
      .map((d) => ({
        _key: uid(),
        id: d.id,
        day_number: d.day_number,
        title_ar: d.title_ar,
        title_en: d.title_en,
        description_ar: d.description_ar,
        description_en: d.description_en,
        city_ar: d.city_ar,
        city_en: d.city_en,
        activities: (d.itinerary_activities || [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((a) => ({
            _key: uid(),
            id: a.id,
            title_ar: a.title_ar,
            title_en: a.title_en,
            description_ar: a.description_ar,
            description_en: a.description_en,
            activity_type: a.activity_type,
            sort_order: a.sort_order,
          })),
      })),
    media: (trip.trip_media || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((m) => ({
        _key: uid(),
        id: m.id,
        url: m.url,
        alt_text_ar: m.alt_text_ar,
        alt_text_en: m.alt_text_en,
        sort_order: m.sort_order,
      })),
  };
}

// ─── Tab type ──────────────────────────────────────────────────

type Tab =
  | "basic"
  | "hotels"
  | "itinerary"
  | "inclusions"
  | "deal"
  | "media"
  | "seo";

const TABS: { key: Tab; label: string }[] = [
  { key: "basic", label: "Basic Info" },
  { key: "hotels", label: "Hotels" },
  { key: "itinerary", label: "Itinerary" },
  { key: "inclusions", label: "Inclusions" },
  { key: "deal", label: "Deal Settings" },
  { key: "media", label: "Media" },
  { key: "seo", label: "SEO" },
];

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "sightseeing", label: "Sightseeing" },
  { value: "transport", label: "Transport" },
  { value: "free", label: "Free Time" },
  { value: "shopping", label: "Shopping" },
  { value: "meal", label: "Meal" },
];

// ─── Component ─────────────────────────────────────────────────

interface TripFormProps {
  mode: "create" | "edit";
  trip?: TripWithRelations;
  tenantId: string;
}

export function TripForm({ mode, trip, tenantId }: TripFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<TripFormData>(() => buildInitialData(trip));
  const [slugManual, setSlugManual] = useState(mode === "edit");

  // Auto-generate slug from English title
  useEffect(() => {
    if (!slugManual && data.title_en) {
      setData((prev) => ({ ...prev, slug: generateSlug(prev.title_en) }));
    }
  }, [data.title_en, slugManual]);

  // ── Field updaters ─────────────────────────────────────────

  const updateField = useCallback(
    <K extends keyof TripFormData>(field: K, value: TripFormData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // ── Hotels ─────────────────────────────────────────────────

  function addHotel() {
    setData((prev) => ({
      ...prev,
      hotels: [
        ...prev.hotels,
        {
          _key: uid(),
          name: "",
          city_ar: "",
          city_en: "",
          stars: 3,
          nights: 1,
          sort_order: prev.hotels.length,
        },
      ],
    }));
  }

  function updateHotel<K extends keyof HotelFormEntry>(
    key: string,
    field: K,
    value: HotelFormEntry[K],
  ) {
    setData((prev) => ({
      ...prev,
      hotels: prev.hotels.map((h) =>
        h._key === key ? { ...h, [field]: value } : h,
      ),
    }));
  }

  function removeHotel(key: string) {
    setData((prev) => ({
      ...prev,
      hotels: prev.hotels.filter((h) => h._key !== key),
    }));
  }

  // ── Days ───────────────────────────────────────────────────

  function addDay() {
    setData((prev) => ({
      ...prev,
      days: [
        ...prev.days,
        {
          _key: uid(),
          day_number: prev.days.length + 1,
          title_ar: "",
          title_en: "",
          description_ar: "",
          description_en: "",
          city_ar: "",
          city_en: "",
          activities: [],
        },
      ],
    }));
  }

  function updateDay<K extends keyof DayFormEntry>(
    key: string,
    field: K,
    value: DayFormEntry[K],
  ) {
    setData((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d._key === key ? { ...d, [field]: value } : d,
      ),
    }));
  }

  function removeDay(key: string) {
    setData((prev) => ({
      ...prev,
      days: prev.days
        .filter((d) => d._key !== key)
        .map((d, i) => ({ ...d, day_number: i + 1 })),
    }));
  }

  function moveDayUp(index: number) {
    if (index === 0) return;
    setData((prev) => {
      const days = [...prev.days];
      [days[index - 1], days[index]] = [days[index], days[index - 1]];
      return {
        ...prev,
        days: days.map((d, i) => ({ ...d, day_number: i + 1 })),
      };
    });
  }

  function moveDayDown(index: number) {
    setData((prev) => {
      if (index >= prev.days.length - 1) return prev;
      const days = [...prev.days];
      [days[index], days[index + 1]] = [days[index + 1], days[index]];
      return {
        ...prev,
        days: days.map((d, i) => ({ ...d, day_number: i + 1 })),
      };
    });
  }

  // ── Activities ─────────────────────────────────────────────

  function addActivity(dayKey: string) {
    setData((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d._key === dayKey
          ? {
              ...d,
              activities: [
                ...d.activities,
                {
                  _key: uid(),
                  title_ar: "",
                  title_en: "",
                  description_ar: "",
                  description_en: "",
                  activity_type: "sightseeing" as ActivityType,
                  sort_order: d.activities.length,
                },
              ],
            }
          : d,
      ),
    }));
  }

  function updateActivity<K extends keyof ActivityFormEntry>(
    dayKey: string,
    actKey: string,
    field: K,
    value: ActivityFormEntry[K],
  ) {
    setData((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d._key === dayKey
          ? {
              ...d,
              activities: d.activities.map((a) =>
                a._key === actKey ? { ...a, [field]: value } : a,
              ),
            }
          : d,
      ),
    }));
  }

  function removeActivity(dayKey: string, actKey: string) {
    setData((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d._key === dayKey
          ? {
              ...d,
              activities: d.activities
                .filter((a) => a._key !== actKey)
                .map((a, i) => ({ ...a, sort_order: i })),
            }
          : d,
      ),
    }));
  }

  // ── Inclusions / Exclusions ────────────────────────────────

  function addInclusion(type: "inclusions" | "exclusions") {
    setData((prev) => ({
      ...prev,
      [type]: [...prev[type], { text_ar: "", text_en: "" }],
    }));
  }

  function updateInclusion(
    type: "inclusions" | "exclusions",
    index: number,
    field: keyof InclusionItem,
    value: string,
  ) {
    setData((prev) => ({
      ...prev,
      [type]: prev[type].map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function removeInclusion(type: "inclusions" | "exclusions", index: number) {
    setData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  }

  // ── Media ──────────────────────────────────────────────────

  async function handleMediaUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    const supabase = createClient();

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `${tenantId}/${Date.now()}-${uid()}.${ext}`;

      const { data: uploadData, error } = await supabase.storage
        .from("media")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(uploadData.path);

      setData((prev) => ({
        ...prev,
        media: [
          ...prev.media,
          {
            _key: uid(),
            url: publicUrl,
            alt_text_ar: "",
            alt_text_en: "",
            sort_order: prev.media.length,
          },
        ],
      }));
    }

    toast.success("Upload complete");
  }

  function updateMedia<K extends keyof MediaFormEntry>(
    key: string,
    field: K,
    value: MediaFormEntry[K],
  ) {
    setData((prev) => ({
      ...prev,
      media: prev.media.map((m) =>
        m._key === key ? { ...m, [field]: value } : m,
      ),
    }));
  }

  function removeMedia(key: string) {
    setData((prev) => ({
      ...prev,
      media: prev.media.filter((m) => m._key !== key),
    }));
  }

  function setCoverImage(url: string) {
    setData((prev) => ({ ...prev, cover_image_url: url }));
    toast.success("Cover image updated");
  }

  // ── Save ───────────────────────────────────────────────────

  async function handleSave() {
    // Validation
    if (!data.title_ar.trim()) {
      toast.error("Arabic title is required");
      setActiveTab("basic");
      return;
    }
    if (!data.slug.trim()) {
      toast.error("Slug is required");
      setActiveTab("basic");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      // 1. Upsert the trip
      const tripPayload = {
        tenant_id: tenantId,
        title_ar: data.title_ar,
        title_en: data.title_en,
        slug: data.slug,
        destination_ar: data.destination_ar,
        destination_en: data.destination_en,
        duration_days: data.duration_days,
        duration_nights: data.duration_nights,
        price_from: data.price_from,
        price_to: data.price_to,
        description_ar: data.description_ar,
        description_en: data.description_en,
        status: data.status,
        cover_image_url: data.cover_image_url,
        is_deal: data.is_deal,
        is_ending_soon: data.is_ending_soon,
        deal_price: data.is_deal ? data.deal_price : null,
        deal_expiry: data.is_ending_soon ? data.deal_expiry : null,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        tags: data.tags,
        inclusions: data.inclusions,
        exclusions: data.exclusions,
        updated_at: new Date().toISOString(),
      };

      let tripId: string;

      if (mode === "edit" && trip) {
        tripId = trip.id;
        const { error } = await supabase
          .from("trips")
          .update(tripPayload)
          .eq("id", tripId)
          .eq("tenant_id", tenantId);

        if (error) throw error;
      } else {
        const { data: newTrip, error } = await supabase
          .from("trips")
          .insert({ ...tripPayload, created_at: new Date().toISOString() })
          .select("id")
          .single();

        if (error) throw error;
        tripId = newTrip.id;
      }

      // 2. Manage hotels
      // Delete old trip_hotel links
      if (mode === "edit") {
        await supabase.from("trip_hotels").delete().eq("trip_id", tripId);
      }

      for (let i = 0; i < data.hotels.length; i++) {
        const h = data.hotels[i];
        let hotelId = h.id;

        if (!hotelId) {
          // Create new hotel record
          const { data: newHotel, error: hotelErr } = await supabase
            .from("hotels")
            .insert({
              tenant_id: tenantId,
              name: h.name,
              city_ar: h.city_ar,
              city_en: h.city_en,
              stars: h.stars,
            })
            .select("id")
            .single();

          if (hotelErr) throw hotelErr;
          hotelId = newHotel.id;
        } else {
          // Update existing hotel
          await supabase
            .from("hotels")
            .update({
              name: h.name,
              city_ar: h.city_ar,
              city_en: h.city_en,
              stars: h.stars,
            })
            .eq("id", hotelId);
        }

        // Create trip_hotel link
        const { error: linkErr } = await supabase.from("trip_hotels").insert({
          trip_id: tripId,
          hotel_id: hotelId,
          nights: h.nights,
          sort_order: i,
        });
        if (linkErr) throw linkErr;
      }

      // 3. Manage itinerary days & activities
      if (mode === "edit") {
        // Get existing day IDs to delete their activities
        const { data: existingDays } = await supabase
          .from("itinerary_days")
          .select("id")
          .eq("trip_id", tripId);

        if (existingDays && existingDays.length > 0) {
          await supabase
            .from("itinerary_activities")
            .delete()
            .in(
              "day_id",
              existingDays.map((d) => d.id),
            );
        }

        await supabase
          .from("itinerary_days")
          .delete()
          .eq("trip_id", tripId);
      }

      for (const day of data.days) {
        const { data: newDay, error: dayErr } = await supabase
          .from("itinerary_days")
          .insert({
            trip_id: tripId,
            day_number: day.day_number,
            title_ar: day.title_ar,
            title_en: day.title_en,
            description_ar: day.description_ar,
            description_en: day.description_en,
            city_ar: day.city_ar,
            city_en: day.city_en,
          })
          .select("id")
          .single();

        if (dayErr) throw dayErr;

        if (day.activities.length > 0) {
          const { error: actErr } = await supabase
            .from("itinerary_activities")
            .insert(
              day.activities.map((a, idx) => ({
                day_id: newDay.id,
                sort_order: idx,
                title_ar: a.title_ar,
                title_en: a.title_en,
                description_ar: a.description_ar,
                description_en: a.description_en,
                activity_type: a.activity_type,
              })),
            );
          if (actErr) throw actErr;
        }
      }

      // 4. Manage media
      if (mode === "edit") {
        await supabase.from("trip_media").delete().eq("trip_id", tripId);
      }

      if (data.media.length > 0) {
        const { error: mediaErr } = await supabase.from("trip_media").insert(
          data.media.map((m, idx) => ({
            trip_id: tripId,
            url: m.url,
            alt_text_ar: m.alt_text_ar,
            alt_text_en: m.alt_text_en,
            sort_order: idx,
          })),
        );
        if (mediaErr) throw mediaErr;
      }

      toast.success(
        mode === "create"
          ? "Trip created successfully"
          : "Trip updated successfully",
      );

      if (mode === "create") {
        router.push("/admin/trips");
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error("Failed to save trip: " + message);
    } finally {
      setSaving(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/admin/trips">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {mode === "create" ? "New Trip" : "Edit Trip"}
            </h1>
            {mode === "edit" && trip && (
              <p className="text-sm text-muted-foreground" dir="rtl">
                {trip.title_ar}
              </p>
            )}
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="me-2 h-4 w-4" />
              {mode === "create" ? "Create Trip" : "Save Changes"}
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg border bg-muted/50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {/* ─── BASIC INFO ───────────────────────────────────── */}
        {activeTab === "basic" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
                <CardDescription>
                  Core information about the trip package
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Title (Arabic) *</Label>
                    <Input
                      value={data.title_ar}
                      onChange={(e) => updateField("title_ar", e.target.value)}
                      dir="rtl"
                      placeholder="عنوان الرحلة"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (English)</Label>
                    <Input
                      value={data.title_en}
                      onChange={(e) => updateField("title_en", e.target.value)}
                      placeholder="Trip title"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Slug</Label>
                    {!slugManual && (
                      <span className="text-xs text-muted-foreground">
                        (auto-generated from English title)
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={data.slug}
                      onChange={(e) => {
                        setSlugManual(true);
                        updateField("slug", generateSlug(e.target.value));
                      }}
                      placeholder="trip-slug"
                      className="font-mono"
                    />
                    {slugManual && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSlugManual(false);
                          updateField("slug", generateSlug(data.title_en));
                        }}
                      >
                        Auto
                      </Button>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Destination (Arabic)</Label>
                    <Input
                      value={data.destination_ar}
                      onChange={(e) =>
                        updateField("destination_ar", e.target.value)
                      }
                      dir="rtl"
                      placeholder="الوجهة"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Destination (English)</Label>
                    <Input
                      value={data.destination_en}
                      onChange={(e) =>
                        updateField("destination_en", e.target.value)
                      }
                      placeholder="Destination"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Duration (Days)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={data.duration_days}
                      onChange={(e) =>
                        updateField("duration_days", parseInt(e.target.value) || 1)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (Nights)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={data.duration_nights}
                      onChange={(e) =>
                        updateField(
                          "duration_nights",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price From</Label>
                    <Input
                      type="number"
                      min={0}
                      value={data.price_from}
                      onChange={(e) =>
                        updateField("price_from", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price To</Label>
                    <Input
                      type="number"
                      min={0}
                      value={data.price_to}
                      onChange={(e) =>
                        updateField("price_to", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Description (Arabic)</Label>
                    <textarea
                      value={data.description_ar}
                      onChange={(e) =>
                        updateField("description_ar", e.target.value)
                      }
                      dir="rtl"
                      rows={5}
                      placeholder="وصف الرحلة..."
                      className="h-auto w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (English)</Label>
                    <textarea
                      value={data.description_en}
                      onChange={(e) =>
                        updateField("description_en", e.target.value)
                      }
                      rows={5}
                      placeholder="Trip description..."
                      className="h-auto w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    value={data.status}
                    onChange={(e) =>
                      updateField("status", e.target.value as TripStatus)
                    }
                    className="h-9 w-full max-w-xs rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ─── HOTELS ───────────────────────────────────────── */}
        {activeTab === "hotels" && (
          <Card>
            <CardHeader>
              <CardTitle>Hotels</CardTitle>
              <CardDescription>
                Add hotels included in this trip package
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.hotels.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No hotels added yet.
                </p>
              )}

              {data.hotels.map((hotel, index) => (
                <div
                  key={hotel._key}
                  className="rounded-lg border bg-muted/30 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Hotel {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeHotel(hotel._key)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Hotel Name</Label>
                      <Input
                        value={hotel.name}
                        onChange={(e) =>
                          updateHotel(hotel._key, "name", e.target.value)
                        }
                        placeholder="Hotel name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Stars</Label>
                        <select
                          value={hotel.stars}
                          onChange={(e) =>
                            updateHotel(
                              hotel._key,
                              "stars",
                              parseInt(e.target.value),
                            )
                          }
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          {[1, 2, 3, 4, 5].map((s) => (
                            <option key={s} value={s}>
                              {s} Star{s > 1 ? "s" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Nights</Label>
                        <Input
                          type="number"
                          min={1}
                          value={hotel.nights}
                          onChange={(e) =>
                            updateHotel(
                              hotel._key,
                              "nights",
                              parseInt(e.target.value) || 1,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs">City (Arabic)</Label>
                      <Input
                        value={hotel.city_ar}
                        onChange={(e) =>
                          updateHotel(hotel._key, "city_ar", e.target.value)
                        }
                        dir="rtl"
                        placeholder="المدينة"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">City (English)</Label>
                      <Input
                        value={hotel.city_en}
                        onChange={(e) =>
                          updateHotel(hotel._key, "city_en", e.target.value)
                        }
                        placeholder="City"
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-0.5">
                    {Array.from({ length: hotel.stars }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addHotel}>
                <Plus className="me-2 h-4 w-4" />
                Add Hotel
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ─── ITINERARY ────────────────────────────────────── */}
        {activeTab === "itinerary" && (
          <Card>
            <CardHeader>
              <CardTitle>Itinerary</CardTitle>
              <CardDescription>
                Build the day-by-day schedule for this trip
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.days.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No days added yet. Start building your itinerary.
                </p>
              )}

              {data.days.map((day, dayIndex) => (
                <div
                  key={day._key}
                  className="rounded-lg border bg-muted/30 p-4"
                >
                  {/* Day header */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Day {day.day_number}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => moveDayUp(dayIndex)}
                        disabled={dayIndex === 0}
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => moveDayDown(dayIndex)}
                        disabled={dayIndex === data.days.length - 1}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeDay(day._key)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {/* Day fields */}
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Title (Arabic)</Label>
                      <Input
                        value={day.title_ar}
                        onChange={(e) =>
                          updateDay(day._key, "title_ar", e.target.value)
                        }
                        dir="rtl"
                        placeholder="عنوان اليوم"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Title (English)</Label>
                      <Input
                        value={day.title_en}
                        onChange={(e) =>
                          updateDay(day._key, "title_en", e.target.value)
                        }
                        placeholder="Day title"
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs">City (Arabic)</Label>
                      <Input
                        value={day.city_ar}
                        onChange={(e) =>
                          updateDay(day._key, "city_ar", e.target.value)
                        }
                        dir="rtl"
                        placeholder="المدينة"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">City (English)</Label>
                      <Input
                        value={day.city_en}
                        onChange={(e) =>
                          updateDay(day._key, "city_en", e.target.value)
                        }
                        placeholder="City"
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Description (Arabic)</Label>
                      <textarea
                        value={day.description_ar}
                        onChange={(e) =>
                          updateDay(day._key, "description_ar", e.target.value)
                        }
                        dir="rtl"
                        rows={3}
                        placeholder="وصف اليوم..."
                        className="h-auto w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Description (English)</Label>
                      <textarea
                        value={day.description_en}
                        onChange={(e) =>
                          updateDay(day._key, "description_en", e.target.value)
                        }
                        rows={3}
                        placeholder="Day description..."
                        className="h-auto w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Activities
                      </Label>
                    </div>

                    {day.activities.length === 0 && (
                      <p className="py-2 text-xs text-muted-foreground">
                        No activities for this day.
                      </p>
                    )}

                    {day.activities.map((act, actIndex) => (
                      <div
                        key={act._key}
                        className="mb-3 rounded-md border bg-background p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            Activity {actIndex + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() =>
                              removeActivity(day._key, act._key)
                            }
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid gap-2 md:grid-cols-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Title (AR)</Label>
                            <Input
                              value={act.title_ar}
                              onChange={(e) =>
                                updateActivity(
                                  day._key,
                                  act._key,
                                  "title_ar",
                                  e.target.value,
                                )
                              }
                              dir="rtl"
                              placeholder="العنوان"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Title (EN)</Label>
                            <Input
                              value={act.title_en}
                              onChange={(e) =>
                                updateActivity(
                                  day._key,
                                  act._key,
                                  "title_en",
                                  e.target.value,
                                )
                              }
                              placeholder="Title"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Type</Label>
                            <select
                              value={act.activity_type}
                              onChange={(e) =>
                                updateActivity(
                                  day._key,
                                  act._key,
                                  "activity_type",
                                  e.target.value as ActivityType,
                                )
                              }
                              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                              {ACTIVITY_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="mt-2 grid gap-2 md:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Description (AR)</Label>
                            <textarea
                              value={act.description_ar}
                              onChange={(e) =>
                                updateActivity(
                                  day._key,
                                  act._key,
                                  "description_ar",
                                  e.target.value,
                                )
                              }
                              dir="rtl"
                              rows={2}
                              placeholder="الوصف..."
                              className="h-auto w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Description (EN)</Label>
                            <textarea
                              value={act.description_en}
                              onChange={(e) =>
                                updateActivity(
                                  day._key,
                                  act._key,
                                  "description_en",
                                  e.target.value,
                                )
                              }
                              rows={2}
                              placeholder="Description..."
                              className="h-auto w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addActivity(day._key)}
                    >
                      <Plus className="me-1.5 h-3.5 w-3.5" />
                      Add Activity
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addDay}>
                <Plus className="me-2 h-4 w-4" />
                Add Day
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ─── INCLUSIONS ───────────────────────────────────── */}
        {activeTab === "inclusions" && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Included */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">
                  Included
                </CardTitle>
                <CardDescription>
                  What is included in the trip package
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.inclusions.length === 0 && (
                  <p className="py-2 text-center text-sm text-muted-foreground">
                    No inclusions added.
                  </p>
                )}

                {data.inclusions.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="grid flex-1 gap-2 md:grid-cols-2">
                      <Input
                        value={item.text_ar}
                        onChange={(e) =>
                          updateInclusion(
                            "inclusions",
                            index,
                            "text_ar",
                            e.target.value,
                          )
                        }
                        dir="rtl"
                        placeholder="يشمل..."
                      />
                      <Input
                        value={item.text_en}
                        onChange={(e) =>
                          updateInclusion(
                            "inclusions",
                            index,
                            "text_en",
                            e.target.value,
                          )
                        }
                        placeholder="Includes..."
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeInclusion("inclusions", index)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addInclusion("inclusions")}
                >
                  <Plus className="me-1.5 h-3.5 w-3.5" />
                  Add Item
                </Button>
              </CardContent>
            </Card>

            {/* Not Included */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400">
                  Not Included
                </CardTitle>
                <CardDescription>
                  What is NOT included in the trip package
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.exclusions.length === 0 && (
                  <p className="py-2 text-center text-sm text-muted-foreground">
                    No exclusions added.
                  </p>
                )}

                {data.exclusions.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="grid flex-1 gap-2 md:grid-cols-2">
                      <Input
                        value={item.text_ar}
                        onChange={(e) =>
                          updateInclusion(
                            "exclusions",
                            index,
                            "text_ar",
                            e.target.value,
                          )
                        }
                        dir="rtl"
                        placeholder="لا يشمل..."
                      />
                      <Input
                        value={item.text_en}
                        onChange={(e) =>
                          updateInclusion(
                            "exclusions",
                            index,
                            "text_en",
                            e.target.value,
                          )
                        }
                        placeholder="Does not include..."
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeInclusion("exclusions", index)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addInclusion("exclusions")}
                >
                  <Plus className="me-1.5 h-3.5 w-3.5" />
                  Add Item
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── DEAL SETTINGS ────────────────────────────────── */}
        {activeTab === "deal" && (
          <Card>
            <CardHeader>
              <CardTitle>Deal Settings</CardTitle>
              <CardDescription>
                Configure promotional pricing and urgency indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* is_deal toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Mark as Deal</p>
                  <p className="text-sm text-muted-foreground">
                    Feature this trip as a special deal on the homepage
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={data.is_deal}
                  onClick={() => updateField("is_deal", !data.is_deal)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    data.is_deal ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg transition-transform ${
                      data.is_deal ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {data.is_deal && (
                <div className="space-y-2">
                  <Label>Deal Price</Label>
                  <Input
                    type="number"
                    min={0}
                    value={data.deal_price ?? ""}
                    onChange={(e) =>
                      updateField(
                        "deal_price",
                        e.target.value ? parseFloat(e.target.value) : null,
                      )
                    }
                    placeholder="Special deal price"
                    className="max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    The discounted price shown to customers
                  </p>
                </div>
              )}

              <Separator />

              {/* is_ending_soon toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Ending Soon</p>
                  <p className="text-sm text-muted-foreground">
                    Show an urgency badge to encourage bookings
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={data.is_ending_soon}
                  onClick={() =>
                    updateField("is_ending_soon", !data.is_ending_soon)
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    data.is_ending_soon ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg transition-transform ${
                      data.is_ending_soon ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {data.is_ending_soon && (
                <div className="space-y-2">
                  <Label>Deal Expiry Date</Label>
                  <Input
                    type="date"
                    value={data.deal_expiry?.split("T")[0] ?? ""}
                    onChange={(e) =>
                      updateField(
                        "deal_expiry",
                        e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null,
                      )
                    }
                    className="max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    When the deal expires. The &quot;ending soon&quot; badge
                    will auto-hide after this date.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ─── MEDIA ────────────────────────────────────────── */}
        {activeTab === "media" && (
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>
                Upload and manage images for this trip
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload area */}
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 py-10 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50">
                <Upload className="h-8 w-8 text-muted-foreground/50" />
                <div className="text-center">
                  <p className="text-sm font-medium">Click to upload images</p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP up to 5MB each
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleMediaUpload(e.target.files)}
                />
              </label>

              {/* Current cover */}
              {data.cover_image_url && (
                <div className="rounded-lg border p-3">
                  <Label className="mb-2 text-xs text-muted-foreground">
                    Current Cover Image
                  </Label>
                  <div className="relative h-32 w-48 overflow-hidden rounded-md">
                    <Image
                      src={data.cover_image_url}
                      alt="Cover"
                      fill
                      className="object-cover"
                      sizes="192px"
                    />
                  </div>
                </div>
              )}

              {/* Image list */}
              {data.media.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No images uploaded yet.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.media.map((m) => (
                    <div
                      key={m._key}
                      className="overflow-hidden rounded-lg border"
                    >
                      <div className="relative aspect-video bg-muted">
                        <Image
                          src={m.url}
                          alt={m.alt_text_en || "Trip image"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        {data.cover_image_url === m.url && (
                          <div className="absolute start-2 top-2 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                            Cover
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 p-3">
                        <Input
                          value={m.alt_text_ar}
                          onChange={(e) =>
                            updateMedia(m._key, "alt_text_ar", e.target.value)
                          }
                          dir="rtl"
                          placeholder="نص بديل (عربي)"
                          className="text-xs"
                        />
                        <Input
                          value={m.alt_text_en}
                          onChange={(e) =>
                            updateMedia(m._key, "alt_text_en", e.target.value)
                          }
                          placeholder="Alt text (English)"
                          className="text-xs"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => setCoverImage(m.url)}
                            disabled={data.cover_image_url === m.url}
                          >
                            <ImageIcon className="me-1 h-3 w-3" />
                            {data.cover_image_url === m.url
                              ? "Cover"
                              : "Set Cover"}
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => removeMedia(m._key)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="me-1 h-3 w-3" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ─── SEO ──────────────────────────────────────────── */}
        {activeTab === "seo" && (
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Search engine optimization metadata for this trip page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input
                  value={data.meta_title ?? ""}
                  onChange={(e) =>
                    updateField(
                      "meta_title",
                      e.target.value || null,
                    )
                  }
                  placeholder="Page title for search engines"
                />
                <p className="text-xs text-muted-foreground">
                  {(data.meta_title ?? "").length}/60 characters recommended
                </p>
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <textarea
                  value={data.meta_description ?? ""}
                  onChange={(e) =>
                    updateField(
                      "meta_description",
                      e.target.value || null,
                    )
                  }
                  rows={3}
                  placeholder="Brief description for search engine results..."
                  className="h-auto w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  {(data.meta_description ?? "").length}/160 characters
                  recommended
                </p>
              </div>

              {/* Preview */}
              <Separator />
              <div>
                <Label className="mb-2 text-xs text-muted-foreground">
                  Search Result Preview
                </Label>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-lg text-blue-600">
                    {data.meta_title || data.title_en || data.title_ar || "Page Title"}
                  </p>
                  <p className="text-sm text-green-700">
                    example.com/trips/{data.slug || "trip-slug"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data.meta_description ||
                      data.description_en?.slice(0, 160) ||
                      "No description set"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom save button (always visible) */}
      <div className="mt-8 flex justify-end border-t pt-6">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="me-2 h-4 w-4" />
              {mode === "create" ? "Create Trip" : "Save Changes"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
