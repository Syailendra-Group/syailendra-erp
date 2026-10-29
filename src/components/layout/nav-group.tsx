'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import type { NavGroup as NavGroupType } from './types'

export interface NavGroupProps {
  group: NavGroupType
}

export function NavGroup({ group }: NavGroupProps): React.ReactElement {
  const tNav = useTranslations('nav')
  const pathname = usePathname()

  return (
    <SidebarGroup className="py-2">
      <SidebarGroupLabel className="text-muted-foreground px-3 text-[11px] font-semibold tracking-wider uppercase">
        {tNav(group.titleKey)}
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1 px-1">
        {group.items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.url || (item.url !== '/inventory' && item.url !== '/employees' && pathname.startsWith(item.url + '/'))

          return (
            <SidebarMenuItem key={item.titleKey}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={tNav(item.titleKey)}
                className={cn(
                  'h-10 cursor-pointer gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Link href={item.url || '#'}>
                  <Icon className={cn('h-4.5 w-4.5 shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                  <span>{tNav(item.titleKey)}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'ml-auto px-1.5 py-0 text-[10px] font-bold',
                        isActive && 'bg-primary-foreground/20 text-primary-foreground border-transparent'
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
