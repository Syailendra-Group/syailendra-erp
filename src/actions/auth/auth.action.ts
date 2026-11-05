'use server'

/**
 * actions.ts — Next.js Server Actions for authentication against Odoo 18
 * Syailendra Group ERP
 */
import { createSession, destroySession, getSession } from '@/lib/auth/session'
import type { UserSession } from '@/types/auth/auth'
import { loginSchema } from '@/schemas/auth/auth-schema'
import { authenticateUser } from '@/services/odoo/auth/auth.service'

import type { LoginFormValues } from '@/schemas/auth/auth-schema'
import type { AuthActionResult } from '@/types/auth/auth'

export async function loginAction(values: LoginFormValues): Promise<AuthActionResult> {
  const validation = loginSchema.safeParse(values)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input parameters'
    }
  }

  const { email, password } = validation.data

  try {
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
    const message = err instanceof Error ? err.message : 'Authentication failed'
    return {
      success: false,
      error: message
    }
  }
}

export async function logoutAction(): Promise<void> {
  await destroySession()
}


export async function getSessionAction(): Promise<UserSession | null> {
  return await getSession()
}
