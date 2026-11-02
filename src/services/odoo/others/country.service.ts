import { odoo } from '@/lib/odoo'

import type { CountryRecord } from '@/types/others/country'

export async function fetchCountries(): Promise<CountryRecord[]> {
  const records = await odoo.client.searchRead<CountryRecord>('res.country', [], ['id', 'name', 'code', 'currency_id', 'phone_code'], {
    order: 'name asc',
    limit: 250
  })
  return records
}
