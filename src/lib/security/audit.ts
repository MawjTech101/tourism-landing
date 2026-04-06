"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

interface AuditEntry {
  tenantId: string;
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}

/**
 * Log an admin action for audit trail.
 * Fire-and-forget — never throws or blocks the caller.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const headerStore = await headers();
    const ip =
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerStore.get("x-real-ip") ||
      "unknown";

    const supabase = createAdminClient();
    await supabase.from("audit_logs").insert({
      tenant_id: entry.tenantId,
      user_id: entry.userId,
      action: entry.action,
      entity_type: entry.entityType ?? null,
      entity_id: entry.entityId ?? null,
      details: entry.details ?? {},
      ip_address: ip,
    });
  } catch {
    // Audit logging should never break the main flow
    console.error("[audit] Failed to log:", entry.action);
  }
}
