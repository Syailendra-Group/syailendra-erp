/**
 * material.service.ts — Odoo 18 RPC Service for Material Master & Commodity Catalog
 * Syailendra Group ERP — SCM Pillar
 */

import { odoo } from '@/lib/odoo'
import { buildPolishOrDomain } from '@/utils'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type { MaterialFormValues } from '@/schemas/sbi/scm/material-schema'
import type {
  AromaNote,
  ExtractionMethod,
  FetchMaterialsParams,
  MaterialCategory,
  MaterialQcSpecs,
  MaterialRecord,
  PaginatedMaterialsResult
} from '@/types/sbi/scm/material'

export type { FetchMaterialsParams, PaginatedMaterialsResult }

const MATERIAL_READ_FIELDS = ['id', 'name', 'default_code', 'type', 'tracking', 'uom_id', 'categ_id', 'description', 'active']

interface StoredMaterialMetadata {
  commercial_name?: string
  category?: MaterialCategory
  botanical_name?: string
  family?: string
  inci_name?: string
  cas_number?: string
  einecs_number?: string
  fema_number?: string
  hs_code?: string
  plant_part?: string
  extraction_method?: ExtractionMethod
  aroma_note?: AromaNote
  shelf_life_months?: number
  qc_specs?: MaterialQcSpecs
  available_sizes?: string[]
}

function unescapeHtml(str: string): string {
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function parseMaterialMetadata(descRaw: OdooFieldValue): StoredMaterialMetadata {
  if (typeof descRaw !== 'string' || !descRaw.trim()) {
    return {}
  }

  const cleanText = unescapeHtml(descRaw)

  try {
    const parsed: StoredMaterialMetadata = JSON.parse(cleanText)
    if (parsed && typeof parsed === 'object') {
      return parsed
    }
  } catch {
    // Description is plain text, fallback gracefully
  }

  return {}
}

function mapOdooProductToMaterial(r: Record<string, OdooFieldValue>): MaterialRecord {
  const meta = parseMaterialMetadata(r.description)

  const uomRaw = r.uom_id as [number, string] | false
  const uomId: [number, string] = Array.isArray(uomRaw) ? uomRaw : [1, 'kg']

  return {
    id: Number(r.id),
    default_code: String(r.default_code || `MAT-${r.id}`),
    name: String(r.name || 'Unnamed Material'),
    commercial_name: meta.commercial_name || String(r.name || ''),
    category: meta.category || 'essential_oils',
    botanical_name: meta.botanical_name || '',
    family: meta.family || '',
    inci_name: meta.inci_name || '',
    cas_number: meta.cas_number || '',
    einecs_number: meta.einecs_number || '',
    fema_number: meta.fema_number || '',
    hs_code: meta.hs_code || '3301.29.90',
    plant_part: meta.plant_part || '',
    extraction_method: meta.extraction_method || 'steam_distillation',
    aroma_note: meta.aroma_note || 'base',
    shelf_life_months: meta.shelf_life_months || 60,
    uom_id: uomId,
    tracking: (r.tracking as 'lot' | 'serial' | 'none') || 'lot',
    active: Boolean(r.active),
    qc_specs: meta.qc_specs,
    available_sizes: meta.available_sizes,
    description: typeof r.description === 'string' ? r.description : undefined
  }
}

export async function fetchMaterialsPaginated(params: FetchMaterialsParams = {}): Promise<PaginatedMaterialsResult> {
  const { page = 1, perPage = 20, search = '', category, tracking, order = 'default_code asc' } = params

  const domain: OdooDomain = [
    ['active', 'in', [true, false]],
    ['description', 'ilike', 'category']
  ]

  // Polish OR domain for keyword search (code, name, description)
  if (search.trim()) {
    const term = `%${search.trim()}%`
    domain.push('|', ['name', 'ilike', term], '|', ['default_code', 'ilike', term], ['description', 'ilike', term])
  }

  // Filter category if present via description substring
  if (category) {
    const catDomain = buildPolishOrDomain('description', category, 'ilike')
    catDomain.forEach((d) => domain.push(d))
  }

  // Filter tracking if present
  if (tracking) {
    if (Array.isArray(tracking) && tracking.length > 0) {
      domain.push(['tracking', 'in', tracking])
    } else if (typeof tracking === 'string' && tracking) {
      domain.push(['tracking', '=', tracking])
    }
  }

  const offset = Math.max(0, (page - 1) * perPage)

  const [totalCount, rawRecords] = await Promise.all([
    odoo.client.searchCount('product.template', domain),
    odoo.client.searchRead<Record<string, OdooFieldValue>>('product.template', domain, MATERIAL_READ_FIELDS, {
      offset,
      limit: perPage,
      order
    })
  ])

  const records = rawRecords.map(mapOdooProductToMaterial)
  const pageCount = Math.ceil(totalCount / perPage) || 1

  return {
    records,
    totalCount,
    page,
    perPage,
    pageCount
  }
}

export async function fetchMaterialById(id: number): Promise<MaterialRecord | null> {
  const rawRecords = await odoo.client.searchRead<Record<string, OdooFieldValue>>('product.template', [['id', '=', id]], MATERIAL_READ_FIELDS, {
    limit: 1
  })

  if (!rawRecords || rawRecords.length === 0) {
    return null
  }

  return mapOdooProductToMaterial(rawRecords[0])
}

export async function persistMaterial(values: MaterialFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const metadata: StoredMaterialMetadata = {
      commercial_name: values.commercial_name,
      category: values.category,
      botanical_name: values.botanical_name,
      family: values.family,
      inci_name: values.inci_name,
      cas_number: values.cas_number,
      einecs_number: values.einecs_number,
      fema_number: values.fema_number,
      hs_code: values.hs_code,
      plant_part: values.plant_part,
      extraction_method: values.extraction_method,
      aroma_note: values.aroma_note,
      shelf_life_months: values.shelf_life_months,
      qc_specs: {
        relative_density_20c: values.relative_density_20c,
        refractive_index_20c: values.refractive_index_20c,
        optical_rotation_20c: values.optical_rotation_20c,
        flash_point_c: values.flash_point_c,
        ethanol_solubility: values.ethanol_solubility,
        key_compounds: values.key_compounds,
        max_moisture_pct: values.max_moisture_pct,
        min_yield_pct: values.min_yield_pct
      }
    }

    const odooPayload: Record<string, OdooFieldValue> = {
      name: values.name,
      default_code: values.default_code,
      type: 'consu',
      tracking: values.tracking,
      uom_id: values.uom_id,
      description: JSON.stringify(metadata)
    }

    if (values.id) {
      await odoo.client.write('product.template', [values.id], odooPayload)
      return { success: true, id: values.id }
    }

    const createdId = await odoo.client.create('product.template', odooPayload)
    return { success: true, id: createdId }
  } catch (err) {
    console.error('Failed to persist material to Odoo 18:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Database error while saving material'
    }
  }
}

export async function deleteMaterial(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await odoo.client.unlink('product.template', [id])
    return { success: true }
  } catch (err) {
    console.error(`Failed to delete material ${id}:`, err)
    const errStr = err instanceof Error ? err.message : String(err)
    if (
      errStr.toLowerCase().includes('still referenced') ||
      errStr.toLowerCase().includes('foreign key') ||
      errStr.toLowerCase().includes('restrict') ||
      errStr.toLowerCase().includes('stock_move')
    ) {
      return {
        success: false,
        error: 'Material cannot be deleted because it is referenced by existing inventory moves or active lots.'
      }
    }
    return {
      success: false,
      error: errStr || 'Failed to delete material'
    }
  }
}
