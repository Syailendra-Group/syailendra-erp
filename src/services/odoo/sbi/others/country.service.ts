/**
 * country.service.ts — Odoo 18 RPC Service for Countries (res.country)
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type { CountryFormValues } from '@/schemas/sbi/others/country-schema'
import type { CountryRecord } from '@/types/sbi/others/country'

export interface FetchCountriesParams {
  page?: number
  perPage?: number
  search?: string
  order?: string
}

export interface PaginatedCountriesResult {
  records: CountryRecord[]
  totalCount: number
  page: number
  perPage: number
  pageCount: number
}

function mapCountry(r: Record<string, OdooFieldValue>): CountryRecord {
  return {
    id: r.id as number,
    name: r.name as string,
    code: (r.code as string) || '',
    phone_code: Number(r.phone_code) || false,
    description: (r.vat_label as string) || false,
    latitude: typeof r.latitude === 'number' ? r.latitude : false,
    longitude: typeof r.longitude === 'number' ? r.longitude : false
  }
}

const COUNTRY_READ_FIELDS = ['id', 'name', 'code', 'phone_code', 'vat_label', 'latitude', 'longitude']

export async function fetchCountries(): Promise<CountryRecord[]> {
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country', [], COUNTRY_READ_FIELDS, {
    order: 'name asc',
    limit: 250
  })
  return records.map(mapCountry)
}

export async function fetchCountriesPaginated(params: FetchCountriesParams = {}): Promise<PaginatedCountriesResult> {
  const { page = 1, perPage = 20, search = '', order = 'name asc' } = params

  const domain: OdooDomain = []

  if (search.trim()) {
    const term = `%${search.trim()}%`
    domain.push('|', ['name', 'ilike', term], ['code', 'ilike', term])
  }

  const offset = Math.max(0, (page - 1) * perPage)

  const [totalCount, rawRecords] = await Promise.all([
    odoo.client.searchCount('res.country', domain),
    odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country', domain, COUNTRY_READ_FIELDS, {
      offset,
      limit: perPage,
      order
    })
  ])

  return {
    records: rawRecords.map(mapCountry),
    totalCount,
    page,
    perPage,
    pageCount: Math.ceil(totalCount / perPage) || 1
  }
}

export async function fetchCountryById(id: number): Promise<CountryRecord | null> {
  const domain: OdooDomain = [['id', '=', id]]
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country', domain, COUNTRY_READ_FIELDS)
  const r = records[0]
  if (!r) return null
  return mapCountry(r)
}

export async function persistCountry(values: CountryFormValues): Promise<number> {
  const payload: Record<string, OdooFieldValue> = {
    name: values.name,
    code: values.code.toUpperCase(),
    phone_code: values.phone_code || false,
    vat_label: values.description || false,
    latitude: values.latitude || false,
    longitude: values.longitude || false
  }

  if (values.id) {
    await odoo.client.write('res.country', [values.id], payload)
    return values.id
  }

  return await odoo.client.create('res.country', payload)
}

export async function deleteCountry(id: number): Promise<boolean> {
  return await odoo.client.unlink('res.country', [id])
}
