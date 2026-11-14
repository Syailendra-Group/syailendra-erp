'use server'

import { revalidatePath } from 'next/cache'

import { fetchSiteConfig, resetSiteConfig, updateSiteConfig } from '@/services/odoo/others/website.service'

import type { SiteConfigRecord, UpdateSiteConfigPayload } from '@/types/others/website'

export async function getSiteConfigAction(): Promise<SiteConfigRecord> {
  try {
    return await fetchSiteConfig()
  } catch (error) {
    console.error('Failed to fetch site config:', error)
    const { DEFAULT_SITE_CONFIG } = await import('@/services/odoo/others/website.service')
    return DEFAULT_SITE_CONFIG
  }
}

export async function saveSiteConfigAction(payload: UpdateSiteConfigPayload): Promise<{ success: boolean; error?: string }> {
  try {
    await updateSiteConfig(payload)
    revalidatePath('/others/website')
    revalidatePath('/login')
    revalidatePath('/others')
    return { success: true }
  } catch (error) {
    console.error('Failed to update site config:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update site config'
    }
  }
}

export async function resetSiteConfigAction(): Promise<{ success: boolean; error?: string }> {
  try {
    await resetSiteConfig()
    revalidatePath('/others/website')
    revalidatePath('/login')
    revalidatePath('/others')
    return { success: true }
  } catch (error) {
    console.error('Failed to reset site config:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset site config'
    }
  }
}
