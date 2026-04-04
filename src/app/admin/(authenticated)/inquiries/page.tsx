import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/tenant/config";
import { InquiriesTable, type Inquiry } from "@/components/admin/inquiries-table";
import { MessageSquare } from "lucide-react";

export default async function InquiriesPage() {
  const tenant = await getTenant();

  if (!tenant) {
    return <div className="text-muted-foreground">Tenant not found.</div>;
  }

  const supabase = await createClient();

  const { data: rawInquiries, error } = await supabase
    .from("inquiries")
    .select(
      `
      id,
      tenant_id,
      trip_id,
      name,
      phone,
      email,
      message,
      source,
      status,
      created_at,
      trips ( title_en )
    `
    )
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-destructive">
        Failed to load inquiries: {error.message}
      </div>
    );
  }

  const inquiries: Inquiry[] = (rawInquiries ?? []).map((inq) => {
    const tripData = inq.trips as unknown as { title_en: string | null } | null;
    return {
      id: inq.id,
      tenant_id: inq.tenant_id,
      trip_id: inq.trip_id,
      name: inq.name,
      phone: inq.phone,
      email: inq.email,
      message: inq.message,
      source: inq.source as Inquiry["source"],
      status: inq.status as Inquiry["status"],
      created_at: inq.created_at,
      trip_title: tripData?.title_en ?? null,
    };
  });

  const newCount = inquiries.filter((i) => i.status === "new").length;
  const totalCount = inquiries.length;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inquiries</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount} total
            {newCount > 0 && (
              <span className="ms-1.5 inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-medium text-red-600 dark:text-red-400">
                  {newCount} new
                </span>
              </span>
            )}
          </p>
        </div>
      </div>

      {totalCount > 0 ? (
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <InquiriesTable inquiries={inquiries} tenantId={tenant.id} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <MessageSquare className="h-7 w-7 text-muted-foreground/60" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">No inquiries yet</h2>
          <p className="text-sm text-muted-foreground">
            Share your website to start receiving customer messages
          </p>
        </div>
      )}
    </div>
  );
}
