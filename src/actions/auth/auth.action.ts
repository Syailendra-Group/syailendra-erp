'use server'

/**
 * auth.action.ts — Next.js Server Actions for authentication against Odoo 18
 * Syailendra Group ERP
 */
import { headers } from 'next/headers'

import { createSession, destroySession, getSession } from '@/lib/auth/session'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { loginSchema } from '@/schemas/auth/auth-schema'
import { authenticateUser } from '@/services/odoo/auth/auth.service'

import type { LoginFormValues } from '@/schemas/auth/auth-schema'
import type { AuthActionResult, UserSession } from '@/types/auth/auth'

export async function loginAction(values: LoginFormValues): Promise<AuthActionResult> {
  const validation = loginSchema.safeParse(values)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input parameters'
    }
  }

  const { email, password, turnstileToken } = validation.data

  try {
    const requestHeaders = await headers()
    const clientIp = requestHeaders.get('cf-connecting-ip') || requestHeaders.get('x-forwarded-for') || undefined

    // Verify Cloudflare Turnstile token server-side before authenticating
    const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIp)
    if (!turnstileResult.success) {
      return {
        success: false,
        error: 'Security verification failed. Please retry.'
      }
    }

    const session = await authenticateUser(email, password)
    if (!session) {
      return {
        success: false,
        error: 'Invalid email or password'
      }
    }

    await createSession(session)

    return {
      success: true,
      data: session
    }
  } catch (err) {
    console.error('[auth.action] loginAction error:', err)
    return {
      success: false,
      error: 'Authentication service unavailable. Please try again.'
    }
  }
}

export async function logoutAction(): Promise<void> {
  await destroySession()
}

export async function getSessionAction(): Promise<UserSession | null> {
  return await getSession()
}
