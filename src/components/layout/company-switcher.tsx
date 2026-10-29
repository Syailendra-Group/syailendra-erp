'use client'

import { useState } from 'react'
import { Building2, Check, ChevronsUpDown, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

import type { ReactElement } from 'react'

export function CompanySwitcher(): ReactElement {
  const tCommon = useTranslations('common.company')
  const [selectedCompany] = useState({
    name: 'Syailendra Group',
    category: 'Specialty Agri & Commodities',
    code: 'SYA-MAIN'
  })

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{selectedCompany.name}</span>
                <span className="text-muted-foreground truncate text-xs">{selectedCompany.category}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" align="start" side="bottom" sideOffset={4}>
            <DropdownMenuLabel className="text-muted-foreground text-xs tracking-wider uppercase">{tCommon('multiUnit')}</DropdownMenuLabel>
            <DropdownMenuItem className="cursor-pointer gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-sm border">
                <ShieldCheck className="size-4 shrink-0" />
              </div>
              <span className="font-medium">PT Syailendra Agri Utama</span>
              <Check className="text-primary ml-auto size-4" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="text-muted-foreground p-2 text-[11px] leading-relaxed">{tCommon('connectionNotice')}</div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
