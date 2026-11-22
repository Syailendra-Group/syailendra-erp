/**
 * partner-access-mapper.ts — Pure mapping of the Odoo partner access response
 * Syailendra Group ERP
 *
 * Kept free of transport imports so the contract can be asserted offline.
 */

import type { OdooObjectValue } from '@/lib/odoo/types'
import type { PartnerAccessRecord } from '@/types/scm/partner-access'

/**
 * Map the Odoo response onto the session record.
 * Identity fields are mandatory: an incomplete response must never degrade into
 * a session with zero ids, so the caller receives null and refuses the login.
 */
export function parseAccessRecord(raw: OdooObjectValue): PartnerAccessRecord | null {
  const accessId = raw.access_id
  const partnerId = raw.partner_id
  const companyId = raw.company_id
  const partnerName = raw.partner_name
  const role = raw.role

  if (typeof accessId !== 'number' || !Number.isInteger(accessId) || accessId <= 0) return null
  if (typeof partnerId !== 'number' || !Number.isInteger(partnerId) || partnerId <= 0) return null
  if (typeof companyId !== 'number' || !Number.isInteger(companyId) || companyId <= 0) return null
  if (typeof partnerName !== 'string' || partnerName.trim().length === 0) return null
  if (role !== 'farmer' && role !== 'distiller') return null
  if (typeof raw.must_change_pin !== 'boolean') return null

  return { accessId, partnerId, partnerName, role, companyId, mustChangePin: raw.must_change_pin }
}
