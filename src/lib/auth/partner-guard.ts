/**
 * partner-guard.ts — Server Action guard for the public partner portal
 * Syailendra Group ERP
 */

import { getPartnerSession } from './partner-session'

import type { PartnerSession } from '@/types/scm/partner'

/**
 * Require a valid partner session inside a Server Action.
 * Throws UNAUTHORIZED so unauthenticated calls never reach the data layer.
 * The partner id is always taken from this session, never from client input.
 */
export async function requirePartnerSession(): Promise<PartnerSession> {
  const session = await getPartnerSession()
  if (!session) throw new Error('UNAUTHORIZED')
  return session
}
