'use client'

import { type ReactElement } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function ThemeToggle(): ReactElement {
  const { setTheme } = useTheme()
  const tTheme = useTranslations('common.theme')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative cursor-pointer">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 text-amber-500 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 text-indigo-400 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">{tTheme('toggle')}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer">
          {tTheme('light')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer">
          {tTheme('dark')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer">
          {tTheme('system')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
