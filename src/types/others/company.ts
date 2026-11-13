/**
 * company.ts — Type definitions for Multi-Entity Corporate Profiles & Dynamic Menus
 * Syailendra Group ERP
 */

import type { ModuleTab } from '@/stores/nav-store'

export interface CompanyRecord {
  id: number
  name: string
  short_name: string
  code: string
  tagline: string
  email: string
  phone: string
  mobile: string
  website: string
  street: string
  street2: string
  city: string
  zip: string
  vat: string
  currency: string
  uses_default_logo: boolean
  logo_web: string | null
  enabled_pillars: ModuleTab[]
  custom_menu_config?: string
}

export interface UpdateCompanyPayload {
  id: number
  name: string
  short_name: string
  tagline?: string
  email?: string
  phone?: string
  mobile?: string
  website?: string
  street?: string
  city?: string
  zip?: string
  vat?: string
  logo_web?: string | null
  enabled_pillars?: ModuleTab[]
}

export interface PillarAllocationEntry {
  companyId: number
  pillars: ModuleTab[]
}
