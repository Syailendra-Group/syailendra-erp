'use server'

import { revalidatePath } from 'next/cache'

import {
  checkProvinceExistsInOdoo,
  deleteProvince,
  fetchProvinceById,
  fetchProvinceFilterOptions,
  fetchProvinces,
  fetchProvincesPaginated,
  persistProvince
} from '@/services/odoo/others/province.service'

import type { ProvinceFormValues } from '@/schemas/others/province-schema'
import type { FetchProvincesParams, PaginatedProvincesResult } from '@/services/odoo/others/province.service'
import type { ProvinceRecord } from '@/types/others/province'

export async function getProvincesAction(countryId?: number): Promise<{ provinces: ProvinceRecord[] }> {
  try {
    const provinces = await fetchProvinces(countryId)
    return { provinces }
  } catch (error) {
    console.error('Failed to fetch provinces:', error)
    return { provinces: [] }
  }
}

export async function getProvincesPaginatedAction(params: FetchProvincesParams = {}): Promise<PaginatedProvincesResult> {
  try {
    return await fetchProvincesPaginated(params)
  } catch (error) {
    console.error('Failed to fetch paginated provinces:', error)
    return {
      records: [],
      totalCount: 0,
      page: params.page || 1,
      perPage: params.perPage || 20,
      pageCount: 1
    }
  }
}

export async function getProvinceByIdAction(id: number): Promise<ProvinceRecord | null> {
  try {
    return await fetchProvinceById(id)
  } catch (error) {
    console.error(`Failed to fetch province with ID ${id}:`, error)
    return null
  }
}

export async function checkProvinceExistsAction(params: { code?: string; name?: string }): Promise<{ exists: boolean; id?: number; name?: string }> {
  try {
    return await checkProvinceExistsInOdoo(params)
  } catch (error) {
    console.error('Failed to check province exists:', error)
    return { exists: false }
  }
}

export async function getProvinceFilterOptionsAction(): Promise<{ countries: { id: number; name: string }[] }> {
  try {
    return await fetchProvinceFilterOptions()
  } catch (error) {
    console.error('Failed to fetch province filter options:', error)
    return { countries: [] }
  }
}

export async function saveProvinceAction(values: ProvinceFormValues): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    const id = await persistProvince(values)
    revalidatePath('/others/provinces')
    revalidatePath('/others')
    return { success: true, id }
  } catch (error) {
    console.error('Failed to persist province:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to persist province'
    }
  }
}

export async function deleteProvinceAction(id: number): Promise<{ success: boolean; error?: string }> {
  return await deleteProvince(id)
}
