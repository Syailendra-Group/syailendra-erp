/**
 * partner-auth.service.ts — Odoo 18 RPC for partner portal authentication
 * Syailendra Group ERP
 *
 * Calls syailendra.partner.access (verify_access / change_pin) on the Odoo
 * backend — already proven there — and maps generic backend reasons to typed
 * partner auth errors without exposing internals or the PIN hash.
 */

import { odoo } from '@/lib/odoo'

import { parseAccessRecord } from './partner-access-mapper'

import type { OdooFieldValue, OdooObjectValue } from '@/lib/odoo/types'
import type { PartnerSession } from '@/types/scm/partner'
import type { PartnerAccessRecord } from '@/types/scm/partner-access'

type PartnerVerifyOk = { ok: true; record: PartnerAccessRecord }
type PartnerVerifyFail = {
  ok: false
  reason: 'invalid_credentials' | 'locked' | 'service_unavailable'
  lockedUntil?: string
}
export type PartnerVerifyResult = PartnerVerifyOk | PartnerVerifyFail

type PartnerPinOk = { ok: true }
type PartnerPinFail = {
  ok: false
  reason: 'invalid_credentials' | 'locked' | 'weak_pin' | 'service_unavailable'
  lockedUntil?: string
}
export type PartnerPinResult = PartnerPinOk | PartnerPinFail

function lockedUntil(raw: OdooObjectValue): string | undefined {
  return typeof raw.locked_until === 'string' ? raw.locked_until : undefined
}

/**
 * verify_access(code, pin, ip, user_agent) on syailendra.partner.access.
 * Never returns the PIN hash; failure reasons are generic by design.
 */
export async function verifyAccess(code: string, pin: string, ip: string, userAgent: string): Promise<PartnerVerifyResult> {
  try {
    const raw = await odoo.client.executeKw<OdooObjectValue>('syailendra.partner.access', 'verify_access', [code, pin, ip, userAgent])

    if (raw?.ok === true) {
      const record = parseAccessRecord(raw)
      if (!record) return { ok: false, reason: 'service_unavailable' }
      return { ok: true, record }
    }

    return {
      ok: false,
      reason: raw?.reason === 'locked' ? 'locked' : 'invalid_credentials',
      lockedUntil: lockedUntil(raw)
    }
  } catch {
    return { ok: false, reason: 'service_unavailable' }
  }
}

/**
 * change_pin(access_id, old_pin, new_pin) on syailendra.partner.access.
 * Shares the login lockout counter with verify_access.
 */
export async function changePin(accessId: number, oldPin: string, newPin: string): Promise<PartnerPinResult> {
  try {
    const raw = await odoo.client.executeKw<OdooObjectValue>('syailendra.partner.access', 'change_pin', [accessId, oldPin, newPin])

    if (raw?.ok === true) return { ok: true }

    return {
      ok: false,
      reason: raw?.reason === 'weak_pin' ? 'weak_pin' : raw?.reason === 'locked' ? 'locked' : 'invalid_credentials',
      lockedUntil: lockedUntil(raw)
    }
  } catch {
    return { ok: false, reason: 'service_unavailable' }
  }
}

export function toPartnerSession(record: PartnerAccessRecord): PartnerSession {
  return {
    accessId: record.accessId,
    partnerId: record.partnerId,
    partnerName: record.partnerName,
    role: record.role,
    companyId: record.companyId,
    mustChangePin: record.mustChangePin
  }
}

export type { OdooFieldValue }
