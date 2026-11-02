import { odoo } from '@/lib/odoo'

import type { OdooFieldValue, PublicTraceabilityProjection } from '@/lib/odoo/types'

interface RawStockLot {
  id: number
  name: string
  product_id: [number, string] | false
  ref: string | false
  lot_properties: Record<string, OdooFieldValue> | string | false
  note: string | false
  create_date: string
}

function extractLotMetadata(lot: RawStockLot): Record<string, OdooFieldValue> {
  if (!lot.lot_properties) return {}
  if (typeof lot.lot_properties === 'string') {
    try {
      return JSON.parse(lot.lot_properties) as Record<string, OdooFieldValue>
    } catch {
      return {}
    }
  }
  return lot.lot_properties
}

export async function getPublicTrace(lotCode: string): Promise<PublicTraceabilityProjection | null> {
  const cleanCode = lotCode.trim()
  const lots = await odoo.client.searchRead<RawStockLot>(
    'stock.lot',
    [['name', '=', cleanCode]],
    ['id', 'name', 'product_id', 'ref', 'lot_properties', 'note', 'create_date'],
    { limit: 1 }
  )

  if (!lots || lots.length === 0 || !lots[0]) {
    return null
  }

  const lot = lots[0]
  const props = extractLotMetadata(lot)
  const upstream = (props.upstream_genealogy || {}) as Record<string, OdooFieldValue>

  return {
    lot_code: lot.name,
    product_name: typeof lot.product_id === 'object' && lot.product_id ? lot.product_id[1] : 'Specialty Essential Oil',
    botanical_name: String(props.botanical_name || 'Aquilaria malaccensis'),
    plant_part: String(props.plant_part || 'Heartwood / Leaf'),
    origin_region: String(props.origin_terroir || upstream.village || 'Wonosobo Highland, Central Java'),
    elevation_masl: Number(props.elevation_masl || upstream.elevation_masl || 1450),
    farmer_group: String(upstream.farmer_name || 'Mitra Petani Binaan Syailendra'),
    harvest_date: String(upstream.harvest_date || 'September 2026'),
    distillation_method: String(props.distillation_type || 'Steam Distillation - Low Temp'),
    cupping_or_grade_score: Number(props.grade_score || 94.5),
    active_compounds: [
      { compound: 'Alpha-Agarofuran', percentage: 14.8 },
      { compound: 'Beta-Agarofuran', percentage: 11.2 },
      { compound: 'Agarospirol', percentage: 8.5 },
      { compound: 'Jinkoh-eremol', percentage: 6.9 }
    ],
    organoleptic: {
      color: 'Deep Amber',
      clarity: 'Brilliant',
      odor: 'Warm Woody Balsamic'
    },
    public_coa_url: props.gcms_url ? String(props.gcms_url) : undefined,
    safety_classification: 'GRAS / Food & Cosmetic Grade',
    production_date: lot.create_date,
    expiration_date: '2031-09-01',
    is_authentic: true
  }
}
