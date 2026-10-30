'use server'

/**
 * actions.ts — Next.js Server Actions for authentication against Odoo 18
 * Syailendra Group ERP
 */
import { createSession, destroySession } from '@/lib/auth/session'
import { odoo } from '@/lib/odoo'
import { loginSchema } from '@/schemas/auth'

import type { OdooFieldValue } from '@/lib/odoo/types'
import type { LoginFormValues } from '@/schemas/auth'
import type { AuthActionResult, UserSession } from '@/types/auth'

export async function loginAction(values: LoginFormValues): Promise<AuthActionResult> {
  const validation = loginSchema.safeParse(values)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input parameters'
    }
  }

  const { email, password } = validation.data
  const db = process.env.ODOO_DB || 'odoo_dev'

  try {
    // 1. Authenticate via Odoo 18 common service
    const uid = await odoo.client.authenticateWithCredentials(db, email, password)

    if (!uid) {
      return {
        success: false,
        error: 'Invalid email or password'
      }
    }

    // 2. Query user details and group assignments
    const userRecords = await odoo.client.searchRead<Record<string, OdooFieldValue>>(
      'res.users',
      [['id', '=', uid]],
      ['name', 'login', 'company_id', 'groups_id']
    )

    const user = userRecords[0]
    if (!user) {
      return {
        success: false,
        error: 'User record not found in database'
      }
    }

    const companyData = user.company_id as [number, string] | false
    const groupIds = (user.groups_id as number[]) || []

    // 3. Assemble UserSession
    const session: UserSession = {
      uid,
      name: (user.name as string) || email,
      email: (user.login as string) || email,
      companyId: companyData ? companyData[0] : 1,
      companyName: companyData ? companyData[1] : 'Syailendra Group',
      groups: groupIds,
      isAdmin: uid === 1 || uid === 2
    }

    // 4. Save session to secure cookie
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
