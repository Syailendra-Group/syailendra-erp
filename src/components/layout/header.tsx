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

const HEADER_BTN_CLASS = 'border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white'

export function Header({ className, children, ...props }: HeaderProps): ReactElement {
  return (
    <div className="bg-background/90 sticky top-0 z-40 w-full pe-2 pt-2 pb-1 backdrop-blur-md max-md:ps-2 md:ps-0">
      <header
        className={cn(
          'bg-primary text-primary-foreground flex h-16 w-full items-center rounded-lg border border-white/10 shadow-md transition-colors',
          className
        )}
        {...props}
      >
        <div className="flex w-full items-center gap-2 px-3 sm:gap-4 sm:px-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <SidebarTrigger variant="ghost" className={cn('cursor-pointer max-md:scale-110', HEADER_BTN_CLASS)} />
            <Separator orientation="vertical" className="h-5 bg-white/20" />
            <TopNav />
          </div>

          <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
            {children}
            <Search className={cn('border-white/20 bg-white/10 text-white/90 hover:bg-white/20 hover:text-white')} />
            <LanguageToggle className={HEADER_BTN_CLASS} />
            <ThemeToggle className={HEADER_BTN_CLASS} />
            <Separator orientation="vertical" className="hidden h-5 bg-white/20 sm:block" />
            <ProfileDropdown />
          </div>
        </div>
      </header>
    </div>
  )
}
