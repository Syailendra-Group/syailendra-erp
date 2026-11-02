import { odoo } from '@/lib/odoo'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type { VillageFormValues } from '@/schemas/others/village-schema'
import type { VillageRecord } from '@/types/others/village'

export async function fetchVillages(districtId?: number): Promise<VillageRecord[]> {
  const domain: OdooDomain = districtId ? [['district_id', '=', districtId]] : []
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>(
    'res.country.subdistrict',
    domain,
    ['id', 'name', 'code', 'district_id', 'city_id', 'zip_code', 'latitude', 'longitude', 'active'],
    { order: 'name asc', limit: 1500 }
  )
  return records.map((r) => ({
    id: r.id as number,
    name: r.name as string,
    code: (r.code as string) || false,
    district_id: r.district_id as [number, string],
    city_id: (r.city_id as [number, string]) || undefined,
    zip_code: (r.zip_code as string) || false,
    latitude: Number(r.latitude) || 0,
    longitude: Number(r.longitude) || 0,
    active: Boolean(r.active)
  }))
}

export async function fetchVillageById(id: number): Promise<VillageRecord | null> {
  const domain: OdooDomain = [['id', '=', id]]
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.subdistrict', domain, [
    'id',
    'name',
    'code',
    'district_id',
    'city_id',
    'zip_code',
    'latitude',
    'longitude',
    'active'
  ])
  const r = records[0]
  if (!r) return null
  return {
    id: r.id as number,
    name: r.name as string,
    code: (r.code as string) || false,
    district_id: r.district_id as [number, string],
    city_id: (r.city_id as [number, string]) || undefined,
    zip_code: (r.zip_code as string) || false,
    latitude: Number(r.latitude) || 0,
    longitude: Number(r.longitude) || 0,
    active: Boolean(r.active)
  }
}

export async function persistVillage(values: VillageFormValues): Promise<number> {
  let finalDistrictId = values.district_id

  if (!finalDistrictId && values.auto_add_district && values.district_name_raw) {
    finalDistrictId = await odoo.client.create('res.country.district', {
      name: values.district_name_raw,
      city_id: values.city_id_raw || 1
    })
  }

  if (!finalDistrictId) {
    throw new Error('District parent record is required before creating a village')
  }

  const payload: Record<string, OdooFieldValue> = {
    name: values.name,
    code: values.code || false,
    district_id: finalDistrictId,
    zip_code: values.zip_code || false,
    latitude: values.latitude || 0,
    longitude: values.longitude || 0,
    active: true
  }

  if (values.id) {
    await odoo.client.write('res.country.subdistrict', [values.id], payload)
    return values.id
  }

  return await odoo.client.create('res.country.subdistrict', payload)
}

export async function toggleVillageStatus(id: number, active: boolean): Promise<boolean> {
  return odoo.client.write('res.country.subdistrict', [id], { active })
}
