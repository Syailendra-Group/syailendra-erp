/**
 * product.service.ts — Odoo 18 RPC service for Product Master & Commodity Catalog
 * Syailendra Group ERP — SCM Pillar
 */

import { odoo } from '@/lib/odoo'

import { CATEGORY_PREFIXES, mapOdooProductToRecord, PRODUCT_READ_FIELDS } from './product.mapper'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type { ProductFormValues } from '@/schemas/scm/product-schema'
import type { FetchProductsParams, PaginatedProductsResult, ProductCategory, ProductRecord } from '@/types/scm/product'
import type { StoredProductMetadata } from './product.mapper'

export interface PersistProductResult {
  success: boolean
  id?: number
  error?: string
}

export type { FetchProductsParams, PaginatedProductsResult }

/**
 * Catalogue prefixes marking a Syailendra essential-oil product. In Odoo 18
 * `product.template.description` is translated JSONB, so the former `ilike` probe never
 * matched; the business discriminator is the `default_code` prefix from the SCM monographs.
 */
const ATSIRI_CODE_PATTERNS = ['EO-%', 'FG-%', 'RAW-%', 'PKG-%']

/** Join leaves with prefix OR operators (Polish notation). */
function orGroup(leaves: OdooDomain): OdooDomain {
  const group: OdooDomain = []
  for (let index = 1; index < leaves.length; index++) group.push('|')
  group.push(...leaves)
  return group
}

function buildCatalogueDomain(): OdooDomain {
  return orGroup(ATSIRI_CODE_PATTERNS.map((pattern) => ['default_code', '=like', pattern]))
}

/** Join independent groups with prefix AND operators (Polish notation). */
function andGroups(groups: OdooDomain[]): OdooDomain {
  const domain: OdooDomain = []
  for (let index = 1; index < groups.length; index++) domain.push('&')
  groups.forEach((group) => domain.push(...group))
  return domain
}

export async function fetchProductsPaginated(params: FetchProductsParams = {}): Promise<PaginatedProductsResult> {
  const { page = 1, perPage = 20, search = '', category, tracking, order = 'default_code asc' } = params

  const groups: OdooDomain[] = [[['active', 'in', [true, false]]], buildCatalogueDomain()]

  // Polish OR domain for keyword search (code and name only -- never the JSONB description)
  if (search.trim()) {
    const term = `%${search.trim()}%`
    groups.push(
      orGroup([
        ['name', 'ilike', term],
        ['default_code', 'ilike', term]
      ])
    )
  }

  // Category filter resolves to catalogue code prefixes
  const rawCategory = Array.isArray(category) ? category : category ? [category] : []
  const categories = rawCategory.filter((value): value is ProductCategory => value in CATEGORY_PREFIXES)
  const prefixes = categories.flatMap((value) => CATEGORY_PREFIXES[value] ?? [])
  if (prefixes.length > 0) {
    groups.push(orGroup(prefixes.map((prefix) => ['default_code', '=like', `${prefix}%`])))
  }

  // Filter tracking if present
  if (tracking) {
    if (Array.isArray(tracking) && tracking.length > 0) {
      groups.push(orGroup(tracking.map((value) => ['tracking', '=', value])))
    } else if (typeof tracking === 'string' && tracking) {
      groups.push([['tracking', '=', tracking]])
    }
  }

  const domain: OdooDomain = andGroups(groups)

  const offset = Math.max(0, (page - 1) * perPage)

  const [totalCount, rawRecords] = await Promise.all([
    odoo.client.searchCount('product.template', domain, undefined, { context: { active_test: false } }),
    odoo.client.searchRead<Record<string, OdooFieldValue>>('product.template', domain, PRODUCT_READ_FIELDS, {
      offset,
      limit: perPage,
      order,
      context: { active_test: false }
    })
  ])

  const records = rawRecords.map(mapOdooProductToRecord)
  const pageCount = Math.ceil(totalCount / perPage) || 1

  return {
    records,
    totalCount,
    page,
    perPage,
    pageCount
  }
}

export async function fetchProductById(id: number): Promise<ProductRecord | null> {
  const rawRecords = await odoo.client.searchRead<Record<string, OdooFieldValue>>('product.template', [['id', '=', id]], PRODUCT_READ_FIELDS, {
    limit: 1,
    context: { active_test: false }
  })

  if (!rawRecords || rawRecords.length === 0) {
    return null
  }

  return mapOdooProductToRecord(rawRecords[0])
}

export async function persistProduct(values: ProductFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const metadata: StoredProductMetadata = {
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
    console.error('Failed to persist product to Odoo 18:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Database error while saving product'
    }
  }
}

export async function deleteProduct(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await odoo.client.unlink('product.template', [id])
    return { success: true }
  } catch (err) {
    console.error(`Failed to delete product ${id}:`, err)
    const errStr = err instanceof Error ? err.message : String(err)
    if (
      errStr.toLowerCase().includes('still referenced') ||
      errStr.toLowerCase().includes('foreign key') ||
      errStr.toLowerCase().includes('restrict') ||
      errStr.toLowerCase().includes('stock_move')
    ) {
      return {
        success: false,
        error: 'Product cannot be deleted because it is referenced by existing inventory moves or active lots.'
      }
    }
    return {
      success: false,
      error: errStr || 'Failed to delete product'
    }
  }
}
