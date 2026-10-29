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
import { SearchProvider } from '@/contexts/search-context'
import { usePathname } from '@/i18n/navigation'
import { useNavStore } from '@/stores/nav-store'

import type { ReactElement, ReactNode } from 'react'

export interface AuthenticatedLayoutProps {
  children: ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps): ReactElement {
  const pathname = usePathname()
  const { setActiveTab } = useNavStore()

  useEffect(() => {
    if (pathname.includes('/employees') || pathname.includes('/admin')) {
      setActiveTab('employees')
    } else if (
      pathname.includes('/inventory') ||
      pathname.includes('/commodities') ||
      pathname.includes('/lots') ||
      pathname.includes('/traceability')
    ) {
      setActiveTab('inventory')
    } else if (pathname.includes('/crm')) {
      setActiveTab('crm')
    } else if (pathname.includes('/hr') || pathname.includes('/attendance')) {
      setActiveTab('hr')
    }
  }, [pathname, setActiveTab])

  return (
    <SearchProvider>
      <TooltipProvider delayDuration={0}>
        <SkipToMain />
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarInset className="w-full min-w-0 overflow-x-hidden">
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
