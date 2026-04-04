import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Validates that a redirect path is safe (no open redirect).
 * Must start with `/` and must not contain `//` (blocks protocol-relative URLs
 * and absolute URL injections like `//evil.com`).
 */
function isValidRedirect(path: string): boolean {
  return path.startsWith("/") && !path.includes("//");
}

const DEFAULT_REDIRECT = "/admin/dashboard";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? DEFAULT_REDIRECT;

  // Sanitize redirect target — fall back to default if the value is suspicious
  const next = isValidRedirect(nextParam) ? nextParam : DEFAULT_REDIRECT;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`);
}
