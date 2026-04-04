/**
 * Validation & sanitization helpers for SafarCMS.
 *
 * All functions are pure, have zero dependencies, and are safe to use on both
 * client and server.
 */

// ---------------------------------------------------------------------------
// Reserved slugs
// ---------------------------------------------------------------------------

/** Reserved slugs that cannot be used as tenant or page identifiers. */
export const RESERVED_SLUGS: string[] = [
  "admin",
  "api",
  "auth",
  "login",
  "dashboard",
  "settings",
  "trips",
  "deals",
  "pages",
  "inquiries",
  "tenants",
  "www",
  "mail",
  "ftp",
  "static",
  "assets",
  "media",
  "cdn",
  "app",
];

// ---------------------------------------------------------------------------
// Regex patterns
// ---------------------------------------------------------------------------

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

/**
 * Returns `true` if `str` is a valid UUID v4.
 */
export function isValidUUID(str: string): boolean {
  return UUID_V4_RE.test(str);
}

/**
 * Basic email format check — not exhaustive (RFC 5322 is enormous) but
 * catches the vast majority of invalid addresses.
 */
export function isValidEmail(str: string): boolean {
  return EMAIL_RE.test(str);
}

/**
 * Returns `true` if `str` is a valid 6-digit hex colour (`#RRGGBB`).
 */
export function isValidHexColor(str: string): boolean {
  return HEX_COLOR_RE.test(str);
}

/**
 * Returns `true` if `str` is a valid URL slug:
 * - 2-50 characters
 * - lowercase alphanumeric + hyphens (no leading/trailing/double hyphens)
 * - not in the reserved list
 */
export function isValidSlug(str: string): boolean {
  if (str.length < 2 || str.length > 50) return false;
  if (!SLUG_RE.test(str)) return false;
  if (RESERVED_SLUGS.includes(str)) return false;
  return true;
}

/**
 * Returns `true` if `str` looks like a phone number.
 * Allows digits, +, -, spaces, and parentheses; 4-20 characters.
 */
export function isValidPhone(str: string): boolean {
  return /^[+]?[\d\s\-()]{4,20}$/.test(str);
}

/**
 * Returns `true` if `str` is a valid domain name (no protocol).
 */
export function isValidDomain(str: string): boolean {
  if (str.length > 253) return false;
  return /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(
    str,
  );
}

/**
 * Returns `true` if `str` is a valid HTTP or HTTPS URL.
 * Explicitly rejects `javascript:` protocol to prevent XSS.
 */
export function isValidUrl(str: string): boolean {
  // Quick rejection of dangerous protocols before parsing.
  if (/^\s*javascript:/i.test(str)) return false;

  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Sanitizers
// ---------------------------------------------------------------------------

/**
 * Trims whitespace and truncates `str` to at most `maxLength` characters.
 */
export function sanitizeString(str: string, maxLength: number): string {
  return str.trim().slice(0, maxLength);
}
