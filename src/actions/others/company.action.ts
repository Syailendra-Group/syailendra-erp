'use server'

import { revalidatePath } from 'next/cache'

import { requireSession } from '@/lib/auth/guard'
import { batchUpdateEntityPillars, fetchAllCompanies, fetchCompanyById, updateCompanyProfile } from '@/services/odoo/others/company.service'

import type { CompanyRecord, PillarAllocationEntry, UpdateCompanyPayload } from '@/types/others/company'

export async function getCompaniesAction(): Promise<{ companies: CompanyRecord[] }> {
  await requireSession()
  try {
    const companies = await fetchAllCompanies()
    return { companies }
  } catch (error) {
    console.error('Failed to fetch companies:', error)
    return { companies: [] }
  }
}

export async function getCompanyByIdAction(id: number): Promise<CompanyRecord | null> {
  await requireSession()
  try {
    return await fetchCompanyById(id)
  } catch (error) {
    console.error(`Failed to fetch company with ID ${id}:`, error)
    return null
  }
}

export async function saveCompanyAction(payload: UpdateCompanyPayload): Promise<{ success: boolean; error?: string }> {
  await requireSession()
  try {
    await updateCompanyProfile(payload)
    revalidatePath('/others/company')
    revalidatePath('/others/menus')
    revalidatePath('/others')
    return { success: true }
  } catch (error) {
    console.error('Failed to update company profile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update company profile'
    }
  }
}

export async function savePillarAllocationAction(entries: PillarAllocationEntry[]): Promise<{ success: boolean; error?: string }> {
  await requireSession()
  try {
    await batchUpdateEntityPillars(entries)
    revalidatePath('/others/menus')
    revalidatePath('/others/company')
    revalidatePath('/others')
    return { success: true }
  } catch (error) {
    console.error('Failed to update pillar allocation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update pillar allocation'
    }
  }
}
