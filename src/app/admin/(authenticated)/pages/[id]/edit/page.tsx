import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/tenant/config";
import { PageForm } from "@/components/admin/page-form";
import { notFound } from "next/navigation";
import Link from "next/link";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPagePage({ params }: EditPageProps) {
  const { id } = await params;
  const tenant = await getTenant();

  if (!tenant) {
    return <div className="text-muted-foreground">Tenant not found.</div>;
  }

  const supabase = await createClient();

  const { data: page, error } = await supabase
    .from("pages")
    .select("id, title_ar, title_en, slug, content_ar, content_en, is_published")
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .single();

  if (error || !page) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/admin/pages" className="hover:text-foreground">
            Pages
          </Link>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1 className="text-2xl font-bold">
          Edit: {page.title_en || page.title_ar || "Untitled"}
        </h1>
      </div>
      <PageForm
        tenantId={tenant.id}
        mode="edit"
        initialData={{
          id: page.id,
          title_ar: page.title_ar ?? "",
          title_en: page.title_en ?? "",
          slug: page.slug,
          content_ar: page.content_ar ?? "",
          content_en: page.content_en ?? "",
          is_published: page.is_published,
        }}
      />
    </div>
  );
}
