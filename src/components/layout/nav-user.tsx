'use client'

import { useState } from 'react'
import { BadgeCheck, ChevronsUpDown, LogOut, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SignOutDialog } from '@/components/dialog/sign-out-dialog'
import { ImageViewer } from '@/components/image/image-viewer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { useSessionQuery } from '@/hooks/auth/use-auth'

import type { ReactElement } from 'react'

export function NavUser(): ReactElement {
  const [openSignOut, setOpenSignOut] = useState(false)
  const tNav = useTranslations('nav.user')

  const { data: session } = useSessionQuery()
  const user = {
    name: session?.name || 'Demo Syailendra',
    email: session?.email || 'demo@syailendra.group',
    roleKey: session?.isAdmin ? 'admin' : 'member'
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="cursor-pointer text-white hover:bg-white/10 hover:text-white data-[state=open]:bg-white/15 data-[state=open]:text-white"
              >
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/20 shadow-xs">
                  <ImageViewer src={null} alt={user.name} fallbackText={user.name} disabled className="size-full text-xs font-bold" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white">{user.name}</span>
                  <span className="truncate text-xs text-white/70">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-white/70" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" side="bottom" align="end" sideOffset={4}>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div className="border-border/50 flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border shadow-xs">
                    <ImageViewer src={null} alt={user.name} fallbackText={user.name} disabled className="size-full text-xs font-bold" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer gap-2">
                  <Sparkles className="size-4" />
                  <span>{tNav('connectionStatus')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2">
                  <BadgeCheck className="size-4" />
                  <span>{tNav('accessRole', { role: tNav(('roles.' + user.roleKey) as 'roles.admin') })}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpenSignOut(true)} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="size-4" />
                <span>{tNav('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={openSignOut} onOpenChange={setOpenSignOut} />
    </>
  )
}
