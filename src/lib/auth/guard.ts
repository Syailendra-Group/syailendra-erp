/**
 * guard.ts — Server Action authentication guard
 * Syailendra Group ERP
 */

import { getSession } from './session'

import type { UserSession } from '@/types/auth/auth'

/**
 * Require a valid signed session inside a Server Action.
 * Throws UNAUTHORIZED so unauthenticated calls never reach the data layer.
 */
export async function requireSession(): Promise<UserSession> {
  const session = await getSession()
  if (!session) throw new Error('UNAUTHORIZED')
  return session
}
