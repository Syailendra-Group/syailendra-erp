'use client'

import { Boxes, Clock, Menu, UserCheck, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useNavStore } from '@/stores/nav-store'

import type { ModuleTab } from '@/stores/nav-store'
import type { ElementType, ReactElement } from 'react'

export function TopNav(): ReactElement {
  const tNav = useTranslations('nav')
  const { activeTab, setActiveTab } = useNavStore()

  const tabs: { id: ModuleTab; titleKey: string; icon: ElementType; href: string }[] = [
    { id: 'inventory', titleKey: 'modules.inventory', icon: Boxes, href: '/inventory' },
    { id: 'crm', titleKey: 'modules.crm', icon: Users, href: '/crm' },
    { id: 'hr', titleKey: 'modules.hr', icon: Clock, href: '/hr' },
    { id: 'employees', titleKey: 'modules.employees', icon: UserCheck, href: '/employees' }
  ]

  return (
    <>
      {/* Mobile / Tablet Dropdown Menu (< lg) */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline" className="size-8 lg:hidden" aria-label="Toggle navigation menu">
            <Menu className="size-4" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="start">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <DropdownMenuItem key={tab.id} asChild onClick={() => setActiveTab(tab.id)}>
                <Link href={tab.href} className={cn('cursor-pointer gap-2 text-xs font-medium', isActive ? 'text-primary font-bold' : '')}>
                  <Icon className="h-4 w-4" />
                  <span>{tNav(tab.titleKey)}</span>
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Desktop Horizontal Navigation (>= lg) */}
      <nav className="hidden items-center gap-1.5 lg:flex xl:gap-2">
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
                'cursor-pointer gap-2 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Link href={tab.href}>
                <Icon className={cn('h-4 w-4', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                <span>{tNav(tab.titleKey)}</span>
              </Link>
            </Button>
          )
        })}
      </nav>
    </>
  )
}
