'use client'

import * as React from 'react'
import { Boxes, Clock, UserCheck, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useNavStore } from '@/stores/nav-store'

import type { ModuleTab } from '@/stores/nav-store'

export type TopNavProps = React.HTMLAttributes<HTMLElement>

export function TopNav({ className, ...props }: TopNavProps): React.ReactElement {
  const tNav = useTranslations('nav')
  const { activeTab, setActiveTab } = useNavStore()

  const tabs: { id: ModuleTab; titleKey: string; icon: React.ElementType }[] = [
    { id: 'inventory', titleKey: 'modules.inventory', icon: Boxes },
    { id: 'crm', titleKey: 'modules.crm', icon: Users },
    { id: 'hr', titleKey: 'modules.hr', icon: Clock },
    { id: 'employees', titleKey: 'modules.employees', icon: UserCheck }
  ]

  return (
    <nav className={cn('flex items-center gap-1 sm:gap-2', className)} {...props}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <Button
            key={tab.id}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'cursor-pointer gap-2 text-xs font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className={cn('h-4 w-4', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
            <span className="hidden md:inline">{tNav(tab.titleKey)}</span>
          </Button>
        )
      })}
    </nav>
  )
}
