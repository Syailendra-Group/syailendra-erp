/**
 * product.mapper.ts — Odoo record <-> Product domain mapping
 * Syailendra Group ERP — SCM Pillar
 */

import type { OdooFieldValue } from '@/lib/odoo/types'
import type { AromaNote, ExtractionMethod, ProductCategory, ProductQcSpecs, ProductRecord } from '@/types/scm/product'

export const PRODUCT_READ_FIELDS = ['id', 'name', 'default_code', 'type', 'tracking', 'uom_id', 'categ_id', 'description', 'active']

export interface StoredProductMetadata {
  commercial_name?: string
  category?: ProductCategory
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
  qc_specs?: ProductQcSpecs
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

function parseProductMetadata(descRaw: OdooFieldValue): StoredProductMetadata {
  if (typeof descRaw !== 'string' || !descRaw.trim()) {
    return {}
  }

  const cleanText = unescapeHtml(descRaw)

  try {
    const parsed: StoredProductMetadata = JSON.parse(cleanText)
    if (parsed && typeof parsed === 'object') {
      return parsed
    }
  } catch {
    // Description is plain text, fallback gracefully
  }

  return {}
}

export function mapOdooProductToRecord(r: Record<string, OdooFieldValue>): ProductRecord {
  const meta = parseProductMetadata(r.description)

  const uomRaw = r.uom_id as [number, string] | false
  const uomId: [number, string] = Array.isArray(uomRaw) ? uomRaw : [1, 'kg']

  return {
    id: Number(r.id),
    default_code: String(r.default_code || `MAT-${r.id}`),
    name: String(r.name || 'Unnamed Product'),
    commercial_name: meta.commercial_name || String(r.name || ''),
    category: meta.category || resolveCategoryFromCode(String(r.default_code || '')),
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

/** Business category derived from the catalogue code prefix. */
const CATEGORY_BY_PREFIX: Record<string, ProductCategory> = {
  EO: 'essential_oils',
  FG: 'essential_oils',
  RAW: 'raw_biomass',
  PKG: 'packaging'
}

export const CATEGORY_PREFIXES: Record<ProductCategory, string[]> = {
  essential_oils: ['EO-', 'FG-'],
  natural_isolates: ['EO-'],
  carrier_oils: ['EO-'],
  hydrosols: ['EO-'],
  raw_biomass: ['RAW-'],
  packaging: ['PKG-']
}

export function resolveCategoryFromCode(code: string): ProductCategory {
  const prefix = code.split('-')[0]?.toUpperCase() ?? ''
  return CATEGORY_BY_PREFIX[prefix] ?? 'essential_oils'
}
