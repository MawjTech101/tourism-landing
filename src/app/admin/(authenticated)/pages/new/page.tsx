import { getTenant } from "@/lib/tenant/config";
import { PageForm } from "@/components/admin/page-form";
import Link from "next/link";

export default async function NewPagePage() {
  const tenant = await getTenant();

  if (!tenant) {
    return <div className="text-muted-foreground">Tenant not found.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/admin/pages" className="hover:text-foreground">
            Pages
          </Link>
          <span>/</span>
          <span>New Page</span>
        </div>
        <h1 className="text-2xl font-bold">Create Page</h1>
      </div>
      <PageForm tenantId={tenant.id} mode="create" />
    </div>
  );
}
