'use server'

import { revalidatePath } from 'next/cache'

import { fetchAllCompanies, fetchCompanyById, updateCompanyProfile } from '@/services/odoo/sbi/others/company.service'

import type { CompanyRecord, UpdateCompanyPayload } from '@/types/sbi/others/company'

export async function getCompaniesAction(): Promise<{ companies: CompanyRecord[] }> {
  try {
    const companies = await fetchAllCompanies()
    return { companies }
  } catch (error) {
    console.error('Failed to fetch companies:', error)
    return { companies: [] }
  }
}

export async function getCompanyByIdAction(id: number): Promise<CompanyRecord | null> {
  try {
    return await fetchCompanyById(id)
  } catch (error) {
    console.error(`Failed to fetch company with ID ${id}:`, error)
    return null
  }
}

export async function saveCompanyAction(payload: UpdateCompanyPayload): Promise<{ success: boolean; error?: string }> {
  try {
    await updateCompanyProfile(payload)
    revalidatePath('/others/company')
    revalidatePath('/others')
    revalidatePath('/overview')
    return { success: true }
  } catch (error) {
    console.error('Failed to update company profile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update company profile'
    }
  }
}
