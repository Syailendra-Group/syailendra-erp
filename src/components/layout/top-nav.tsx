'use client'

import { type ElementType, type ReactElement } from 'react'
import { Boxes, Clock, UserCheck, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useNavStore } from '@/stores/nav-store'

import type { ModuleTab } from '@/stores/nav-store'

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
    <nav className="flex items-center gap-1 sm:gap-2">
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
              isActive ? 'bg-primary hover:bg-primary/90 font-semibold text-white shadow-xs' : 'hover:bg-muted hover:text-foreground'
            )}
          >
            <Link href={tab.href}>
              <Icon className={cn('h-4 w-4', isActive ? 'text-white' : '')} />
              <span className="hidden md:inline">{tNav(tab.titleKey)}</span>
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}
