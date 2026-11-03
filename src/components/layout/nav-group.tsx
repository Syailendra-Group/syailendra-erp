'use client'

import { type ReactElement } from 'react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import type { NavGroup as NavGroupType } from '@/types/layout/navigation'

export interface NavGroupProps {
  group: NavGroupType
}

export function NavGroup({ group }: NavGroupProps): ReactElement {
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
          const isOverviewUrl =
            item.url === '/overview' ||
            item.url === '/traceability' ||
            item.url === '/wms' ||
            item.url === '/crm' ||
            item.url === '/hris' ||
            item.url === '/others' ||
            item.url === '/settings'
          const isActive = pathname === item.url || (!isOverviewUrl && pathname.startsWith(item.url + '/'))

          return (
            <SidebarMenuItem key={item.titleKey}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={tNav(item.titleKey)}
                className={cn(
                  'h-10 cursor-pointer gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary data-[active=true]:bg-primary hover:bg-primary/90 font-semibold text-white shadow-xs hover:text-white data-[active=true]:text-white'
                    : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Link href={item.url || '#'}>
                  <Icon className={cn('h-4.5 w-4.5 shrink-0', isActive ? 'text-white' : '')} />
                  <span>{tNav(item.titleKey)}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'ml-auto px-1.5 py-0 text-[10px] font-bold',
                        isActive && 'bg-primary-foreground/20 border-transparent text-white'
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
