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

export function Header({ className, children, ...props }: HeaderProps): ReactElement {
  return (
    <header
      className={cn(
        'border-border/40 dark:bg-background/85 dark:supports-backdrop-filter:bg-background/75 sticky top-0 z-40 flex h-16 w-full items-center border-b bg-white/85 backdrop-blur-md transition-colors supports-backdrop-filter:bg-white/75',
        className
      )}
      {...props}
    >
      <div className="flex w-full items-center gap-2 px-3 sm:gap-4 sm:px-6">
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
