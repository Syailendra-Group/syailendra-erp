'use client'

import { Clock, Layers, LayoutDashboard, Menu, Sliders, Target, Warehouse } from 'lucide-react'
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

  // 6 Strategic Pillars of Syailendra Group ERP
  const tabs: NavItemConfig[] = [
    { id: 'main', titleKey: 'modules.main', icon: LayoutDashboard, href: '/overview' },
    { id: 'traceability', titleKey: 'modules.traceability', icon: Layers, href: '/traceability' },
    { id: 'wms', titleKey: 'modules.wms', icon: Warehouse, href: '/wms' },
    { id: 'crm', titleKey: 'modules.crm', icon: Target, href: '/crm' },
    { id: 'hris', titleKey: 'modules.hris', icon: Clock, href: '/hris' },
    { id: 'others', titleKey: 'modules.others', icon: Sliders, href: '/settings' }
  ]

  return (
    <>
      {/* Mobile / Tablet Dropdown Menu (< lg) */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline" className="size-8 lg:hidden" aria-label={tNav('toggleNavMenu')}>
            <Menu className="size-4" />
            <span className="sr-only">{tNav('toggleNavMenu')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="start" className="w-48">
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

      {/* Desktop Horizontal Navigation (>= lg) */}
      <nav className="hidden items-center gap-1 lg:flex xl:gap-1.5">
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
                'cursor-pointer gap-1.5 px-2.5 text-xs font-semibold tracking-wider transition-colors xl:px-3',
                isActive
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Link href={tab.href}>
                <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                <span>{tNav(tab.titleKey)}</span>
              </Link>
            </Button>
          )
        })}
      </nav>
    </>
  )
}
