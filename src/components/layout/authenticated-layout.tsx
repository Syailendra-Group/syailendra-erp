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

  // Route-watcher to automatically synchronize active navbar & sidebar module
  useEffect(() => {
    if (pathname.includes('/traceability')) {
      setActiveTab('traceability')
    } else if (pathname.includes('/wms') || pathname.includes('/inventory')) {
      setActiveTab('wms')
    } else if (pathname.includes('/crm')) {
      setActiveTab('crm')
    } else if (pathname.includes('/hris') || pathname.includes('/hr') || pathname.includes('/attendance') || pathname.includes('/employees')) {
      setActiveTab('hris')
    } else if (pathname.includes('/others') || pathname.includes('/settings') || pathname.includes('/admin')) {
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
