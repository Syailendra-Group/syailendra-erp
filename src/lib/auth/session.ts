/**
 * session.ts — Server-side signed cookie session management
 * Syailendra Group ERP
 */

import { cookies } from 'next/headers'

import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS, signSessionToken, verifySessionToken } from './token'

import type { UserSession } from '@/types/auth/auth'

const MIN_SECRET_LENGTH = 32

function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET
  return secret && secret.length >= MIN_SECRET_LENGTH ? secret : null
}

/**
 * Persist a signed, HttpOnly session token to the browser cookie.
 */
export async function createSession(session: UserSession): Promise<void> {
  const secret = getSessionSecret()
  if (!secret) throw new Error('SESSION_SECRET_MISSING')

  const cookieStore = await cookies()
  const token = await signSessionToken(session, secret)

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS
  })
}

/**
 * Verify the signed session token and return its claims, or null when invalid.
 */
export async function getSession(): Promise<UserSession | null> {
  const secret = getSessionSecret()
  if (!secret) return null

  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  return verifySessionToken(token, secret)
}

/**
 * Destroy the session cookie on logout.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
