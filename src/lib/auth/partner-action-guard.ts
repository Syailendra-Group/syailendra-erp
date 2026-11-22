/**
 * partner-action-guard.ts — must_change_pin enforcement for partner actions
 * Syailendra Group ERP
 *
 * Every partner data action passes through this guard: a valid partner session
 * is required and, while mustChangePin is still pending, every action except
 * the PIN change itself is refused with a typed code (never a raw throw).
 */

import { getPartnerSession } from './partner-session'

import type { PartnerSession } from '@/types/scm/partner'

export type PartnerGuardError = 'unauthorized' | 'pin_change_required'

export type PartnerGuardResult = { ok: true; session: PartnerSession } | { ok: false; error: PartnerGuardError }

/**
 * Wrap a partner data action. Pass allowPendingPin=true only for the PIN
 * change action itself; every other action is blocked until the first PIN
 * change has completed.
 */
export async function withPartnerGuard(options: { allowPendingPin?: boolean } = {}): Promise<PartnerGuardResult> {
  let session: PartnerSession | null = null
  try {
    session = await getPartnerSession()
  } catch {
    return { ok: false, error: 'unauthorized' }
  }
  if (!session) return { ok: false, error: 'unauthorized' }
  if (session.mustChangePin && !options.allowPendingPin) return { ok: false, error: 'pin_change_required' }
  return { ok: true, session }
}
