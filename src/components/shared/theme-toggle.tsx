'use client'

import { useCallback } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { ReactElement } from 'react'

export interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps): ReactElement {
  const { resolvedTheme, setTheme } = useTheme()
  const tTheme = useTranslations('common.theme')

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={cn('relative cursor-pointer transition-colors', className)}
      aria-label={tTheme('toggle')}
      title={tTheme('toggle')}
      type="button"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 text-amber-400 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 text-indigo-300 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">{tTheme('toggle')}</span>
    </Button>
  )
}
