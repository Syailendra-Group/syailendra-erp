'use server'

import { revalidatePath } from 'next/cache'

import {
  checkParentDistrictExists,
  checkVillageExistsInOdoo,
  deleteVillage,
  fetchVillageById,
  fetchVillageFilterOptions,
  fetchVillages,
  fetchVillagesPaginated,
  persistVillage,
  toggleVillageStatus
} from '@/services/odoo/others/village.service'

import type { VillageFormValues } from '@/schemas/others/village-schema'
import type { FetchVillagesParams, PaginatedVillagesResult } from '@/services/odoo/others/village.service'
import type { VillageRecord } from '@/types/others/village'

export async function getVillagesAction(districtId?: number): Promise<{ villages: VillageRecord[] }> {
  try {
    const villages = await fetchVillages(districtId)
    return { villages }
  } catch (error) {
    console.error('Failed to fetch villages:', error)
    return { villages: [] }
  }
}

export async function getVillagesPaginatedAction(params: FetchVillagesParams = {}): Promise<PaginatedVillagesResult> {
  try {
    return await fetchVillagesPaginated(params)
  } catch (error) {
    console.error('Failed to fetch paginated villages:', error)
    return {
      records: [],
      totalCount: 0,
      page: params.page || 1,
      perPage: params.perPage || 20,
      pageCount: 1
    }
  }
}

export async function getVillageByIdAction(id: number): Promise<VillageRecord | null> {
  try {
    return await fetchVillageById(id)
  } catch (error) {
    console.error(`Failed to fetch village with ID ${id}:`, error)
    return null
  }
}

export async function checkVillageExistsAction(params: {
  code?: string
  name?: string
}): Promise<{ exists: boolean; id?: number; name?: string; code?: string }> {
  try {
    return await checkVillageExistsInOdoo(params)
  } catch (error) {
    console.error('Failed to check village existence in Odoo:', error)
    return { exists: false }
  }
}

export async function checkParentDistrictAction(name: string, code?: string): Promise<{ exists: boolean; id?: number; name?: string }> {
  try {
    return await checkParentDistrictExists(name, code)
  } catch (error) {
    console.error('Failed to check parent district existence:', error)
    return { exists: false }
  }
}

export async function getVillageFilterOptionsAction(): Promise<{
  countries: { id: number; name: string }[]
  states: { id: number; name: string; countryId?: number }[]
  cities: { id: number; name: string; stateId?: number }[]
  districts: { id: number; name: string; cityId?: number }[]
}> {
  try {
    return await fetchVillageFilterOptions()
  } catch (error) {
    console.error('Failed to fetch village filter options:', error)
    return { countries: [], states: [], cities: [], districts: [] }
  }
}

export async function saveVillageAction(values: VillageFormValues): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    const id = await persistVillage(values)
    revalidatePath('/others/villages')
    revalidatePath('/others')
    return { success: true, id }
  } catch (error) {
    console.error('Failed to persist village:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to persist village'
    }
  }
}

export async function toggleVillageStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await toggleVillageStatus(id, active)
    revalidatePath('/others/villages')
    return { success }
  } catch (error) {
    console.error(`Failed to toggle village status for ID ${id}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update status'
    }
  }
}

export async function deleteVillageAction(id: number): Promise<{ success: boolean; error?: string }> {
  return await deleteVillage(id)
}
