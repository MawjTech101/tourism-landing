"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2, Save } from "lucide-react";
import { createTenantAction } from "@/app/admin/(authenticated)/tenants/actions";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export function TenantForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  const [data, setData] = useState({
    name: "",
    slug: "",
    custom_domain: "",
    plan: "free" as "free" | "pro" | "enterprise",
    // Site config
    company_name_ar: "",
    company_name_en: "",
    color_primary: "#51487E",
    color_secondary: "#AB4E83",
    color_accent: "#818181",
    // Admin user
    admin_email: "",
    admin_password: "",
    admin_display_name: "",
  });

  function updateField(field: string, value: string) {
    setData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "name" && !slugEdited) {
        updated.slug = slugify(value);
      }
      if (field === "name" && !prev.company_name_en) {
        updated.company_name_en = value;
      }
      return updated;
    });
  }

  async function handleSave() {
    if (!data.name || !data.slug) {
      toast.error("Tenant name and slug are required");
      return;
    }
    if (!data.admin_email || !data.admin_password) {
      toast.error("Admin email and password are required");
      return;
    }
    if (data.admin_password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSaving(true);

    try {
      const result = await createTenantAction(data);

      if (result.error) {
        toast.error(result.error);
        setSaving(false);
        return;
      }

      toast.success("Tenant created successfully with admin user!");
      router.push("/admin/tenants");
      router.refresh();
    } catch (err) {
      toast.error(
        "Error: " + (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Tenant Info */}
      <Card>
        <CardHeader>
          <CardTitle>Tenant Details</CardTitle>
          <CardDescription>
            Basic information about the new tenant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tenant Name *</Label>
            <Input
              value={data.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Otolat Travel Agency"
            />
          </div>

          <div className="space-y-2">
            <Label>Slug *</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/</span>
              <Input
                value={data.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setData((prev) => ({ ...prev, slug: e.target.value }));
                }}
                className="font-mono"
                placeholder="otolat"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Used for subdomain routing: {data.slug || "slug"}.yourdomain.com
            </p>
          </div>

          <div className="space-y-2">
            <Label>Custom Domain (optional)</Label>
            <Input
              value={data.custom_domain}
              onChange={(e) => updateField("custom_domain", e.target.value)}
              placeholder="www.otolat.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Plan</Label>
            <select
              value={data.plan}
              onChange={(e) =>
                updateField("plan", e.target.value)
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            Company name and theme colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Company Name (Arabic)</Label>
              <Input
                value={data.company_name_ar}
                onChange={(e) => updateField("company_name_ar", e.target.value)}
                dir="rtl"
                placeholder="اسم الشركة"
              />
            </div>
            <div className="space-y-2">
              <Label>Company Name (English)</Label>
              <Input
                value={data.company_name_en}
                onChange={(e) => updateField("company_name_en", e.target.value)}
                placeholder="Company Name"
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={data.color_primary}
                  onChange={(e) => updateField("color_primary", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border"
                />
                <Input
                  value={data.color_primary}
                  onChange={(e) => updateField("color_primary", e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={data.color_secondary}
                  onChange={(e) => updateField("color_secondary", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border"
                />
                <Input
                  value={data.color_secondary}
                  onChange={(e) => updateField("color_secondary", e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={data.color_accent}
                  onChange={(e) => updateField("color_accent", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border"
                />
                <Input
                  value={data.color_accent}
                  onChange={(e) => updateField("color_accent", e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin User */}
      <Card>
        <CardHeader>
          <CardTitle>Admin User</CardTitle>
          <CardDescription>
            First admin user for this tenant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input
              value={data.admin_display_name}
              onChange={(e) => updateField("admin_display_name", e.target.value)}
              placeholder="Admin"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={data.admin_email}
                onChange={(e) => updateField("admin_email", e.target.value)}
                placeholder="admin@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input
                type="password"
                value={data.admin_password}
                onChange={(e) => updateField("admin_password", e.target.value)}
                placeholder="Min 6 characters"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/tenants")}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="me-2 h-4 w-4" />
              Create Tenant
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
