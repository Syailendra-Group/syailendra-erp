'use server'

import { fetchCountries } from '@/services/odoo/others/country.service'

import type { CountryRecord } from '@/types/others/country'

export async function getCountriesAction(): Promise<{ countries: CountryRecord[] }> {
  try {
    const countries = await fetchCountries()
    return { countries }
  } catch (err) {
    console.error('Failed to fetch countries:', err)
    return { countries: [] }
  }
}
