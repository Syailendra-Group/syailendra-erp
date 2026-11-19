/**
 * website.service.ts — Service for Global Website & Theme Appearance Configuration
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'
import { odooImageUrl } from '@/utils/odoo-image'

import type { OdooFieldValue } from '@/lib/odoo/types'
import type { SiteConfigRecord, UpdateSiteConfigPayload } from '@/types/others/website'

export const DEFAULT_SITE_CONFIG: SiteConfigRecord = {
  id: 1,
  site_name: 'SYAILENDRA ERP',
  company_name: 'Syailendra Group',
  site_descriptor: 'INTEGRATED BUSINESS MANAGEMENT PLATFORM',
  login_tagline: 'Smarter Systems, Stronger Businesses.',
  login_card_title: 'Sign In to System',
  login_card_description: 'Enter your authorized corporate email and password to access the platform.',
  footer_backbone: 'A DIGITAL BACKBONE FOR THE SYAILENDRA GROUP MULTI-ENTITY ECOSYSTEM.',
  copyright_text: 'All rights reserved.',
  logo_light: null,
  logo_dark: null,
  logo_monogram: null,
  primary_light: '#004e52',
  primary_dark: '#008187',
  bg_light: '#fffdee',
  bg_dark: '#181c20',
  accent_gold: '#e8ae1e'
}

function cleanBase64(val?: string | null): string | false {
  if (!val) return false
  const trimmed = val.trim()
  if (!trimmed) return false
  if (trimmed.includes(',')) {
    return trimmed.split(',')[1] || false
  }
  return trimmed
}

export async function fetchSiteConfig(): Promise<SiteConfigRecord> {
  const fields = [
    'id',
    'site_name',
    'company_name',
    'site_descriptor',
    'login_tagline',
    'login_card_title',
    'login_card_description',
    'footer_backbone',
    'copyright_text',
    'logo_light',
    'logo_dark',
    'logo_monogram',
    'primary_light',
    'primary_dark',
    'bg_light',
    'bg_dark',
    'accent_gold'
  ]

  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('syailendra.site.config', [['id', '=', 1]], fields, { limit: 1 })

  if (!records || records.length === 0) {
    return DEFAULT_SITE_CONFIG
  }

  const raw = records[0]
  if (!raw) {
    return DEFAULT_SITE_CONFIG
  }

  const siteConfigId = (raw.id as number) || 1

  return {
    id: siteConfigId,
    site_name: (raw.site_name as string) || '',
    company_name: (raw.company_name as string) || 'Syailendra Group',
    site_descriptor: (raw.site_descriptor as string) || '',
    login_tagline: (raw.login_tagline as string) || '',
    login_card_title: (raw.login_card_title as string) || '',
    login_card_description: (raw.login_card_description as string) || '',
    footer_backbone: (raw.footer_backbone as string) || '',
    copyright_text: (raw.copyright_text as string) || '',
    logo_light: raw.logo_light ? odooImageUrl('syailendra.site.config', siteConfigId, 'logo_light', '512') : null,
    logo_dark: raw.logo_dark ? odooImageUrl('syailendra.site.config', siteConfigId, 'logo_dark', '512') : null,
    logo_monogram: raw.logo_monogram ? odooImageUrl('syailendra.site.config', siteConfigId, 'logo_monogram', '512') : null,
    primary_light: (raw.primary_light as string) || '#004e52',
    primary_dark: (raw.primary_dark as string) || '#008187',
    bg_light: (raw.bg_light as string) || '#fffdee',
    bg_dark: (raw.bg_dark as string) || '#181c20',
    accent_gold: (raw.accent_gold as string) || '#e8ae1e'
  }
}

export async function updateSiteConfig(payload: UpdateSiteConfigPayload): Promise<boolean> {
  const values: Record<string, OdooFieldValue> = {
    site_name: payload.site_name.trim(),
    company_name: payload.company_name ? payload.company_name.trim() : false,
    site_descriptor: payload.site_descriptor || false,
    login_tagline: payload.login_tagline || false,
    login_card_title: payload.login_card_title || false,
    login_card_description: payload.login_card_description || false,
    footer_backbone: payload.footer_backbone || false,
    copyright_text: payload.copyright_text || false,
    primary_light: payload.primary_light.trim(),
    primary_dark: payload.primary_dark.trim(),
    bg_light: payload.bg_light.trim(),
    bg_dark: payload.bg_dark.trim(),
    accent_gold: payload.accent_gold.trim()
  }

  // null clears the logo; a proxied URL means "unchanged"; only base64 may be written back.
  const resolveLogo = (value: string | null | undefined): string | false | undefined => {
    if (value === null) return false
    if (value === undefined) return undefined
    return value.startsWith('/') ? undefined : cleanBase64(value)
  }

  const lightLogo = resolveLogo(payload.logo_light)
  if (lightLogo !== undefined) values.logo_light = lightLogo
  const darkLogo = resolveLogo(payload.logo_dark)
  if (darkLogo !== undefined) values.logo_dark = darkLogo
  const monogramLogo = resolveLogo(payload.logo_monogram)
  if (monogramLogo !== undefined) values.logo_monogram = monogramLogo

  await odoo.client.write('syailendra.site.config', [1], values)
  return true
}

export async function resetSiteConfig(): Promise<boolean> {
  await odoo.client.write('syailendra.site.config', [1], {
    site_name: DEFAULT_SITE_CONFIG.site_name,
    company_name: DEFAULT_SITE_CONFIG.company_name,
    site_descriptor: DEFAULT_SITE_CONFIG.site_descriptor,
    login_tagline: DEFAULT_SITE_CONFIG.login_tagline,
    login_card_title: DEFAULT_SITE_CONFIG.login_card_title,
    login_card_description: DEFAULT_SITE_CONFIG.login_card_description,
    footer_backbone: DEFAULT_SITE_CONFIG.footer_backbone,
    copyright_text: DEFAULT_SITE_CONFIG.copyright_text,
    logo_light: false,
    logo_dark: false,
    logo_monogram: false,
    primary_light: DEFAULT_SITE_CONFIG.primary_light,
    primary_dark: DEFAULT_SITE_CONFIG.primary_dark,
    bg_light: DEFAULT_SITE_CONFIG.bg_light,
    bg_dark: DEFAULT_SITE_CONFIG.bg_dark,
    accent_gold: DEFAULT_SITE_CONFIG.accent_gold
  })
  return true
}
