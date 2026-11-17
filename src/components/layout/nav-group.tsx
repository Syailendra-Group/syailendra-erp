'use client'

import { type ReactElement } from 'react'
import { ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from '@/components/ui/sidebar'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import type { NavCollapsibleItem, NavGroup as NavGroupType, NavItem } from '@/types/layout/navigation'

export interface NavGroupProps {
  group: NavGroupType
}

/** Overview routes match strictly on exact pathname (never prefix). */
const OVERVIEW_URLS = new Set(['/ftm', '/hris', '/scm', '/wms', '/crm', '/dcm', '/ai', '/imm', '/others', '/settings'])

function isRouteActive(url: string, pathname: string): boolean {
  const isOverviewUrl = OVERVIEW_URLS.has(url)
  return pathname === url || (!isOverviewUrl && pathname.startsWith(`${url}/`))
}

function isCollapsibleItem(item: NavItem): item is NavCollapsibleItem {
  return Array.isArray(item.items)
}

export function NavGroup({ group }: NavGroupProps): ReactElement {
  const tNav = useTranslations('nav')
  const pathname = usePathname()
  const { state, isMobile } = useSidebar()
  const isIconMode = !isMobile && state === 'collapsed'

  const triggerClasses = (active: boolean): string =>
    cn(
      'h-10 cursor-pointer gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
      active
        ? 'border-brand-gold border-l-[3px] bg-white/15 font-semibold text-white shadow-xs hover:bg-white/20 hover:text-white data-[active=true]:bg-white/15 data-[active=true]:text-white'
        : 'text-white/80 hover:bg-white/10 hover:text-white'
    )

  const renderIcon = (Icon: NavCollapsibleItem['icon'], active: boolean): ReactElement => (
    <Icon className={cn('h-4.5 w-4.5 shrink-0', active ? 'text-brand-gold' : 'text-white/75')} />
  )

  const renderCollapsibleItem = (item: NavCollapsibleItem): ReactElement => {
    const Icon = item.icon
    const groupActive = item.items.some((child) => isRouteActive(child.url, pathname))

    if (isIconMode) {
      return (
        <SidebarMenuItem key={item.titleKey}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton tooltip={tNav(item.titleKey)} className={triggerClasses(groupActive)}>
                {renderIcon(Icon, groupActive)}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" sideOffset={4} className="min-w-56">
              <DropdownMenuLabel>{tNav(item.titleKey)}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {item.items.map((child) => (
                <DropdownMenuItem key={child.titleKey} asChild>
                  <Link href={child.url}>{tNav(child.titleKey)}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      )
    }

    return (
      <Collapsible key={item.titleKey} defaultOpen={groupActive} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={tNav(item.titleKey)} className={triggerClasses(groupActive)}>
              {renderIcon(Icon, groupActive)}
              <span>{tNav(item.titleKey)}</span>
              <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-white/60 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="mr-0 border-white/15 pr-0">
              {item.items.map((child) => (
                <SidebarMenuSubItem key={child.titleKey}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isRouteActive(child.url, pathname)}
                    className="text-white/70 hover:bg-white/10 hover:text-white data-[active=true]:bg-white/15 data-[active=true]:font-semibold data-[active=true]:text-white"
                  >
                    <Link href={child.url}>
                      <span>{tNav(child.titleKey)}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarGroup className="py-2">
      {group.titleKey ? (
        <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-wider text-white/60 uppercase">
          {tNav(group.titleKey)}
        </SidebarGroupLabel>
      ) : null}

      <SidebarMenu className="gap-1 px-1">
        {group.items.map((item) =>
          isCollapsibleItem(item) ? (
            renderCollapsibleItem(item)
          ) : (
            <SidebarMenuItem key={item.titleKey}>
              <SidebarMenuButton
                asChild
                isActive={isRouteActive(item.url, pathname)}
                tooltip={tNav(item.titleKey)}
                className={triggerClasses(isRouteActive(item.url, pathname))}
              >
                <Link href={item.url || '#'}>
                  {renderIcon(item.icon, isRouteActive(item.url, pathname))}
                  <span>{tNav(item.titleKey)}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'ml-auto px-1.5 py-0 text-[10px] font-bold',
                        isRouteActive(item.url, pathname)
                          ? 'bg-brand-gold text-brand-ink border-transparent'
                          : 'border-transparent bg-white/15 text-white'
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
