'use client'

import { Bot, Calculator, Clock, Layers, LayoutDashboard, Leaf, Menu, Sliders, Store, Target, Warehouse } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useNavStore } from '@/stores/nav-store'

import type { ModuleTab } from '@/stores/nav-store'
import type { ElementType, ReactElement } from 'react'

export interface NavItemConfig {
  id: ModuleTab
  titleKey: string
  icon: ElementType
  href: string
  roles?: string[]
}

export function TopNav(): ReactElement {
  const tNav = useTranslations('nav')
  const { activeTab, setActiveTab } = useNavStore()

  // Consolidated Overview, 8 Core Business Pillars & System Administration
  const tabs: NavItemConfig[] = [
    { id: 'main', titleKey: 'modules.main', icon: LayoutDashboard, href: '/overview' },
    { id: 'ftm', titleKey: 'modules.ftm', icon: Calculator, href: '/ftm' },
    { id: 'hrm', titleKey: 'modules.hrm', icon: Clock, href: '/hris' },
    { id: 'scm', titleKey: 'modules.scm', icon: Layers, href: '/scm' },
    { id: 'wms', titleKey: 'modules.wms', icon: Warehouse, href: '/wms' },
    { id: 'crm', titleKey: 'modules.crm', icon: Target, href: '/crm' },
    { id: 'dcm', titleKey: 'modules.dcm', icon: Store, href: '/dcm' },
    { id: 'ai', titleKey: 'modules.ai', icon: Bot, href: '/ai' },
    { id: 'imm', titleKey: 'modules.imm', icon: Leaf, href: '/imm' },
    { id: 'others', titleKey: 'modules.others', icon: Sliders, href: '/others' }
  ]

  return (
    <>
      {/* Mobile / Tablet Dropdown Menu (< xl) */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline" className="size-8 xl:hidden" aria-label={tNav('toggleNavMenu')}>
            <Menu className="size-4" />
            <span className="sr-only">{tNav('toggleNavMenu')}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="start" className="w-56">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <DropdownMenuItem key={tab.id} asChild onClick={() => setActiveTab(tab.id)}>
                <Link
                  href={tab.href}
                  className={cn('cursor-pointer gap-2 text-xs font-medium', isActive ? 'text-primary bg-primary/10 font-bold' : '')}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tNav(tab.titleKey)}</span>
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Desktop Horizontal Navigation (>= xl) */}
      <nav className="hidden items-center gap-0.5 xl:flex">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <Button
              key={tab.id}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              asChild
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'cursor-pointer gap-1 px-2 text-[11px] font-semibold tracking-wider transition-colors 2xl:px-2.5',
                isActive
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Link href={tab.href}>
                <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                <span>{tNav(tab.titleKey)}</span>
              </Link>
            </Button>
          )
        })}
      </nav>
    </>
  )
}
