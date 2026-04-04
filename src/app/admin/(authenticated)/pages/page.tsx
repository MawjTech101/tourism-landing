import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/tenant/config";
import { isValidUUID } from "@/lib/security/validate";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

interface Page {
  id: string;
  slug: string;
  title_en: string | null;
  title_ar: string | null;
  is_published: boolean;
  updated_at: string;
}

async function togglePublish(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const currentState = formData.get("isPublished") === "true";

  if (!id || !isValidUUID(id)) {
    return;
  }

  const tenant = await getTenant();
  if (!tenant) {
    return;
  }

  const supabase = await createClient();

  await supabase
    .from("pages")
    .update({ is_published: !currentState, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("tenant_id", tenant.id);

  revalidatePath("/admin/pages");
}

export default async function PagesListPage() {
  const tenant = await getTenant();

  if (!tenant) {
    return <div className="text-muted-foreground">Tenant not found.</div>;
  }

  const supabase = await createClient();

  const { data: pages, error } = await supabase
    .from("pages")
    .select("id, slug, title_en, title_ar, is_published, updated_at")
    .eq("tenant_id", tenant.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <div className="text-destructive">
        Failed to load pages: {error.message}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your website&apos;s static pages
          </p>
        </div>
        <Button asChild className="rounded-xl shadow-sm">
          <Link href="/admin/pages/new">
            <Plus className="me-1.5 h-4 w-4" />
            Add Page
          </Link>
        </Button>
      </div>

      {!pages || pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <FileText className="h-7 w-7 text-muted-foreground/60" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">No pages yet</h2>
          <p className="mb-8 text-sm text-muted-foreground">
            Create your first page to get started.
          </p>
          <Button asChild className="rounded-xl shadow-sm">
            <Link href="/admin/pages/new">
              <Plus className="me-1.5 h-4 w-4" />
              Add Page
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/40 bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Title
                </th>
                <th className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Slug
                </th>
                <th className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Last Updated
                </th>
                <th className="px-5 py-3.5 text-end text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(pages as Page[]).map((page) => (
                <tr
                  key={page.id}
                  className="border-b border-border/30 last:border-b-0 transition-colors hover:bg-muted/20"
                >
                  <td className="px-5 py-4 font-medium">
                    {page.title_en || page.title_ar || "Untitled"}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                    /{page.slug}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        page.is_published
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {page.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {new Date(page.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <form action={togglePublish}>
                        <input type="hidden" name="id" value={page.id} />
                        <input
                          type="hidden"
                          name="isPublished"
                          value={String(page.is_published)}
                        />
                        <Button variant="ghost" size="xs" type="submit" className="rounded-lg">
                          {page.is_published ? "Unpublish" : "Publish"}
                        </Button>
                      </form>
                      <Button variant="ghost" size="icon-xs" asChild className="rounded-lg">
                        <Link href={`/admin/pages/${page.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
