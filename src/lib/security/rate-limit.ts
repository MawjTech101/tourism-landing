/**
 * Rate limiter with dual storage: in-memory (fast path) + Supabase (persistent).
 *
 * The in-memory store handles the common case within a single serverless
 * invocation lifetime. For durability across cold starts, we fall back to
 * a Supabase `rate_limits` table when available.
 *
 * If the database table doesn't exist or the query fails, the limiter
 * degrades gracefully to in-memory only — it never blocks legitimate
 * requests due to infra issues.
 */

import { createAdminClient } from "@/lib/supabase/admin";

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

// ── In-memory store (fast path) ──────────────────────────────────────
const globalStore =
  (globalThis as Record<string, unknown>).__rateLimitStore as
    | Map<string, RateLimitEntry>
    | undefined;

const store: Map<string, RateLimitEntry> =
  globalStore ?? new Map<string, RateLimitEntry>();

if (!globalStore) {
  (globalThis as Record<string, unknown>).__rateLimitStore = store;
}

function cleanupExpired(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.reset <= now) {
      store.delete(key);
    }
  }
}

function inMemoryCheck(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  cleanupExpired();

  const existing = store.get(key);

  if (existing && existing.reset > now) {
    existing.count += 1;
    return {
      success: existing.count <= limit,
      remaining: Math.max(limit - existing.count, 0),
      reset: existing.reset,
    };
  }

  const reset = now + windowMs;
  store.set(key, { count: 1, reset });
  return { success: true, remaining: limit - 1, reset };
}

// ── Supabase-backed persistent check ─────────────────────────────────
async function persistentCheck(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): Promise<RateLimitResult | null> {
  try {
    const supabase = createAdminClient();

    // Clean up expired entries for this key
    const now = new Date().toISOString();
    await supabase
      .from("rate_limits")
      .delete()
      .eq("key", key)
      .lt("reset_at", now);

    // Try to get existing entry
    const { data: existing } = await supabase
      .from("rate_limits")
      .select("count, reset_at")
      .eq("key", key)
      .gt("reset_at", now)
      .single();

    if (existing) {
      const newCount = existing.count + 1;
      await supabase
        .from("rate_limits")
        .update({ count: newCount })
        .eq("key", key);

      const resetMs = new Date(existing.reset_at).getTime();
      return {
        success: newCount <= limit,
        remaining: Math.max(limit - newCount, 0),
        reset: resetMs,
      };
    }

    // No active window — create one
    const resetAt = new Date(Date.now() + windowMs).toISOString();
    await supabase
      .from("rate_limits")
      .insert({ key, count: 1, reset_at: resetAt });

    return {
      success: true,
      remaining: limit - 1,
      reset: new Date(resetAt).getTime(),
    };
  } catch {
    // Table might not exist yet or DB unreachable — degrade to in-memory
    return null;
  }
}

/**
 * Check (and consume) a rate-limit token for the given key.
 *
 * Uses persistent storage when available, falls back to in-memory.
 */
export async function rateLimit(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  // Try persistent first
  const persistent = await persistentCheck(key, options);
  if (persistent) {
    // Sync in-memory store for fast subsequent checks
    store.set(key, {
      count: persistent.remaining === 0 ? options.limit + 1 : options.limit - persistent.remaining,
      reset: persistent.reset,
    });
    return persistent;
  }

  // Fallback to in-memory
  return inMemoryCheck(key, options);
}

/**
 * Synchronous in-memory-only rate limit for contexts where async is not ideal.
 * Use `rateLimit()` (async) for the persistent version.
 */
export function rateLimitSync(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  return inMemoryCheck(key, options);
}
