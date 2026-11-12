/**
 * company.service.ts — Odoo 18 RPC Service for Multi-Entity Corporate Profiles & Menus
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'

import type { OdooFieldValue } from '@/lib/odoo/types'
import type { ModuleTab } from '@/stores/nav-store'
import type { CompanyRecord, UpdateCompanyPayload } from '@/types/sbi/others/company'

const VALID_PILLARS: Set<string> = new Set(['main', 'ftm', 'hrm', 'scm', 'wms', 'crm', 'dcm', 'ai', 'imm', 'others'])

function parsePillars(raw?: unknown): ModuleTab[] {
  if (typeof raw !== 'string' || !raw.trim()) {
    return ['main', 'others']
  }
  const parts = raw.split(',').map((p) => p.trim())
  const valid = parts.filter((p): p is ModuleTab => VALID_PILLARS.has(p))
  return valid.length > 0 ? valid : ['main', 'others']
}

function resolveEntityCode(id: number): string {
  switch (id) {
    case 1:
      return 'PT SBI'
    case 2:
      return 'PT SPBA'
    case 3:
      return 'PT SAMMEND'
    case 4:
      return 'PT SG'
    default:
      return `PT-${id}`
  }
}

export async function fetchAllCompanies(): Promise<CompanyRecord[]> {
  const companyFields = [
    'id',
    'name',
    'email',
    'phone',
    'mobile',
    'partner_id',
    'uses_default_logo',
    'logo_web',
    'enabled_pillars',
    'custom_menu_config'
  ]

  const rawCompanies = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.company', [], companyFields, {
    order: 'id asc'
  })

  const partnerIds = rawCompanies
    .map((c) => (Array.isArray(c.partner_id) ? (c.partner_id[0] as number) : null))
    .filter((id): id is number => typeof id === 'number')

  const partnerMap = new Map<number, Record<string, OdooFieldValue>>()
  if (partnerIds.length > 0) {
    const rawPartners = await odoo.client.searchRead<Record<string, OdooFieldValue>>(
      'res.partner',
      [['id', 'in', partnerIds]],
      ['id', 'street', 'street2', 'city', 'zip', 'website', 'vat']
    )
    rawPartners.forEach((p) => partnerMap.set(p.id as number, p))
  }

  return rawCompanies.map((c) => {
    const pId = Array.isArray(c.partner_id) ? (c.partner_id[0] as number) : undefined
    const partner = pId ? partnerMap.get(pId) : undefined

    const id = c.id as number
    const logoRaw = c.logo_web as string | false | null

    return {
      id,
      name: (c.name as string) || '',
      code: resolveEntityCode(id),
      tagline: id === 1 ? 'Specialty Essential Oil & Fine Robusta Processing' : '',
      email: (c.email as string) || '',
      phone: (c.phone as string) || (c.mobile as string) || '',
      mobile: (c.mobile as string) || '',
      website: (partner?.website as string) || '',
      street: (partner?.street as string) || '',
      street2: (partner?.street2 as string) || '',
      city: (partner?.city as string) || '',
      zip: (partner?.zip as string) || '',
      vat: (partner?.vat as string) || '',
      currency: 'IDR (Rp) - Indonesian Rupiah',
      uses_default_logo: Boolean(c.uses_default_logo),
      logo_web: typeof logoRaw === 'string' && logoRaw.length > 0 ? logoRaw : null,
      enabled_pillars: parsePillars(c.enabled_pillars),
      custom_menu_config: (c.custom_menu_config as string) || ''
    }
  })
}

export async function fetchCompanyById(id: number): Promise<CompanyRecord | null> {
  const companies = await fetchAllCompanies()
  return companies.find((c) => c.id === id) || null
}

export async function updateCompanyProfile(payload: UpdateCompanyPayload): Promise<boolean> {
  const companyFields: Record<string, OdooFieldValue> = {
    name: payload.name,
    email: payload.email || false,
    phone: payload.phone || false,
    enabled_pillars: payload.enabled_pillars.join(',')
  }

  if (payload.logo_web !== undefined) {
    companyFields.logo_web = payload.logo_web || false
    companyFields.uses_default_logo = !payload.logo_web
  }

  await odoo.client.write('res.company', [payload.id], companyFields)

  // Update associated partner for address & VAT
  const company = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.company', [['id', '=', payload.id]], ['partner_id'])
  const pId = Array.isArray(company[0]?.partner_id) ? (company[0]?.partner_id[0] as number) : undefined

  if (pId) {
    const partnerFields: Record<string, OdooFieldValue> = {
      name: payload.name,
      email: payload.email || false,
      phone: payload.phone || false,
      website: payload.website || false,
      street: payload.street || false,
      city: payload.city || false,
      zip: payload.zip || false,
      vat: payload.vat || false
    }
    await odoo.client.write('res.partner', [pId], partnerFields)
  }

  return true
}
