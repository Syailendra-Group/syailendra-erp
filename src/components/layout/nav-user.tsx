'use client'

import { useState } from 'react'
import { BadgeCheck, ChevronsUpDown, LogOut, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SignOutDialog } from '@/components/dialog/sign-out-dialog'
import { EntityIdentityCell } from '@/components/image/entity-identity-cell'
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
                <EntityIdentityCell
                  name={user.name}
                  secondary={user.email}
                  className="min-w-0 flex-1 text-white [&_p:first-child]:text-white [&_p:last-child]:text-white/70"
                />
                <ChevronsUpDown className="ml-auto size-4 text-white/70" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" side="bottom" align="end" sideOffset={4}>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <EntityIdentityCell name={user.name} secondary={user.email} className="min-w-0 flex-1" />
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
