/**
 * website.ts — Type definitions for Global Website & Appearance Configuration
 * Syailendra Group ERP
 */

export interface SiteConfigRecord {
  id: number
  site_name: string
  company_name: string
  site_descriptor: string
  login_tagline: string
  login_card_title: string
  login_card_description: string
  footer_backbone: string
  copyright_text: string
  logo_light: string | null
  logo_dark: string | null
  logo_monogram: string | null
  primary_light: string
  primary_dark: string
  bg_light: string
  bg_dark: string
  accent_gold: string
}

export interface UpdateSiteConfigPayload {
  site_name: string
  company_name?: string
  site_descriptor?: string
  login_tagline?: string
  login_card_title?: string
  login_card_description?: string
  footer_backbone?: string
  copyright_text?: string
  logo_light?: string | null
  logo_dark?: string | null
  logo_monogram?: string | null
  primary_light: string
  primary_dark: string
  bg_light: string
  bg_dark: string
  accent_gold: string
}
