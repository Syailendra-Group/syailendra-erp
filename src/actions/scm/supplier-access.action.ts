'use server'

import 'server-only'

import { revalidatePath } from 'next/cache'

import { requireSession } from '@/lib/auth/guard'
import { PartnerAccessService } from '@/services/odoo/partner/partner-access.service'

import type { UserSession } from '@/types/auth/auth'
import type { PartnerAccessSummary, PinIssueResponse } from '@/types/scm/partner-access'

async function requireScmManager(session: UserSession): Promise<void> {
  if (session.isAdmin) return
  if (await PartnerAccessService.isScmManager(session.groups)) return
  throw new Error('FORBIDDEN')
}

/** Ambil map partnerId -> PartnerAccessSummary untuk daftar partner. */
export async function fetchPartnerAccessMapAction(partnerIds: number[]): Promise<PartnerAccessSummary[]> {
  const session = await requireSession()
  await requireScmManager(session)
  if (!Array.isArray(partnerIds) || partnerIds.length > 200 || partnerIds.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
    throw new Error('INVALID_PARTNER_IDS')
  }
  const records = await PartnerAccessService.getAccessByPartnerIds(partnerIds)
  const summaries: PartnerAccessSummary[] = []
  for (const [partnerId, rec] of Object.entries(records)) {
    summaries.push(PartnerAccessService.mapToSummary(Number(partnerId), rec))
  }
  return summaries
}

/** Generate PIN baru untuk partner (plaintext dikembalikan sekali). */
export async function issuePartnerPinAction(partnerId: number): Promise<PinIssueResponse> {
  const session = await requireSession()
  await requireScmManager(session)
  if (!Number.isSafeInteger(partnerId) || partnerId <= 0) throw new Error('INVALID_PARTNER_ID')
  const accessId = await PartnerAccessService.provisionAccess(partnerId)
  return await PartnerAccessService.issuePin(accessId, partnerId)
}

/** Unlock akses partner yang terkunci. */
export async function unlockPartnerAccessAction(accessId: number): Promise<{ ok: boolean; reason?: string; message?: string }> {
  const session = await requireSession()
  await requireScmManager(session)
  if (!Number.isSafeInteger(accessId) || accessId <= 0) throw new Error('INVALID_ACCESS_ID')
  const result = await PartnerAccessService.unlockAccess(accessId)
  if (result.ok) {
    revalidatePath('/scm/suppliers', 'page')
    return { ok: true }
  }
  return { ok: false, reason: result.reason, message: result.message }
}
