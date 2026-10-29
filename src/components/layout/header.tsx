'use client'

import { type HTMLAttributes, type ReactElement } from 'react'

import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { LanguageToggle } from '@/components/shared/language-toggle'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

import { TopNav } from './top-nav'

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  fixed?: boolean
}

export function Header({ className, fixed = true, children, ...props }: HeaderProps): ReactElement {
  return (
    <header
      className={cn(
        'dark:bg-background/80 dark:supports-[backdrop-filter]:bg-background/70 border-border/40 z-30 h-16 border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70',
        fixed && 'sticky top-0 w-full',
        className
      )}
      {...props}
    >
      <div className="flex h-full items-center gap-2 px-3 sm:gap-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <SidebarTrigger variant="outline" className="cursor-pointer max-md:scale-110" />
          <Separator orientation="vertical" className="h-5" />
          <TopNav />
        </div>

        <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
          {children}
          <Search />
          <LanguageToggle />
          <ThemeToggle />
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  )
}
