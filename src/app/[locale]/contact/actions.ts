"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  isValidUUID,
  isValidEmail,
  isValidPhone,
  sanitizeString,
} from "@/lib/security/validate";
import { rateLimit } from "@/lib/security/rate-limit";

interface InquiryState {
  success: boolean;
  error: string | null;
}

export async function submitInquiry(
  prevState: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  // ---- Rate limiting (5 per 15 minutes per IP) ----
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown";

  const rl = await rateLimit(`inquiry:${ip}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rl.success) {
    return {
      success: false,
      error: "Too many submissions. Please try again later.",
    };
  }

  // ---- Extract fields ----
  const rawTenantId = formData.get("tenantId") as string;
  const rawName = formData.get("name") as string;
  const rawPhone = formData.get("phone") as string;
  const rawEmail = (formData.get("email") as string) || null;
  const rawMessage = formData.get("message") as string;

  // ---- Validate tenantId ----
  if (!rawTenantId || !isValidUUID(rawTenantId)) {
    return { success: false, error: "Invalid request." };
  }

  // Verify tenantId matches the current request's tenant
  const tenantSlug = headerStore.get("x-tenant-slug");
  if (tenantSlug) {
    const supabaseCheck = await createClient();
    const { data: tenantRow } = await supabaseCheck
      .from("tenants")
      .select("id")
      .eq("slug", tenantSlug)
      .single();

    if (!tenantRow || tenantRow.id !== rawTenantId) {
      return { success: false, error: "Invalid request." };
    }
  }

  // ---- Validate name ----
  if (!rawName || typeof rawName !== "string") {
    return { success: false, error: "Name is required." };
  }
  const name = sanitizeString(rawName, 200);
  if (name.length < 2) {
    return { success: false, error: "Name must be at least 2 characters." };
  }

  // ---- Validate phone ----
  if (!rawPhone || typeof rawPhone !== "string") {
    return { success: false, error: "Phone number is required." };
  }
  const phone = sanitizeString(rawPhone, 20);
  if (!isValidPhone(phone)) {
    return { success: false, error: "Please enter a valid phone number." };
  }

  // ---- Validate email (optional) ----
  let email: string | null = null;
  if (rawEmail && typeof rawEmail === "string" && rawEmail.trim().length > 0) {
    const trimmedEmail = rawEmail.trim();
    if (trimmedEmail.length > 254 || !isValidEmail(trimmedEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }
    email = trimmedEmail;
  }

  // ---- Validate message ----
  if (!rawMessage || typeof rawMessage !== "string") {
    return { success: false, error: "Message is required." };
  }
  const message = sanitizeString(rawMessage, 2000);
  if (message.length < 10) {
    return {
      success: false,
      error: "Message must be at least 10 characters.",
    };
  }

  // ---- Insert ----
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("inquiries").insert({
      tenant_id: rawTenantId,
      name,
      phone,
      email,
      message,
      source: "form",
      status: "new",
    });

    if (error) {
      return {
        success: false,
        error: "Failed to submit your inquiry. Please try again.",
      };
    }

    return { success: true, error: null };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
