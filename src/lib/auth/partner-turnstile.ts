/**
 * partner-turnstile.ts — Fail-closed Turnstile gate for the partner portal
 * Syailendra Group ERP
 *
 * Partner login is rejected unless a REAL Cloudflare Turnstile secret is
 * configured. The staff login keeps its own verification path (turnstile.ts)
 * and is untouched: this gate never falls back to a test key.
 */

export interface PartnerTurnstileStatus {
  configured: boolean
  reason: 'ok' | 'missing' | 'test_key'
}

/**
 * Cloudflare publishes test secrets of the form 1x000...AA (always pass),
 * 2x000...AA (always fail) and 3x000...AA (forced interactive). Any of them
 * means the widget is NOT verified in production and partner login must stay
 * closed.
 */
const TEST_SECRET_PATTERN = /^[123]x0{16,}AA$/

/** Hostnames that can never be a public deployment of this portal. */
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1'])

function isLoopbackDeployment(): boolean {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (!configured) return false
  try {
    return LOOPBACK_HOSTS.has(new URL(configured).hostname)
  } catch {
    return false
  }
}

/**
 * Test keys are accepted only in an explicitly declared test deployment:
 * APP_ENV=test, TURNSTILE_ALLOW_TEST_KEYS=true, and a loopback app URL.
 * A production build keeps NODE_ENV=production, so all three conditions are
 * required on top of it; any one missing keeps partner login closed.
 */
function testKeysAllowed(): boolean {
  return process.env.TURNSTILE_ALLOW_TEST_KEYS === 'true' && process.env.APP_ENV === 'test' && isLoopbackDeployment()
}

export function getPartnerTurnstileStatus(): PartnerTurnstileStatus {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim()
  if (!secret) return { configured: false, reason: 'missing' }
  if (TEST_SECRET_PATTERN.test(secret)) {
    return testKeysAllowed() ? { configured: true, reason: 'ok' } : { configured: false, reason: 'test_key' }
  }
  return { configured: true, reason: 'ok' }
}

/**
 * Guard helper for partner actions: returns the reject code when Turnstile is
 * not properly configured, or null when the gate is closed and verification
 * may proceed.
 */
export function assertPartnerTurnstileConfigured(): 'captcha_misconfigured' | null {
  return getPartnerTurnstileStatus().configured ? null : 'captcha_misconfigured'
}
