/**
 * rate-limit.ts — In-memory sliding-window throttle for public endpoints
 * Syailendra Group ERP
 *
 * Owner decision: no edge/Cloudflare rule and no Redis dependency; a lightweight
 * in-process window is the second layer behind Odoo's per-access-code lockout.
 *
 * Ceiling: state lives in one Node process, so a multi-instance deployment would
 * need a shared store. Upgrade path: swap the Map for a shared counter without
 * changing the call sites.
 */

export interface RateLimitOptions {
  limit: number
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

const buckets = new Map<string, number[]>()
const MAX_KEYS = 10_000

function pruneExpired(timestamps: number[], now: number, windowMs: number): number[] {
  const cutoff = now - windowMs
  return timestamps.filter((stamp) => stamp > cutoff)
}

function sweep(now: number): void {
  for (const [key, timestamps] of buckets) {
    const freshest = timestamps[timestamps.length - 1] ?? 0
    if (now - freshest > 60 * 60 * 1000) buckets.delete(key)
  }
}

/**
 * Record one attempt against `key` and report whether it is allowed.
 * Callers should use separate keys per IP and per access code.
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  if (buckets.size > MAX_KEYS) sweep(now)

  const recent = pruneExpired(buckets.get(key) ?? [], now, options.windowMs)
  if (recent.length >= options.limit) {
    const oldest = recent[0] ?? now
    buckets.set(key, recent)
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + options.windowMs - now) / 1000))
    }
  }

  recent.push(now)
  buckets.set(key, recent)
  return { allowed: true, remaining: options.limit - recent.length, retryAfterSeconds: 0 }
}

/** Clear a key after a successful authentication so honest users are not penalised. */
export function resetRateLimit(key: string): void {
  buckets.delete(key)
}

/** Test helper: drop all state. */
export function clearRateLimits(): void {
  buckets.clear()
}
