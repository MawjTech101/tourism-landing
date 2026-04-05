import { NextRequest, NextResponse } from "next/server";
import { getTenantConfig } from "@/lib/tenant/config";

export async function POST(request: NextRequest) {
  const config = await getTenantConfig();
  const number = config.whatsapp_number?.replace(/[^0-9+]/g, "");

  if (!number) {
    return NextResponse.json({ error: "Not configured" }, { status: 404 });
  }

  let message = "";
  try {
    const body = await request.json();
    message = body.message || "";
  } catch {
    // no body is fine
  }

  const url = `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  return NextResponse.json({ url });
}
