/**
 * menu.service.ts — Service for Dynamic Business Module Pillars
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'

import type { OdooFieldValue } from '@/lib/odoo/types'
import type { ModuleTab } from '@/stores/nav-store'
import type { PillarRecord, UpdatePillarPayload } from '@/types/others/menu'

export async function fetchAllPillars(): Promise<PillarRecord[]> {
  const fields = ['id', 'code', 'short_name', 'name', 'tagline', 'description', 'company_id', 'sequence', 'active']

  const rawPillars = await odoo.client.searchRead<Record<string, OdooFieldValue>>('syailendra.pillar', [['active', '=', true]], fields, {
    order: 'sequence asc, id asc'
  })

  const companyIds = rawPillars
    .map((p) => (Array.isArray(p.company_id) ? (p.company_id[0] as number) : null))
    .filter((id): id is number => typeof id === 'number')

  const companyMap = new Map<number, { name: string; short_name: string; logo_web: string | null }>()
  if (companyIds.length > 0) {
    const rawCompanies = await odoo.client.searchRead<Record<string, OdooFieldValue>>(
      'res.company',
      [['id', 'in', companyIds]],
      ['id', 'name', 'short_name', 'logo_web', 'uses_default_logo']
    )
    rawCompanies.forEach((c) => {
      const usesDefault = Boolean(c.uses_default_logo)
      const rawLogo = c.logo_web as string | false | null
      const logo = !usesDefault && typeof rawLogo === 'string' && rawLogo.length > 0 ? rawLogo : null

      companyMap.set(c.id as number, {
        name: (c.name as string) || '',
        short_name: (c.short_name as string) || '',
        logo_web: logo
      })
    })
  }

  return rawPillars.map((p) => {
    const companyId = Array.isArray(p.company_id) ? (p.company_id[0] as number) : 1
    const companyMeta = companyMap.get(companyId)

    return {
      id: p.id as number,
      code: p.code as string as ModuleTab,
      short_name: (p.short_name as string) || (p.code as string).toUpperCase(),
      name: (p.name as string) || '',
      tagline: (p.tagline as string) || '',
      description: (p.description as string) || '',
      company_id: companyId,
      company_name: companyMeta?.name || '',
      company_short_name: companyMeta?.short_name || `PT-${companyId}`,
      company_logo_web: companyMeta?.logo_web || null,
      sequence: (p.sequence as number) || 10,
      active: Boolean(p.active)
    }
  })
}

export async function updatePillar(payload: UpdatePillarPayload): Promise<boolean> {
  const values: Record<string, OdooFieldValue> = {
    short_name: payload.short_name.trim(),
    name: payload.name.trim(),
    tagline: payload.tagline || false,
    description: payload.description || false,
    company_id: payload.company_id
  }

  if (payload.sequence !== undefined) {
    values.sequence = payload.sequence
  }

  await odoo.client.write('syailendra.pillar', [payload.id], values)
  return true
}

export async function reassignPillarCompany(pillarId: number, companyId: number): Promise<boolean> {
  await odoo.client.write('syailendra.pillar', [pillarId], {
    company_id: companyId
  })
  return true
}
