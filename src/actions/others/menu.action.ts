'use server'

import { revalidatePath } from 'next/cache'

import { requireSession } from '@/lib/auth/guard'
import { fetchAllPillars, reassignPillarCompany, updatePillar } from '@/services/odoo/others/menu.service'

import type { PillarRecord, UpdatePillarPayload } from '@/types/others/menu'

export async function getPillarsAction(): Promise<{ pillars: PillarRecord[] }> {
  await requireSession()
  try {
    const pillars = await fetchAllPillars()
    return { pillars }
  } catch (error) {
    console.error('Failed to fetch pillars:', error)
    return { pillars: [] }
  }
}

export async function savePillarAction(payload: UpdatePillarPayload): Promise<{ success: boolean; error?: string }> {
  await requireSession()
  try {
    await updatePillar(payload)
    revalidatePath('/others/menus')
    revalidatePath('/others/company')
    revalidatePath('/others')
    return { success: true }
  } catch (error) {
    console.error('Failed to update pillar:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update pillar'
    }
  }
}

export async function reassignPillarAction(pillarId: number, companyId: number): Promise<{ success: boolean; error?: string }> {
  await requireSession()
  try {
    await reassignPillarCompany(pillarId, companyId)
    revalidatePath('/others/menus')
    revalidatePath('/others/company')
    revalidatePath('/others')
    return { success: true }
  } catch (error) {
    console.error('Failed to reassign pillar:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reassign pillar'
    }
  }
}
