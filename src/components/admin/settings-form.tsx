"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ImageIcon, Loader2, Save, Upload } from "lucide-react";
import type { SiteConfig } from "@/lib/tenant/types";

interface SettingsFormProps {
  initialConfig: SiteConfig;
  tenantId: string;
}

type UploadTarget = "logo" | "logo_dark" | "favicon" | "og_image" | "hero_image";

const UPLOAD_CONFIG: Record<
  UploadTarget,
  {
    field: keyof SiteConfig;
    path: string;
    accept: string;
    maxSize: number;
    maxSizeLabel: string;
  }
> = {
  logo: {
    field: "logo_url",
    path: "branding/logo",
    accept: "image/png,image/svg+xml,image/jpeg,image/webp",
    maxSize: 2 * 1024 * 1024,
    maxSizeLabel: "2MB",
  },
  logo_dark: {
    field: "logo_dark_url",
    path: "branding/logo-dark",
    accept: "image/png,image/svg+xml,image/jpeg,image/webp",
    maxSize: 2 * 1024 * 1024,
    maxSizeLabel: "2MB",
  },
  favicon: {
    field: "favicon_url",
    path: "branding/favicon",
    accept: "image/png,image/x-icon,image/svg+xml",
    maxSize: 500 * 1024,
    maxSizeLabel: "500KB",
  },
  og_image: {
    field: "og_image_url",
    path: "branding/og-image",
    accept: "image/png,image/jpeg,image/webp",
    maxSize: 2 * 1024 * 1024,
    maxSizeLabel: "2MB",
  },
  hero_image: {
    field: "hero_image_url",
    path: "branding/hero",
    accept: "image/png,image/jpeg,image/webp",
    maxSize: 5 * 1024 * 1024,
    maxSizeLabel: "5MB",
  },
};

