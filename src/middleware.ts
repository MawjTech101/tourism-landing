import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "@/i18n/routing";
import { resolveTenantSlug } from "@/lib/tenant/resolve";

const handleI18nRouting = createIntlMiddleware(routing);

// Determine if we should scope cookies to the base domain (cross-subdomain SSO)
function getCookieDomain(hostname: string): string | undefined {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN;
  if (!baseDomain) return undefined;
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1"))
    return undefined;
  return `.${baseDomain}`;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const cookieDomain = getCookieDomain(hostname);

  // --- STEP 1: Tenant Resolution (now async — supports custom domain DB lookup) ---
  const tenantSlug = await resolveTenantSlug(hostname, request);

  // Store tenant slug in request headers for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-slug", tenantSlug);

  // --- STEP 2: Admin routes — auth check, skip i18n ---
  if (pathname.startsWith("/admin")) {
    // Login page is public
    if (pathname === "/admin/login") {
      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });
      response.headers.set("x-tenant-slug", tenantSlug);
      return response;
    }

    // All other admin routes require auth
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
                ...options,
                // Scope auth cookies to base domain for cross-subdomain SSO
                ...(cookieDomain ? { domain: cookieDomain } : {}),
              });
            });
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    response.headers.set("x-tenant-slug", tenantSlug);
    return response;
  }

  // --- STEP 3: API routes — pass through with tenant header ---
  if (pathname.startsWith("/api")) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // --- STEP 4: Public routes — i18n routing ---
  const response = handleI18nRouting(request);
  response.headers.set("x-tenant-slug", tenantSlug);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
