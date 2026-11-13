'use client'

import { useEffect } from 'react'

import { CommandMenu } from '@/components/command-menu'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { SkipToMain } from '@/components/skip-to-main'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SearchProvider } from '@/contexts/shared/search.context'
import { useCompaniesHydration } from '@/hooks/others/use-companies'
import { usePathname } from '@/i18n/navigation'
import { resolveEntityByTab, useEntityStore } from '@/stores/entity-store'
import { useNavStore } from '@/stores/nav-store'

import type { ModuleTab } from '@/stores/nav-store'
import type { ReactElement, ReactNode } from 'react'

export interface AuthenticatedLayoutProps {
  children: ReactNode
}

function resolveTabFromPath(pathname: string): ModuleTab {
  if (pathname.startsWith('/ftm')) return 'ftm'
  if (
    pathname.startsWith('/hris') ||
    pathname.startsWith('/hrm') ||
    pathname.startsWith('/hr') ||
    pathname.startsWith('/attendance') ||
    pathname.startsWith('/employees') ||
    pathname.startsWith('/admin/employees') ||
    pathname.startsWith('/admin/departments')
  ) {
    return 'hrm'
  }
  if (pathname.startsWith('/scm')) return 'scm'
  if (pathname.startsWith('/wms') || pathname.startsWith('/inventory')) return 'wms'
  if (pathname.startsWith('/crm')) return 'crm'
  if (pathname.startsWith('/dcm')) return 'dcm'
  if (pathname.startsWith('/ai')) return 'ai'
  if (pathname.startsWith('/imm')) return 'imm'
  if (pathname.startsWith('/others') || pathname.startsWith('/settings') || pathname.startsWith('/admin')) return 'others'
  return 'ftm'
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps): ReactElement {
  const pathname = usePathname()
  const setActiveTab = useNavStore((s) => s.setActiveTab)
  const activeEntityId = useEntityStore((s) => s.activeEntityId)
  const entities = useEntityStore((s) => s.entities)
  const setActiveEntityId = useEntityStore((s) => s.setActiveEntityId)

  // Global hydration of company metadata (short_name, logo_web, enabled_pillars) from backend
  useCompaniesHydration()

  // Two-way synchronization: keep TopNav tab, Sidebar groups, and owning PT entity aligned with active URL
  useEffect(() => {
    const resolvedTab = resolveTabFromPath(pathname)
    setActiveTab(resolvedTab)

    // Check if currently active entity already owns this pillar tab
    const currentEntity = entities.find((e) => e.id === activeEntityId)
    if (currentEntity && currentEntity.pillars.includes(resolvedTab)) {
      return
    }

    // Otherwise, switch activeEntityId to the designated owner of this tab
    const owningEntity = resolveEntityByTab(resolvedTab)
    if (owningEntity && owningEntity.id !== activeEntityId) {
      setActiveEntityId(owningEntity.id)
    }
  }, [pathname, activeEntityId, entities, setActiveEntityId, setActiveTab])

  return (
    <SearchProvider>
      <TooltipProvider delayDuration={0}>
        <SkipToMain />

        <SidebarProvider defaultOpen={true}>
          <AppSidebar />

          <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-x-clip">
            <Header fixed={true} />

            <Main id="content">
              <Breadcrumbs />
              {children}
            </Main>
          </SidebarInset>
        </SidebarProvider>

        <CommandMenu />
      </TooltipProvider>
    </SearchProvider>
  )
}
