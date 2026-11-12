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
import { SearchProvider } from '@/contexts/main/search.context'
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
  return 'main'
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps): ReactElement {
  const pathname = usePathname()
  const setActiveTab = useNavStore((s) => s.setActiveTab)
  const setActiveEntityId = useEntityStore((s) => s.setActiveEntityId)

  // Two-way synchronization: keep TopNav tab, Sidebar groups, and owning PT entity aligned with active URL
  useEffect(() => {
    const resolvedTab = resolveTabFromPath(pathname)
    setActiveTab(resolvedTab)
    const owningEntity = resolveEntityByTab(resolvedTab)
    setActiveEntityId(owningEntity.id)
  }, [pathname, setActiveEntityId, setActiveTab])

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
