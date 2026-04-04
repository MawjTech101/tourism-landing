/**
 * In-memory rate limiter suitable for serverless/edge environments.
 *
 * Uses a global Map so the store survives across hot-reloaded handler
 * invocations in the same process (e.g. Next.js API routes on Vercel).
 * Expired entries are cleaned up automatically on every call to avoid
 * unbounded memory growth.
 */

interface RateLimitEntry {
  count: number;
  /** Timestamp (ms) when this window expires. */
  reset: number;
}

interface RateLimitOptions {
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

interface RateLimitResult {
  /** Whether the request is allowed. */
  success: boolean;
  /** How many requests remain in the current window. */
  remaining: number;
  /** Unix timestamp (ms) when the window resets. */
  reset: number;
}

// Persist across hot reloads in development (Next.js caches globals).
const globalStore =
  (globalThis as Record<string, unknown>).__rateLimitStore as
    | Map<string, RateLimitEntry>
    | undefined;

const store: Map<string, RateLimitEntry> =
  globalStore ?? new Map<string, RateLimitEntry>();

if (!globalStore) {
  (globalThis as Record<string, unknown>).__rateLimitStore = store;
}

/**
 * Remove all entries whose window has already expired.
 * Called on every `rateLimit` invocation so the Map never grows unbounded.
 */
function cleanupExpired(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.reset <= now) {
      store.delete(key);
    }
  }
}

/**
 * Check (and consume) a rate-limit token for the given key.
 *
 * @example
 * ```ts
 * const result = rateLimit(`login:${ip}`, { limit: 5, windowMs: 60_000 });
 * if (!result.success) {
 *   return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 * }
 * ```
 */
export function rateLimit(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const { limit, windowMs } = options;
  const now = Date.now();

  // Housekeeping — prune stale entries every call (cheap for moderate traffic).
  cleanupExpired();

  const existing = store.get(key);

  // Window still active — increment.
  if (existing && existing.reset > now) {
    existing.count += 1;
    const remaining = Math.max(limit - existing.count, 0);
    return {
      success: existing.count <= limit,
      remaining,
      reset: existing.reset,
    };
  }

  // No active window — start a fresh one.
  const reset = now + windowMs;
  store.set(key, { count: 1, reset });

  return {
    success: true,
    remaining: limit - 1,
    reset,
  };
}
