'use server'

import { revalidatePath } from 'next/cache'

import {
  checkProvinceExistsByNameOrCode,
  checkRegencyExistsInOdoo,
  deleteRegency,
  fetchRegencies,
  fetchRegenciesPaginated,
  fetchRegencyById,
  fetchRegencyFilterOptions,
  persistRegency,
  toggleRegencyStatus
} from '@/services/odoo/sbi/others/regency.service'

import type { RegencyFormValues } from '@/schemas/sbi/others/regency-schema'
import type { FetchRegenciesParams, PaginatedRegenciesResult } from '@/services/odoo/sbi/others/regency.service'
import type { RegencyRecord } from '@/types/sbi/others/regency'

export async function getRegenciesAction(stateId?: number): Promise<{ regencies: RegencyRecord[] }> {
  try {
    const regencies = await fetchRegencies(stateId)
    return { regencies }
  } catch (error) {
    console.error('Failed to fetch regencies:', error)
    return { regencies: [] }
  }
}

export async function getRegenciesPaginatedAction(params: FetchRegenciesParams = {}): Promise<PaginatedRegenciesResult> {
  try {
    return await fetchRegenciesPaginated(params)
  } catch (error) {
    console.error('Failed to fetch paginated regencies:', error)
    return {
      records: [],
      totalCount: 0,
      page: params.page || 1,
      perPage: params.perPage || 20,
      pageCount: 1
    }
  }
}

export async function getRegencyByIdAction(id: number): Promise<RegencyRecord | null> {
  try {
    return await fetchRegencyById(id)
  } catch (error) {
    console.error(`Failed to fetch regency with ID ${id}:`, error)
    return null
  }
}

export async function checkParentProvinceAction(name: string, code?: string): Promise<{ exists: boolean; id?: number; name?: string }> {
  try {
    return await checkProvinceExistsByNameOrCode(name, code)
  } catch (error) {
    console.error('Failed to check parent province existence:', error)
    return { exists: false }
  }
}

export async function checkRegencyExistsAction(params: {
  code?: string
  name?: string
}): Promise<{ exists: boolean; id?: number; name?: string; code?: string }> {
  try {
    return await checkRegencyExistsInOdoo(params)
  } catch (error) {
    console.error('Failed to check regency existence in Odoo:', error)
    return { exists: false }
  }
}

export async function getRegencyFilterOptionsAction(): Promise<{
  countries: { id: number; name: string }[]
  states: { id: number; name: string; countryId: number }[]
}> {
  try {
    return await fetchRegencyFilterOptions()
  } catch (error) {
    console.error('Failed to fetch regency filter options:', error)
    return { countries: [], states: [] }
  }
}

export async function saveRegencyAction(values: RegencyFormValues): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    const id = await persistRegency(values)
    revalidatePath('/others/regencies')
    revalidatePath('/others')
    return { success: true, id }
  } catch (error) {
    console.error('Failed to persist regency:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to persist regency'
    }
  }
}

export async function toggleRegencyStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await toggleRegencyStatus(id, active)
    revalidatePath('/others/regencies')
    return { success }
  } catch (error) {
    console.error(`Failed to toggle regency active status for ID ${id}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update status'
    }
  }
}

export async function deleteRegencyAction(id: number): Promise<{ success: boolean; error?: string }> {
  return await deleteRegency(id)
}
