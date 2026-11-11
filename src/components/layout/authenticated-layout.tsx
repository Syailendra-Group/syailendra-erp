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
import { useNavStore } from '@/stores/nav-store'

import type { ReactElement, ReactNode } from 'react'

export interface AuthenticatedLayoutProps {
  children: ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps): ReactElement {
  const pathname = usePathname()
  const { setActiveTab } = useNavStore()

  // Route-watcher to automatically synchronize active navbar & sidebar module across all 8 pillars
  useEffect(() => {
    if (pathname.startsWith('/ftm')) {
      setActiveTab('ftm')
    } else if (
      pathname.startsWith('/hris') ||
      pathname.startsWith('/hrm') ||
      pathname.startsWith('/hr') ||
      pathname.startsWith('/attendance') ||
      pathname.startsWith('/employees') ||
      pathname.startsWith('/admin/employees') ||
      pathname.startsWith('/admin/departments')
    ) {
      setActiveTab('hrm')
    } else if (pathname.startsWith('/scm')) {
      setActiveTab('scm')
    } else if (pathname.startsWith('/wms') || pathname.startsWith('/inventory')) {
      setActiveTab('wms')
    } else if (pathname.startsWith('/crm')) {
      setActiveTab('crm')
    } else if (pathname.startsWith('/dcm')) {
      setActiveTab('dcm')
    } else if (pathname.startsWith('/ai')) {
      setActiveTab('ai')
    } else if (pathname.startsWith('/imm')) {
      setActiveTab('imm')
    } else if (pathname.startsWith('/others') || pathname.startsWith('/settings') || pathname.startsWith('/admin')) {
      setActiveTab('others')
    } else {
      setActiveTab('main')
    }
  }, [pathname, setActiveTab])

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
