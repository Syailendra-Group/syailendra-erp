/**
 * pillar-catalog.ts — Shared business pillar ordering, icons, and default exclusive ownership
 * Syailendra Group ERP
 */

import { Bot, Calculator, Clock, Layers, Leaf, Sliders, Store, Target, Warehouse } from 'lucide-react'

import type { ModuleTab } from '@/stores/nav-store'
import type { ElementType } from 'react'

export const PILLAR_ORDER: ModuleTab[] = ['ftm', 'hrm', 'scm', 'wms', 'crm', 'dcm', 'ai', 'imm', 'others']

export const PILLAR_ICONS: Record<ModuleTab, ElementType> = {
  ftm: Calculator,
  hrm: Clock,
  scm: Layers,
  wms: Warehouse,
  crm: Target,
  dcm: Store,
  ai: Bot,
  imm: Leaf,
  others: Sliders
}

/** Default exclusive owner (backend company id) of each pillar */
export const DEFAULT_PILLAR_OWNERS: Record<ModuleTab, number> = {
  ftm: 1,
  hrm: 1,
  scm: 1,
  wms: 2,
  crm: 3,
  dcm: 3,
  ai: 3,
  imm: 4,
  others: 4
}
