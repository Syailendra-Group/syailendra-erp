'use client'

import { useState } from 'react'
import { LogOut, ShieldCheck, User } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SignOutDialog } from '@/components/dialog/sign-out-dialog'
import { ImageViewer } from '@/components/image/image-viewer'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useSessionQuery } from '@/hooks/auth/use-auth'
import { Link } from '@/i18n/navigation'

import type { ReactElement } from 'react'

export function ProfileDropdown(): ReactElement {
  const [openSignOut, setOpenSignOut] = useState(false)
  const tNav = useTranslations('nav.user')

  const { data: session } = useSessionQuery()
  const user = {
    name: session?.name || 'Demo Syailendra',
    email: session?.email || 'demo@syailendra.group',
    role: session?.isAdmin ? 'System Administrator' : 'Demo User'
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative size-8 cursor-pointer rounded-full p-0 hover:bg-white/15">
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/25 shadow-xs">
              <ImageViewer src={null} alt={user.name} fallbackText={user.name} disabled className="size-full rounded-full text-xs font-bold" />
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none font-semibold">{user.name}</p>
              <p className="text-muted-foreground text-xs leading-none">{user.email}</p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/employees">
                <User className="mr-2 h-4 w-4" />
                <span>{tNav('profile')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <ShieldCheck className="mr-2 h-4 w-4" />
              <span>{tNav('accessRole', { role: tNav('roles.admin') })}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenSignOut(true)} className="text-destructive focus:text-destructive cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>{tNav('logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={openSignOut} onOpenChange={setOpenSignOut} />
    </>
  )
}
