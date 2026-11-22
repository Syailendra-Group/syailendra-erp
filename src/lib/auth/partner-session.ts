/**
 * partner-session.ts — Server-side signed cookie session for the public partner portal
 * Syailendra Group ERP
 *
 * Uses PARTNER_SESSION_SECRET, never SESSION_SECRET: rotating or leaking one
 * audience must not compromise the other.
 */

import { cookies } from 'next/headers'

import { PARTNER_COOKIE_NAME, PARTNER_TTL_SECONDS, signPartnerToken, verifyPartnerToken } from './partner-token'

import type { PartnerSession } from '@/types/scm/partner'

const MIN_SECRET_LENGTH = 32

function getPartnerSecret(): string | null {
  const secret = process.env.PARTNER_SESSION_SECRET
  return secret && secret.length >= MIN_SECRET_LENGTH ? secret : null
}

/** Persist a signed, HttpOnly partner token to the browser cookie. */
export async function createPartnerSession(session: PartnerSession): Promise<void> {
  const secret = getPartnerSecret()
  if (!secret) throw new Error('PARTNER_SESSION_SECRET_MISSING')

  const cookieStore = await cookies()
  const token = await signPartnerToken(session, secret)

  cookieStore.set(PARTNER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: PARTNER_TTL_SECONDS
  })
}

/** Verify the partner token and return its claims, or null when invalid. */
export async function getPartnerSession(): Promise<PartnerSession | null> {
  const secret = getPartnerSecret()
  if (!secret) return null

  const cookieStore = await cookies()
  const token = cookieStore.get(PARTNER_COOKIE_NAME)?.value
  if (!token) return null

  return verifyPartnerToken(token, secret)
}

/** Destroy the partner cookie on logout. The staff cookie is never touched. */
export async function destroyPartnerSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(PARTNER_COOKIE_NAME)
}
