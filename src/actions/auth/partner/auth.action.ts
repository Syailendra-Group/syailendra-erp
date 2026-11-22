/**
 * partner/auth.action.ts — Server Actions for the partner portal (mitra) auth
 * Syailendra Group ERP
 */

'use server'

import { headers } from 'next/headers'

import { withPartnerGuard } from '@/lib/auth/partner-action-guard'
import { createPartnerSession, destroyPartnerSession, getPartnerSession } from '@/lib/auth/partner-session'
import { assertPartnerTurnstileConfigured } from '@/lib/auth/partner-turnstile'
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { getPartnerChangePinPayloadSchema, getPartnerLoginSchema } from '@/schemas/mitra/auth-schema'
import { changePin, toPartnerSession, verifyAccess } from '@/services/odoo/partner/partner-auth.service'

import type { PartnerChangePinFormValues, PartnerLoginFormValues } from '@/schemas/mitra/auth-schema'
import type { PartnerAuthResult, PartnerPinChangeResult, PartnerSession } from '@/types/scm/partner'

const RATE_LIMIT_WINDOW_MS = 900000

function clientIp(requestHeaders: Headers): string {
  const forwarded = requestHeaders.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = requestHeaders.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
}

function retryAfterSeconds(lockedUntil?: string): number | undefined {
  if (!lockedUntil) return undefined
  const expires = Date.parse(lockedUntil)
  if (Number.isNaN(expires)) return undefined
  const seconds = Math.ceil((expires - Date.now()) / 1000)
  return seconds > 0 ? seconds : 0
}

/**
 * Login: assert turnstile configured → rate limits (ip + access code) →
 * verify Turnstile token → Odoo verify_access → create session + reset limits.
 */
export async function partnerLoginAction(values: PartnerLoginFormValues, ctx?: { ip?: string; userAgent?: string }): Promise<PartnerAuthResult> {
  const loginSchema = getPartnerLoginSchema()
  const validation = loginSchema.safeParse(values)
  if (!validation.success) return { ok: false, error: 'invalid_input' }

  const { accessCode, pin, turnstileToken } = validation.data

  const requestHeaders = await headers()
  const ip = ctx?.ip ?? clientIp(requestHeaders)
  const userAgent = ctx?.userAgent ?? requestHeaders.get('user-agent') ?? 'unknown'

  const captchaError = assertPartnerTurnstileConfigured()
  if (captchaError) return { ok: false, error: captchaError }

  const ipLimit = checkRateLimit(`ip:${ip}`, { limit: 15, windowMs: RATE_LIMIT_WINDOW_MS })
  if (!ipLimit.allowed) return { ok: false, error: 'rate_limited', retryAfterSeconds: ipLimit.retryAfterSeconds }

  const codeLimit = checkRateLimit(`code:${accessCode}`, { limit: 5, windowMs: RATE_LIMIT_WINDOW_MS })
  if (!codeLimit.allowed) return { ok: false, error: 'rate_limited', retryAfterSeconds: codeLimit.retryAfterSeconds }

  const turnstileResult = await verifyTurnstileToken(turnstileToken, ip)
  if (!turnstileResult.success) return { ok: false, error: 'turnstile_failed' }

  const access = await verifyAccess(accessCode, pin, ip, userAgent)
  if (!access.ok) {
    if (access.reason === 'locked') {
      return { ok: false, error: 'locked', retryAfterSeconds: retryAfterSeconds(access.lockedUntil) }
    }
    if (access.reason === 'service_unavailable') {
      return { ok: false, error: 'service_unavailable' }
    }
    return { ok: false, error: 'invalid_credentials' }
  }

  const session: PartnerSession = toPartnerSession(access.record)
  await createPartnerSession(session)
  resetRateLimit(`ip:${ip}`)
  resetRateLimit(`code:${accessCode}`)
  return { ok: true, session }
}

/**
 * PIN change: withPartnerGuard(allowPendingPin) → rate limit (code) →
 * Odoo change_pin → re-sign session with mustChangePin=false + reset limit.
 */
export async function partnerChangePinAction(values: Pick<PartnerChangePinFormValues, 'oldPin' | 'newPin'>): Promise<PartnerPinChangeResult> {
  const guard = await withPartnerGuard({ allowPendingPin: true })
  if (!guard.ok) return { ok: false, error: guard.error }

  const session = guard.session

  const pinSchema = getPartnerChangePinPayloadSchema()
  const validation = pinSchema.safeParse(values)
  if (!validation.success) return { ok: false, error: 'invalid_input' }

  const { oldPin, newPin } = validation.data

  const key = `code:${session.accessId}`
  const pinLimit = checkRateLimit(key, { limit: 5, windowMs: RATE_LIMIT_WINDOW_MS })
  if (!pinLimit.allowed) return { ok: false, error: 'rate_limited', retryAfterSeconds: pinLimit.retryAfterSeconds }

  const result = await changePin(session.accessId, oldPin, newPin)
  if (!result.ok) {
    if (result.reason === 'locked') {
      return { ok: false, error: 'locked', retryAfterSeconds: retryAfterSeconds(result.lockedUntil) }
    }
    return { ok: false, error: result.reason }
  }

  await createPartnerSession({ ...session, mustChangePin: false })
  resetRateLimit(key)
  return { ok: true }
}

export async function partnerLogoutAction(): Promise<void> {
  await destroyPartnerSession()
}

export async function partnerGetSessionAction(): Promise<PartnerSession | null> {
  return getPartnerSession()
}
