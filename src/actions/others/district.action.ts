'use server'

import { revalidatePath } from 'next/cache'

import {
  checkDistrictExistsInOdoo,
  checkParentRegencyExists,
  fetchDistrictById,
  fetchDistrictFilterOptions,
  fetchDistricts,
  fetchDistrictsPaginated,
  persistDistrict,
  toggleDistrictStatus
} from '@/services/odoo/others/district.service'

import type { DistrictFormValues } from '@/schemas/others/district-schema'
import type { FetchDistrictsParams, PaginatedDistrictsResult } from '@/services/odoo/others/district.service'
import type { DistrictRecord } from '@/types/others/district'

export async function getDistrictsAction(cityId?: number): Promise<{ districts: DistrictRecord[] }> {
  try {
    const districts = await fetchDistricts(cityId)
    return { districts }
  } catch (error) {
    console.error('Failed to fetch districts:', error)
    return { districts: [] }
  }
}

export async function getDistrictsPaginatedAction(params: FetchDistrictsParams = {}): Promise<PaginatedDistrictsResult> {
  try {
    return await fetchDistrictsPaginated(params)
  } catch (error) {
    console.error('Failed to fetch paginated districts:', error)
    return {
      records: [],
      totalCount: 0,
      page: params.page || 1,
      perPage: params.perPage || 20,
      pageCount: 1
    }
  }
}

export async function getDistrictByIdAction(id: number): Promise<DistrictRecord | null> {
  try {
    return await fetchDistrictById(id)
  } catch (error) {
    console.error(`Failed to fetch district with ID ${id}:`, error)
    return null
  }
}

export async function checkDistrictExistsAction(params: {
  code?: string
  name?: string
}): Promise<{ exists: boolean; id?: number; name?: string; code?: string }> {
  try {
    return await checkDistrictExistsInOdoo(params)
  } catch (error) {
    console.error('Failed to check district existence in Odoo:', error)
    return { exists: false }
  }
}

export async function checkParentRegencyAction(name: string, code?: string): Promise<{ exists: boolean; id?: number; name?: string }> {
  try {
    return await checkParentRegencyExists(name, code)
  } catch (error) {
    console.error('Failed to check parent regency existence:', error)
    return { exists: false }
  }
}

export async function getDistrictFilterOptionsAction(): Promise<{
  countries: { id: number; name: string }[]
  states: { id: number; name: string; countryId?: number }[]
  cities: { id: number; name: string; stateId?: number; countryId?: number }[]
}> {
  try {
    return await fetchDistrictFilterOptions()
  } catch (error) {
    console.error('Failed to fetch district filter options:', error)
    return { countries: [], states: [], cities: [] }
  }
}

export async function saveDistrictAction(values: DistrictFormValues): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    const id = await persistDistrict(values)
    revalidatePath('/others/districts')
    revalidatePath('/others')
    return { success: true, id }
  } catch (error) {
    console.error('Failed to persist district:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to persist district'
    }
  }
}

export async function toggleDistrictStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await toggleDistrictStatus(id, active)
    revalidatePath('/others/districts')
    return { success }
  } catch (error) {
    console.error(`Failed to toggle district status for ID ${id}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update status'
    }
  }
}
