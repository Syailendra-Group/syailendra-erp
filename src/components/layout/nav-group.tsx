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
      <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-wider text-white/60 uppercase">{tNav(group.titleKey)}</SidebarGroupLabel>

      <SidebarMenu className="gap-1 px-1">
        {group.items.map((item) => {
          const Icon = item.icon
          const isOverviewUrl =
            item.url === '/overview' ||
            item.url === '/ftm' ||
            item.url === '/hris' ||
            item.url === '/scm' ||
            item.url === '/wms' ||
            item.url === '/crm' ||
            item.url === '/dcm' ||
            item.url === '/ai' ||
            item.url === '/imm' ||
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
                  'h-10 cursor-pointer gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'border-brand-gold border-l-[3px] bg-white/15 font-semibold text-white shadow-xs hover:bg-white/20 hover:text-white data-[active=true]:bg-white/15 data-[active=true]:text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
              >
                <Link href={item.url || '#'}>
                  <Icon className={cn('h-4.5 w-4.5 shrink-0', isActive ? 'text-brand-gold' : 'text-white/75')} />
                  <span>{tNav(item.titleKey)}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'ml-auto px-1.5 py-0 text-[10px] font-bold',
                        isActive ? 'bg-brand-gold text-brand-ink border-transparent' : 'border-transparent bg-white/15 text-white'
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
