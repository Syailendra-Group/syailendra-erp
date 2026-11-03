'use server'

import { revalidatePath } from 'next/cache'

import {
  deleteCountry,
  fetchCountries,
  fetchCountriesPaginated,
  fetchCountryById,
  fetchCurrencies,
  persistCountry
} from '@/services/odoo/others/country.service'

import type { CountryFormValues } from '@/schemas/others/country-schema'
import type { CurrencyOption, FetchCountriesParams, PaginatedCountriesResult } from '@/services/odoo/others/country.service'
import type { CountryRecord } from '@/types/others/country'

export async function getCountriesAction(): Promise<{ countries: CountryRecord[] }> {
  try {
    const countries = await fetchCountries()
    return { countries }
  } catch (error) {
    console.error('Failed to fetch countries:', error)
    return { countries: [] }
  }
}

export async function getCountriesPaginatedAction(params: FetchCountriesParams = {}): Promise<PaginatedCountriesResult> {
  try {
    return await fetchCountriesPaginated(params)
  } catch (error) {
    console.error('Failed to fetch paginated countries:', error)
    return {
      records: [],
      totalCount: 0,
      page: params.page || 1,
      perPage: params.perPage || 20,
      pageCount: 1
    }
  }
}

export async function getCurrenciesAction(): Promise<CurrencyOption[]> {
  try {
    return await fetchCurrencies()
  } catch (error) {
    console.error('Failed to fetch currencies:', error)
    return []
  }
}

export async function getCountryByIdAction(id: number): Promise<CountryRecord | null> {
  try {
    return await fetchCountryById(id)
  } catch (error) {
    console.error(`Failed to fetch country with ID ${id}:`, error)
    return null
  }
}

export async function saveCountryAction(values: CountryFormValues): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    const id = await persistCountry(values)
    revalidatePath('/others/countries')
    revalidatePath('/others')
    return { success: true, id }
  } catch (error) {
    console.error('Failed to persist country:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to persist country'
    }
  }
}

export async function deleteCountryAction(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await deleteCountry(id)
    revalidatePath('/others/countries')
    revalidatePath('/others')
    return { success }
  } catch (error) {
    console.error(`Failed to delete country ${id}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete country'
    }
  }
}
