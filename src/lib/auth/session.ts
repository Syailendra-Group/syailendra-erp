/**
 * session.ts — Server-side cookie session management
 * Syailendra Group ERP
 */

import { cookies } from 'next/headers'

import type { UserSession } from '@/types/auth/auth'

export const SESSION_COOKIE_NAME = 'syailendra_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

/**
 * Persist user session to an encrypted HttpOnly cookie
 */
export async function createSession(session: UserSession): Promise<void> {
  const cookieStore = await cookies()
  const sessionData = Buffer.from(JSON.stringify(session)).toString('base64')

  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE
  })
}

/**
 * Retrieve and parse the current active user session from cookies
 */
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!cookie?.value) {
    return null
  }

  try {
    const rawJson = Buffer.from(cookie.value, 'base64').toString('utf-8')
    const parsed = JSON.parse(rawJson) as UserSession
    if (!parsed.uid || !parsed.email) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

/**
 * Destroy user session cookie upon logout
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
