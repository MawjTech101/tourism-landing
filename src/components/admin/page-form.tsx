"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface PageData {
  id?: string;
  title_ar: string;
  title_en: string;
  slug: string;
  content_ar: string;
  content_en: string;
  is_published: boolean;
}

interface PageFormProps {
  tenantId: string;
  initialData?: PageData;
  mode: "create" | "edit";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function PageForm({ tenantId, initialData, mode }: PageFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [form, setForm] = useState<PageData>(
    initialData ?? {
      title_ar: "",
      title_en: "",
      slug: "",
      content_ar: "",
      content_en: "",
      is_published: false,
    }
  );

  // Auto-generate slug from English title (only if slug hasn't been manually edited)
  useEffect(() => {
    if (mode === "create" && !slugManuallyEdited) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title_en) }));
    }
  }, [form.title_en, mode, slugManuallyEdited]);

  function updateField<K extends keyof PageData>(field: K, value: PageData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.title_en && !form.title_ar) {
      toast.error("Please provide at least one title (Arabic or English).");
      return;
    }

    if (!form.slug) {
      toast.error("Slug is required.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    if (mode === "create") {
      const { error } = await supabase.from("pages").insert({
        tenant_id: tenantId,
        title_ar: form.title_ar || null,
        title_en: form.title_en || null,
        slug: form.slug,
        content_ar: form.content_ar || null,
        content_en: form.content_en || null,
        is_published: form.is_published,
      });

      setSaving(false);

      if (error) {
        if (error.code === "23505") {
          toast.error("A page with this slug already exists.");
        } else {
          toast.error("Failed to create page: " + error.message);
        }
        return;
      }

      toast.success("Page created successfully.");
      router.push("/admin/pages");
    } else {
      const { error } = await supabase
        .from("pages")
        .update({
          title_ar: form.title_ar || null,
          title_en: form.title_en || null,
          slug: form.slug,
          content_ar: form.content_ar || null,
          content_en: form.content_en || null,
          is_published: form.is_published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", initialData?.id)
        .eq("tenant_id", tenantId);

      setSaving(false);

      if (error) {
        if (error.code === "23505") {
          toast.error("A page with this slug already exists.");
        } else {
          toast.error("Failed to update page: " + error.message);
        }
        return;
      }

      toast.success("Page updated successfully.");
      router.push("/admin/pages");
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Slug */}
      <Card>
        <CardHeader>
          <CardTitle>Page Details</CardTitle>
          <CardDescription>Title and URL slug for the page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Title (Arabic)</Label>
              <Input
                value={form.title_ar}
                onChange={(e) => updateField("title_ar", e.target.value)}
                dir="rtl"
                placeholder="عنوان الصفحة"
              />
            </div>
            <div className="space-y-2">
              <Label>Title (English)</Label>
              <Input
                value={form.title_en}
                onChange={(e) => updateField("title_en", e.target.value)}
                placeholder="Page title"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/</span>
              <Input
                value={form.slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  updateField("slug", slugify(e.target.value));
                }}
                placeholder="page-url-slug"
                className="font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              URL-friendly identifier. Auto-generated from the English title.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>
            Page content in Arabic and English. Rich text editor coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Content (Arabic)</Label>
            <textarea
              value={form.content_ar}
              onChange={(e) => updateField("content_ar", e.target.value)}
              dir="rtl"
              rows={10}
              placeholder="محتوى الصفحة بالعربية..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <Label>Content (English)</Label>
            <textarea
              value={form.content_en}
              onChange={(e) => updateField("content_en", e.target.value)}
              rows={10}
              placeholder="Page content in English..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Publishing & Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => updateField("is_published", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <div>
              <span className="text-sm font-medium">Publish this page</span>
              <p className="text-xs text-muted-foreground">
                Published pages are visible on the public website.
              </p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/pages")}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="me-2 h-4 w-4" />
              {mode === "create" ? "Create Page" : "Save Changes"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
