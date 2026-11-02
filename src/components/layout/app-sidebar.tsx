'use client'

import { CompanySwitcher } from '@/components/layout/company-switcher'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { getNavGroups } from '@/data/sidebar-data'
import { useNavStore } from '@/stores/nav-store'

import type { ReactElement } from 'react'

export function AppSidebar(): ReactElement {
  const { activeTab } = useNavStore()
  const currentGroups = getNavGroups(activeTab)

  return (
    <Sidebar collapsible="icon" variant="floating" className="border-0 shadow-md">
      <SidebarHeader>
        <CompanySwitcher />
      </SidebarHeader>

      <SidebarContent className="gap-2">
        {currentGroups.map((group) => (
          <NavGroup key={group.titleKey} group={group} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
