/**
 * company.service.ts — Service for Multi-Entity Corporate Profiles & Exclusive Menu Allocation
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'
import { odooImageUrl } from '@/utils/odoo-image'

import type { OdooFieldValue } from '@/lib/odoo/types'
import type { ModuleTab } from '@/stores/nav-store'
import type { CompanyRecord, PillarAllocationEntry, UpdateCompanyPayload } from '@/types/others/company'

const VALID_PILLARS: Set<string> = new Set(['ftm', 'hrm', 'scm', 'wms', 'crm', 'dcm', 'ai', 'imm', 'others'])

function parsePillars(raw?: OdooFieldValue): ModuleTab[] {
  if (typeof raw !== 'string' || !raw.trim()) {
    return []
  }
  const parts = raw.split(',').map((p) => p.trim())
  return parts.filter((p): p is ModuleTab => VALID_PILLARS.has(p))
}

function resolveDefaultCode(id: number): string {
  switch (id) {
    case 4:
      return 'SG'
    case 1:
      return 'PT SBI'
    case 2:
      return 'PT SPBA'
    case 3:
      return 'PT SAMMEND'
    default:
      return `PT-${id}`
  }
}

function cleanBase64(val?: string | null): string | false {
  if (!val) return false
  const trimmed = val.trim()
  if (!trimmed) return false
  if (trimmed.includes(',')) {
    return trimmed.split(',')[1] || false
  }
  return trimmed
}

export async function fetchAllCompanies(): Promise<CompanyRecord[]> {
  const companyFields = [
    'id',
    'sequence',
    'name',
    'short_name',
    'tagline',
    'email',
    'phone',
    'mobile',
    'partner_id',
    'uses_default_logo',
    'enabled_pillars',
    'custom_menu_config'
  ]

  const rawCompanies = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.company', [], companyFields, {
    order: 'sequence asc, id asc'
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
    const usesDefaultLogo = Boolean(c.uses_default_logo)
    const shortName = ((c.short_name as string) || '').trim() || resolveDefaultCode(id)

    return {
      id,
      name: (c.name as string) || '',
      short_name: shortName,
      code: shortName,
      tagline: (c.tagline as string) || '',
      email: (c.email as string) || '',
      phone: (c.phone as string) || '',
      mobile: (c.mobile as string) || '',
      website: (partner?.website as string) || '',
      street: (partner?.street as string) || '',
      street2: (partner?.street2 as string) || '',
      city: (partner?.city as string) || '',
      zip: (partner?.zip as string) || '',
      vat: (partner?.vat as string) || '',
      currency: 'IDR (Rp) - Indonesian Rupiah',
      uses_default_logo: usesDefaultLogo,
      logo_web: usesDefaultLogo ? null : odooImageUrl('res.company', id, 'image_128', '128'),
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
    short_name: payload.short_name.trim(),
    tagline: payload.tagline || false,
    email: payload.email || false,
    phone: payload.phone || false,
    mobile: payload.mobile || false
  }

  if (payload.enabled_pillars !== undefined) {
    companyFields.enabled_pillars = payload.enabled_pillars.join(',')
  }

  // null clears the logo; a proxied URL means "unchanged"; only base64 may be written back.
  if (payload.logo_web === null) {
    companyFields.logo_web = false
    companyFields.uses_default_logo = true
  } else if (payload.logo_web !== undefined && !payload.logo_web.startsWith('/')) {
    const cleaned = cleanBase64(payload.logo_web)
    companyFields.logo_web = cleaned
    companyFields.uses_default_logo = !cleaned
  }

  await odoo.client.write('res.company', [payload.id], companyFields)

  const company = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.company', [['id', '=', payload.id]], ['partner_id'])
  const pId = Array.isArray(company[0]?.partner_id) ? (company[0]?.partner_id[0] as number) : undefined

  if (pId) {
    const partnerFields: Record<string, OdooFieldValue> = {
      name: payload.name,
      email: payload.email || false,
      phone: payload.phone || false,
      mobile: payload.mobile || false,
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

export async function batchUpdateEntityPillars(entries: PillarAllocationEntry[]): Promise<boolean> {
  const seen = new Set<ModuleTab>()
  for (const entry of entries) {
    const uniquePillars = entry.pillars.filter((p) => {
      if (seen.has(p)) return false
      seen.add(p)
      return true
    })
    await odoo.client.write('res.company', [entry.companyId], {
      enabled_pillars: uniquePillars.join(',')
    })
  }
  return true
}
