'use client'

import * as React from 'react'

import { LanguageToggle } from '@/components/shared/language-toggle'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

import { TopNav } from './top-nav'

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
}

export function Header({ className, fixed = true, children, ...props }: HeaderProps): React.ReactElement {
  return (
    <header
      className={cn(
        'dark:bg-background/80 dark:supports-[backdrop-filter]:bg-background/70 border-border/40 z-30 h-16 border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70',
        fixed && 'sticky top-0 w-full',
        className
      )}
      {...props}
    >
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger variant="outline" className="cursor-pointer" />
          <Separator orientation="vertical" className="h-5" />
          <TopNav />
        </div>

        <div className="flex items-center gap-2">
          {children}
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
