'use client'

import * as React from 'react'
import { Sprout } from 'lucide-react'

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

export interface CompanySwitcherProps {
  companyName?: string
  unitName?: string
}

export function CompanySwitcher({
  companyName = 'Syailendra Group',
  unitName = 'Specialty Agri & Commodities'
}: CompanySwitcherProps): React.ReactElement {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer">
          <div className="text-sidebar-primary-foreground bg-primary flex aspect-square size-8 items-center justify-center rounded-lg shadow-xs">
            <Sprout className="size-4 text-white" />
          </div>
          <div className="grid flex-1 text-left text-xs leading-tight">
            <span className="text-foreground truncate font-bold tracking-tight">{companyName}</span>
            <span className="text-muted-foreground truncate text-[10px]">{unitName}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
