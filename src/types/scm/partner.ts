/**
 * partner.ts — Public partner portal session contracts (SCM pillar)
 * Syailendra Group ERP
 *
 * The partner audience is deliberately separate from the internal staff session:
 * different cookie, different signing secret, different claim shape.
 */

export type PartnerRole = 'farmer' | 'distiller'

export interface PartnerSession {
  accessId: number
  partnerId: number
  partnerName: string
  role: PartnerRole
  companyId: number
  mustChangePin: boolean
}

export type PartnerAuthErrorCode =
  | 'invalid_input'
  | 'turnstile_failed'
  | 'invalid_credentials'
  | 'locked'
  | 'rate_limited'
  | 'service_unavailable'
  | 'weak_pin'
  | 'pin_change_required'
  | 'captcha_misconfigured'
  | 'unauthorized'

export type PartnerAuthResult = { ok: true; session: PartnerSession } | { ok: false; error: PartnerAuthErrorCode; retryAfterSeconds?: number }

export type PartnerPinChangeResult = { ok: true } | { ok: false; error: PartnerAuthErrorCode; retryAfterSeconds?: number }
