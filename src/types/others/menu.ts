/**
 * menu.ts — Type definitions for Dynamic Business Module Pillars
 * Syailendra Group ERP
 */

import type { ModuleTab } from '@/stores/nav-store'

export interface PillarRecord {
  id: number
  code: ModuleTab
  short_name: string
  name: string
  tagline: string
  description: string
  company_id: number
  company_name: string
  company_short_name: string
  sequence: number
  active: boolean
}

export interface UpdatePillarPayload {
  id: number
  short_name: string
  name: string
  tagline?: string
  description?: string
  company_id: number
  sequence?: number
}
