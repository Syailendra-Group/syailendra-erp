'use client'

import { useMemo } from 'react'
import { Bot, Calculator, Clock, Layers, Leaf, Menu, Sliders, Store, Target, Warehouse } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { usePillarsQuery } from '@/hooks/others/use-menus'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useEntityStore } from '@/stores/entity-store'
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

const ALL_TABS: NavItemConfig[] = [
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

export function TopNav(): ReactElement {
  const tNav = useTranslations('nav')
  const { activeTab, setActiveTab } = useNavStore()
  const activeEntityId = useEntityStore((s) => s.activeEntityId)
  const entities = useEntityStore((s) => s.entities)
  const { data: pillarsData } = usePillarsQuery()

  const pillarShortNames = useMemo(() => {
    const map = new Map<ModuleTab, string>()
    pillarsData?.pillars?.forEach((p) => {
      if (p.short_name) map.set(p.code, p.short_name)
    })
    return map
  }, [pillarsData])

  const activeEntity = entities.find((e) => e.id === activeEntityId) || entities[0]
  const activePillars = activeEntity?.pillars || ['ftm', 'scm']
  const visibleTabs = ALL_TABS.filter((tab) => activePillars.includes(tab.id))

  return (
    <>
      {/* Mobile / Tablet Dropdown Menu (< xl) */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="size-8 border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white xl:hidden"
            aria-label={tNav('toggleNavMenu')}
          >
            <Menu className="size-4" />
            <span className="sr-only">{tNav('toggleNavMenu')}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="start" className="w-56">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const label = pillarShortNames.get(tab.id) || tNav(tab.titleKey)
            return (
              <DropdownMenuItem key={tab.id} asChild onClick={() => setActiveTab(tab.id)}>
                <Link
                  href={tab.href}
                  className={cn('cursor-pointer gap-2 text-xs font-medium', isActive ? 'text-primary bg-primary/10 font-bold' : '')}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Desktop Horizontal Navigation (>= xl) */}
      <nav className="hidden items-center gap-1 xl:flex">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const label = pillarShortNames.get(tab.id) || tNav(tab.titleKey)
          return (
            <Button
              key={tab.id}
              variant="ghost"
              asChild
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'h-9 cursor-pointer gap-1.5 rounded-md px-2.5 text-[11px] font-semibold tracking-wider transition-all 2xl:px-3',
                isActive
                  ? 'border-brand-gold border-b-2 bg-white/15 font-bold text-white shadow-xs hover:bg-white/20 hover:text-white'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              )}
            >
              <Link href={tab.href}>
                <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-brand-gold' : 'text-white/70')} />
                <span>{label}</span>
              </Link>
            </Button>
          )
        })}
      </nav>
    </>
  )
}
