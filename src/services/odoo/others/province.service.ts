import { odoo } from '@/lib/odoo'

import type { OdooDomain } from '@/lib/odoo/types'
import type { ProvinceFormValues } from '@/schemas/others/province-schema'
import type { ProvinceRecord } from '@/types/others/province'

export async function fetchProvinces(countryId: number = 100): Promise<ProvinceRecord[]> {
  const domain: OdooDomain = countryId > 0 ? [['country_id', '=', countryId]] : []
  const records = await odoo.client.searchRead<ProvinceRecord>('res.country.state', domain, ['id', 'name', 'code', 'country_id'], {
    order: 'name asc',
    limit: 300
  })
  return records
}

export async function fetchProvinceById(id: number): Promise<ProvinceRecord | null> {
  const domain: OdooDomain = [['id', '=', id]]
  const records = await odoo.client.searchRead<ProvinceRecord>('res.country.state', domain, ['id', 'name', 'code', 'country_id'])
  return records[0] || null
}

export async function persistProvince(values: ProvinceFormValues): Promise<number> {
  const { id, name, code, country_id } = values
  if (id) {
    await odoo.client.write('res.country.state', [id], { name, code, country_id })
    return id
  }
  return await odoo.client.create('res.country.state', { name, code, country_id })
}