export function SettingsForm({ initialConfig, tenantId }: SettingsFormProps) {
  const [config, setConfig] = useState(initialConfig);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<Record<UploadTarget, boolean>>({
    logo: false,
    logo_dark: false,
    favicon: false,
    og_image: false,
    hero_image: false,
  });

  const logoRef = useRef<HTMLInputElement>(null);
  const logoDarkRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);
  const ogImageRef = useRef<HTMLInputElement>(null);
  const heroImageRef = useRef<HTMLInputElement>(null);

  const fileInputRefs: Record<UploadTarget, React.RefObject<HTMLInputElement | null>> = {
    logo: logoRef,
    logo_dark: logoDarkRef,
    favicon: faviconRef,
    og_image: ogImageRef,
    hero_image: heroImageRef,
  };

  function updateField<K extends keyof SiteConfig>(
    field: K,
    value: SiteConfig[K],
  ) {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }

  function updateSocialLink(key: string, value: string) {
    setConfig((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [key]: value },
    }));
  }

  async function handleFileUpload(target: UploadTarget, file: File) {
    const cfg = UPLOAD_CONFIG[target];

    if (file.size > cfg.maxSize) {
      toast.error(`File too large. Maximum size is ${cfg.maxSizeLabel}.`);
      return;
    }

    setUploading((prev) => ({ ...prev, [target]: true }));

    try {
      const supabase = createClient();

      // Delete old file if exists (handles extension changes, e.g. png→jpg)
      const oldUrl = config[cfg.field] as string | null;
      if (oldUrl) {
        const oldPath = oldUrl.split("/media/")[1];
        if (oldPath) {
          await supabase.storage.from("media").remove([decodeURIComponent(oldPath)]);
        }
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const storagePath = `${tenantId}/${cfg.path}.${ext}`;

      const { data, error } = await supabase.storage
        .from("media")
        .upload(storagePath, file, { upsert: true, contentType: file.type });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(data.path);

      // Cache-bust so browser shows the new image immediately
      const bustUrl = `${publicUrl}?t=${Date.now()}`;
      updateField(cfg.field as keyof SiteConfig, bustUrl as never);
      toast.success("File uploaded successfully");
    } catch (err) {
      toast.error(
        `Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setUploading((prev) => ({ ...prev, [target]: false }));
    }
  }

  function onFileChange(target: UploadTarget, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileUpload(target, file);
    e.target.value = "";
  }

  async function handleSave() {
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("site_config")
      .update({
        company_name_ar: config.company_name_ar,
        company_name_en: config.company_name_en,
        logo_url: config.logo_url,
        logo_dark_url: config.logo_dark_url,
        favicon_url: config.favicon_url,
        color_primary: config.color_primary,
        color_secondary: config.color_secondary,
        color_accent: config.color_accent,
        whatsapp_number: config.whatsapp_number,
        email: config.email,
        address_ar: config.address_ar,
        address_en: config.address_en,
        google_maps_url: config.google_maps_url,
        social_links: config.social_links,
        hero_image_url: config.hero_image_url,
        hero_title_ar: config.hero_title_ar,
        hero_title_en: config.hero_title_en,
        hero_subtitle_ar: config.hero_subtitle_ar,
        hero_subtitle_en: config.hero_subtitle_en,
        hero_cta_text_ar: config.hero_cta_text_ar,
        hero_cta_text_en: config.hero_cta_text_en,
        hero_cta_link: config.hero_cta_link,
        footer_about_ar: config.footer_about_ar,
        footer_about_en: config.footer_about_en,
        copyright_text_ar: config.copyright_text_ar,
        copyright_text_en: config.copyright_text_en,
        og_image_url: config.og_image_url,
        meta_title_ar: config.meta_title_ar,
        meta_title_en: config.meta_title_en,
        meta_description_ar: config.meta_description_ar,
        meta_description_en: config.meta_description_en,
        updated_at: new Date().toISOString(),
      })
      .eq("tenant_id", tenantId);

    setSaving(false);

    if (error) {
      toast.error("Failed to save settings: " + error.message);
      return;
    }

    toast.success("Settings saved successfully");
  }

  function renderImageUpload({
    target,
    label,
    description,
    previewSize = "h-16 max-w-[200px]",
    placeholderSize = "h-16 w-32",
  }: {
    target: UploadTarget;
    label: string;
    description?: string;
    previewSize?: string;
    placeholderSize?: string;
  }) {
    const cfg = UPLOAD_CONFIG[target];
    const url = config[cfg.field] as string | null;
    const isUploading = uploading[target];
    const ref = fileInputRefs[target];

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        <div className="flex items-center gap-4">
          {url ? (
            <img
              src={url}
              alt={label}
              className={`${previewSize} object-contain rounded border p-2`}
            />
          ) : (
            <div
              className={`flex ${placeholderSize} items-center justify-center rounded border-2 border-dashed text-muted-foreground`}
            >
              <ImageIcon className="h-5 w-5" />
            </div>
          )}
          <div>
            <input
              ref={ref}
              type="file"
              accept={cfg.accept}
              onChange={(e) => onFileChange(target, e)}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => ref.current?.click()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="me-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">
              Max {cfg.maxSizeLabel}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logo & Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Logo & Branding</CardTitle>
          <CardDescription>
            Upload your logos and favicon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderImageUpload({
            target: "logo",
            label: "Logo",
            description: "Main logo displayed on light backgrounds",
          })}
          <Separator />
          {renderImageUpload({
            target: "logo_dark",
            label: "Dark Logo",
            description: "Logo variant for dark backgrounds",
          })}
          <Separator />
          {renderImageUpload({
            target: "favicon",
            label: "Favicon",
            description: "Browser tab icon (PNG, ICO, or SVG)",
            previewSize: "h-10 w-10",
            placeholderSize: "h-10 w-10",
          })}
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle>Company Info</CardTitle>
          <CardDescription>
            Your company name and basic branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Company Name (Arabic)</Label>
              <Input
                value={config.company_name_ar}
                onChange={(e) =>
                  updateField("company_name_ar", e.target.value)
                }
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>Company Name (English)</Label>
              <Input
                value={config.company_name_en}
                onChange={(e) =>
                  updateField("company_name_en", e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Colors</CardTitle>
          <CardDescription>
            Customize your brand colors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.color_primary}
                  onChange={(e) =>
                    updateField("color_primary", e.target.value)
                  }
                  className="h-10 w-10 cursor-pointer rounded border"
                />
                <Input
                  value={config.color_primary}
                  onChange={(e) =>
                    updateField("color_primary", e.target.value)
                  }
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.color_secondary}
                  onChange={(e) =>
                    updateField("color_secondary", e.target.value)
                  }
                  className="h-10 w-10 cursor-pointer rounded border"
                />
                <Input
                  value={config.color_secondary}
                  onChange={(e) =>
                    updateField("color_secondary", e.target.value)
                  }
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.color_accent}
                  onChange={(e) =>
                    updateField("color_accent", e.target.value)
                  }
                  className="h-10 w-10 cursor-pointer rounded border"
                />
                <Input
                  value={config.color_accent}
                  onChange={(e) =>
                    updateField("color_accent", e.target.value)
                  }
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          {/* Color preview */}
          <Separator className="my-6" />
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <div className="flex gap-3">
              <div
                className="h-12 w-24 rounded-md"
                style={{ backgroundColor: config.color_primary }}
              />
              <div
                className="h-12 w-24 rounded-md"
                style={{ backgroundColor: config.color_secondary }}
              />
              <div
                className="h-12 w-24 rounded-md"
                style={{ backgroundColor: config.color_accent }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            How customers can reach you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input
                value={config.whatsapp_number || ""}
                onChange={(e) =>
                  updateField("whatsapp_number", e.target.value)
                }
                placeholder="+966XXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={config.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="info@example.com"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Address (Arabic)</Label>
              <Input
                value={config.address_ar || ""}
                onChange={(e) =>
                  updateField("address_ar", e.target.value)
                }
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>Address (English)</Label>
              <Input
                value={config.address_en || ""}
                onChange={(e) =>
                  updateField("address_en", e.target.value)
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Google Maps URL</Label>
            <Input
              value={config.google_maps_url || ""}
              onChange={(e) =>
                updateField("google_maps_url", e.target.value)
              }
              placeholder="https://maps.google.com/..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>
            Your social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input
                value={config.social_links?.instagram || ""}
                onChange={(e) => updateSocialLink("instagram", e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label>Twitter / X</Label>
              <Input
                value={config.social_links?.twitter || ""}
                onChange={(e) => updateSocialLink("twitter", e.target.value)}
                placeholder="https://x.com/..."
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>TikTok</Label>
              <Input
                value={config.social_links?.tiktok || ""}
                onChange={(e) => updateSocialLink("tiktok", e.target.value)}
                placeholder="https://tiktok.com/@..."
              />
            </div>
            <div className="space-y-2">
              <Label>Snapchat</Label>
              <Input
                value={config.social_links?.snapchat || ""}
                onChange={(e) => updateSocialLink("snapchat", e.target.value)}
                placeholder="https://snapchat.com/add/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hero Banner */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Banner</CardTitle>
          <CardDescription>
            Homepage hero section content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderImageUpload({
            target: "hero_image",
            label: "Hero Background Image",
            description: "Background image for the homepage hero section (recommended 1920x1080). Falls back to gradient when not set.",
            previewSize: "h-24 max-w-[300px]",
            placeholderSize: "h-24 w-48",
          })}

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Headline (Arabic)</Label>
              <Input
                value={config.hero_title_ar || ""}
                onChange={(e) =>
                  updateField("hero_title_ar", e.target.value)
                }
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>Headline (English)</Label>
              <Input
                value={config.hero_title_en || ""}
                onChange={(e) =>
                  updateField("hero_title_en", e.target.value)
                }
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Subtitle (Arabic)</Label>
              <Input
                value={config.hero_subtitle_ar || ""}
                onChange={(e) =>
                  updateField("hero_subtitle_ar", e.target.value)
                }
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle (English)</Label>
              <Input
                value={config.hero_subtitle_en || ""}
                onChange={(e) =>
                  updateField("hero_subtitle_en", e.target.value)
                }
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>CTA Button Text (Arabic)</Label>
              <Input
                value={config.hero_cta_text_ar || ""}
                onChange={(e) =>
                  updateField("hero_cta_text_ar", e.target.value)
                }
                dir="rtl"
                placeholder="تسوّق الآن"
              />
            </div>
            <div className="space-y-2">
              <Label>CTA Button Text (English)</Label>
              <Input
                value={config.hero_cta_text_en || ""}
                onChange={(e) =>
                  updateField("hero_cta_text_en", e.target.value)
                }
                placeholder="Shop Now"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>CTA Link URL</Label>
            <Input
              value={config.hero_cta_link || ""}
              onChange={(e) =>
                updateField("hero_cta_link", e.target.value)
              }
              placeholder="/products or https://..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardHeader>
          <CardTitle>Footer</CardTitle>
          <CardDescription>Footer content and copyright</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>About Text (Arabic)</Label>
              <Input
                value={config.footer_about_ar || ""}
                onChange={(e) =>
                  updateField("footer_about_ar", e.target.value)
                }
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>About Text (English)</Label>
              <Input
                value={config.footer_about_en || ""}
                onChange={(e) =>
                  updateField("footer_about_en", e.target.value)
                }
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Copyright (Arabic)</Label>
              <Input
                value={config.copyright_text_ar || ""}
                onChange={(e) =>
                  updateField("copyright_text_ar", e.target.value)
                }
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>Copyright (English)</Label>
              <Input
                value={config.copyright_text_en || ""}
                onChange={(e) =>
                  updateField("copyright_text_en", e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO & Meta</CardTitle>
          <CardDescription>
            Search engine optimization and social sharing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Meta Title (Arabic)</Label>
              <Input
                value={config.meta_title_ar || ""}
                onChange={(e) =>
                  updateField("meta_title_ar", e.target.value)
                }
                dir="rtl"
                placeholder="عنوان الموقع"
              />
            </div>
            <div className="space-y-2">
              <Label>Meta Title (English)</Label>
              <Input
                value={config.meta_title_en || ""}
                onChange={(e) =>
                  updateField("meta_title_en", e.target.value)
                }
                placeholder="Site Title"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Meta Description (Arabic)</Label>
              <Textarea
                value={config.meta_description_ar || ""}
                onChange={(e) =>
                  updateField("meta_description_ar", e.target.value)
                }
                dir="rtl"
                rows={3}
                placeholder="وصف الموقع لمحركات البحث"
              />
            </div>
            <div className="space-y-2">
              <Label>Meta Description (English)</Label>
              <Textarea
                value={config.meta_description_en || ""}
                onChange={(e) =>
                  updateField("meta_description_en", e.target.value)
                }
                rows={3}
                placeholder="Site description for search engines"
              />
            </div>
          </div>

          <Separator />

          {renderImageUpload({
            target: "og_image",
            label: "OG Image",
            description:
              "Image shown when sharing on social media (recommended 1200x630)",
            previewSize: "h-20 max-w-[200px]",
            placeholderSize: "h-20 w-36",
          })}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="me-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
