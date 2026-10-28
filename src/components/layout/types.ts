import * as React from 'react'

export type ModuleCategory = 'inventory' | 'crm' | 'hr' | 'employees'

export interface UserProfile {
  name: string
  email: string
  avatar?: string
  role: string
}

export interface CompanyProfile {
  name: string
  logo?: string
  plan: string
}

export interface BaseNavItem {
  titleKey: string
  badge?: string
  icon: React.ElementType
}

export interface NavLinkItem extends BaseNavItem {
  url: string
  items?: never
}

export interface NavCollapsibleItem extends BaseNavItem {
  items: {
    titleKey: string
    url: string
    badge?: string
  }[]
  url?: never
}

export type NavItem = NavLinkItem | NavCollapsibleItem

export interface NavGroup {
  titleKey: string
  items: NavItem[]
}

export interface ModuleNavConfig {
  category: ModuleCategory
  navGroups: NavGroup[]
}
