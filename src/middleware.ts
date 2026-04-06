import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "@/i18n/routing";
import { resolveTenantSlug } from "@/lib/tenant/resolve";

const handleI18nRouting = createIntlMiddleware(routing);

/** Apply security headers to every response */
function applySecurityHeaders(response: NextResponse): void {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://*.googletagmanager.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
}

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
      applySecurityHeaders(response);
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

    // Block non-super-admins from /admin/tenants at the edge
    if (pathname.startsWith("/admin/tenants")) {
      const { data: platformUsers } = await supabase
        .from("platform_users")
        .select("role, is_active")
        .eq("auth_id", user.id);

      const isSuperAdmin = (platformUsers || []).some(
        (pu: { role: string; is_active: boolean }) =>
          pu.role === "super_admin" && pu.is_active
      );

      if (!isSuperAdmin) {
        return NextResponse.redirect(
          new URL("/admin/dashboard", request.url)
        );
      }
    }

    response.headers.set("x-tenant-slug", tenantSlug);
    applySecurityHeaders(response);
    return response;
  }

  // --- STEP 3: API routes — pass through with tenant header ---
  if (pathname.startsWith("/api")) {
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    applySecurityHeaders(response);
    return response;
  }

  // --- STEP 4: Public routes — i18n routing ---
  const response = handleI18nRouting(request);
  response.headers.set("x-tenant-slug", tenantSlug);
  applySecurityHeaders(response);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
