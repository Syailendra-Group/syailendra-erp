/**
 * auth.service.ts — Odoo 18 RPC Service for Authentication & User Discovery
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'

import type { OdooFieldValue } from '@/lib/odoo/types'
import type { UserSession } from '@/types/auth/auth'

export async function authenticateUser(email: string, password: string): Promise<UserSession | null> {
  const db = process.env.ODOO_DB || 'odoo_dev'

  const uid = await odoo.client.authenticateWithCredentials(db, email, password)
  if (!uid) {
    return null
  }

  const userRecords = await odoo.client.searchRead<Record<string, OdooFieldValue>>(
    'res.users',
    [['id', '=', uid]],
    ['name', 'login', 'company_id', 'groups_id']
  )

  const user = userRecords[0]
  if (!user) {
    return null
  }

  const companyData = user.company_id as [number, string] | false
  const groupIds = (user.groups_id as number[]) || []

  return {
    uid,
    name: (user.name as string) || email,
    email: (user.login as string) || email,
    companyId: companyData ? companyData[0] : 1,
    companyName: companyData ? companyData[1] : 'Syailendra Group',
    groups: groupIds,
    isAdmin: uid === 1 || uid === 2
  }
}
