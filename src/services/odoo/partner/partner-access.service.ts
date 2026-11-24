import 'server-only'

import { odooClient } from '@/lib/odoo/client'

import type { PartnerAccessSummary, PinIssueResponse, PinSetResponse } from '@/types/scm/partner-access'

/**
 * Fields mirrored from the live `syailendra.partner.access` model.
 * `pin_hash` must never be requested: Odoo restricts it to the system group
 * and it has no business leaving the server over RPC.
 */
export const ACCESS_FIELDS = ['id', 'partner_id', 'access_code', 'must_change_pin', 'failed_attempts', 'locked_until', 'last_login_at']

export interface PartnerAccessRecord {
  id: number
  partner_id: number | [number, string]
  access_code: string | null
  must_change_pin: boolean
  failed_attempts: number
  locked_until: string | null
  last_login_at: string | null
}

/**
 * Raw `action_generate_pin` response. The plaintext PIN is returned exactly
 * once by Odoo and is never persisted on our side.
 */
interface OdooGeneratePinResult {
  access_code?: string
  pin?: string
}

export async function isScmManager(groupIds: number[]): Promise<boolean> {
  const records = await odooClient.executeKw<{ res_id: number }[]>(
    'ir.model.data',
    'search_read',
    [
      [
        ['module', '=', 'syailendra_scm'],
        ['name', '=', 'group_scm_manager']
      ]
    ],
    { fields: ['res_id'], limit: 1 }
  )
  return records.length > 0 && groupIds.includes(records[0].res_id)
}

export async function getAccessByPartnerIds(partnerIds: number[]): Promise<Record<number, PartnerAccessRecord>> {
  if (!partnerIds.length) return {}

  const records = await odooClient.executeKw<PartnerAccessRecord[]>(
    'syailendra.partner.access',
    'search_read',
    [[['partner_id', 'in', partnerIds]]],
    { fields: ACCESS_FIELDS }
  )

  const map: Record<number, PartnerAccessRecord> = {}
  for (const rec of records) {
    const pid = Array.isArray(rec.partner_id) ? rec.partner_id[0] : rec.partner_id
    map[pid] = rec
  }
  return map
}

export async function provisionAccess(partnerId: number): Promise<number> {
  const partner = await odooClient.executeKw<{ id: number; ref: string | false; supplier_rank: number }[]>(
    'res.partner',
    'search_read',
    [
      [
        ['id', '=', partnerId],
        ['supplier_rank', '>', 0]
      ]
    ],
    { fields: ['id', 'ref', 'supplier_rank'], limit: 1 }
  )
  if (!partner.length) throw new Error('SUPPLIER_NOT_FOUND')

  const partnerRef = typeof partner[0].ref === 'string' ? partner[0].ref.trim() : ''
  if (!partnerRef) throw new Error('SUPPLIER_REF_REQUIRED')

  const existing = await odooClient.executeKw<{ id: number }[]>('syailendra.partner.access', 'search_read', [[['partner_id', '=', partnerId]]], {
    fields: ['id'],
    limit: 1
  })

  if (existing.length) {
    return existing[0].id
  }

  return await odooClient.executeKw<number>('syailendra.partner.access', 'create', [
    { partner_id: partnerId, access_code: partnerRef, must_change_pin: true }
  ])
}

export async function issuePin(accessId: number, partnerId: number): Promise<PinIssueResponse> {
  try {
    const result = await odooClient.executeKw<OdooGeneratePinResult>('syailendra.partner.access', 'action_generate_pin', [[accessId]])

    if (typeof result?.pin !== 'string' || result.pin.length === 0) {
      return { ok: false, reason: 'service_unavailable', message: 'PIN generation returned no code' }
    }

    return { ok: true, pin: result.pin, accessId, partnerId, mustChangePin: true }
  } catch (err) {
    return { ok: false, reason: 'service_unavailable', message: err instanceof Error ? err.message : 'PIN generation failed' }
  }
}

export async function unlockAccess(accessId: number): Promise<PinSetResponse> {
  try {
    await odooClient.executeKw('syailendra.partner.access', 'action_unlock', [[accessId]])

    return { ok: true, accessId }
  } catch (err) {
    return { ok: false, reason: 'service_unavailable', message: err instanceof Error ? err.message : 'Unlock failed' }
  }
}

export function mapToSummary(partnerId: number, rec: PartnerAccessRecord | null): PartnerAccessSummary {
  if (!rec) {
    return {
      partnerId,
      partnerRef: null,
      partnerName: '',
      hasAccess: false,
      pinStatus: 'no-access',
      lastLoginAt: null,
      loginFailCount: 0
    }
  }

  const lockedUntil = rec.locked_until ? Date.parse(`${rec.locked_until.replace(' ', 'T').replace(/Z$/, '')}Z`) : 0
  const isLocked = Number.isFinite(lockedUntil) && lockedUntil > Date.now()
  const pinStatus: PartnerAccessSummary['pinStatus'] = isLocked ? 'locked' : rec.must_change_pin ? 'must-change' : 'active'

  return {
    partnerId,
    partnerRef: rec.access_code ?? null,
    partnerName: '',
    hasAccess: true,
    pinStatus,
    lastLoginAt: rec.last_login_at ?? null,
    loginFailCount: rec.failed_attempts ?? 0
  }
}

export const PartnerAccessService = {
  isScmManager,
  getAccessByPartnerIds,
  provisionAccess,
  issuePin,
  unlockAccess,
  mapToSummary
}
