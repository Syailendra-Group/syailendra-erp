import { odoo } from '@/lib/odoo'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type { DistrictFormValues } from '@/schemas/others/district-schema'
import type { DistrictRecord } from '@/types/others/district'

export async function fetchDistricts(cityId?: number): Promise<DistrictRecord[]> {
  const domain: OdooDomain = cityId ? [['city_id', '=', cityId]] : []
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>(
    'res.country.district',
    domain,
    ['id', 'name', 'code', 'city_id', 'state_id', 'country_id', 'latitude', 'longitude', 'active'],
    { order: 'name asc', limit: 1000 }
  )
  return records.map((r) => ({
    id: r.id as number,
    name: r.name as string,
    code: (r.code as string) || false,
    city_id: r.city_id as [number, string],
    state_id: (r.state_id as [number, string]) || undefined,
    country_id: (r.country_id as [number, string]) || undefined,
    latitude: Number(r.latitude) || 0,
    longitude: Number(r.longitude) || 0,
    active: Boolean(r.active)
  }))
}

export async function fetchDistrictById(id: number): Promise<DistrictRecord | null> {
  const domain: OdooDomain = [['id', '=', id]]
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.district', domain, [
    'id',
    'name',
    'code',
    'city_id',
    'state_id',
    'country_id',
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
    city_id: r.city_id as [number, string],
    state_id: (r.state_id as [number, string]) || undefined,
    country_id: (r.country_id as [number, string]) || undefined,
    latitude: Number(r.latitude) || 0,
    longitude: Number(r.longitude) || 0,
    active: Boolean(r.active)
  }
}

export async function persistDistrict(values: DistrictFormValues): Promise<number> {
  let finalCityId = values.city_id

  if (!finalCityId && values.auto_add_regency && values.regency_name_raw) {
    finalCityId = await odoo.client.create('res.country.city', {
      name: values.regency_name_raw,
      country_id: 100,
      state_id: values.state_id_raw || 622
    })
  }

  if (!finalCityId) {
    throw new Error('Regency parent record is required before creating a district')
  }

  const payload: Record<string, OdooFieldValue> = {
    name: values.name,
    code: values.code || false,
    city_id: finalCityId,
    latitude: values.latitude || 0,
    longitude: values.longitude || 0,
    active: true
  }

  if (values.id) {
    await odoo.client.write('res.country.district', [values.id], payload)
    return values.id
  }

  return await odoo.client.create('res.country.district', payload)
}

export async function toggleDistrictStatus(id: number, active: boolean): Promise<boolean> {
  return odoo.client.write('res.country.district', [id], { active })
}
