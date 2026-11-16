'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useLocale } from 'next-intl'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

import type { ReactElement } from 'react'

function FlagId({ className }: { className?: string }): ReactElement {
  return (
    <svg viewBox="0 0 640 480" className={cn('border-border/40 overflow-hidden rounded-xs border shadow-xs', className)} aria-hidden="true">
      <g fillRule="evenodd" strokeWidth="1pt">
        <path fill="#e70011" d="M0 0h640v240H0z" />
        <path fill="#ffffff" d="M0 240h640v240H0z" />
      </g>
    </svg>
  )
}

function FlagUs({ className }: { className?: string }): ReactElement {
  return (
    <svg viewBox="0 0 640 480" className={cn('border-border/40 overflow-hidden rounded-xs border shadow-xs', className)} aria-hidden="true">
      <path fill="#b22234" d="M0 0h640v480H0z" />
      <path stroke="#fff" strokeWidth="37" d="M0 55.5h640M0 129.5h640M0 203.5h640M0 277.5h640M0 351.5h640M0 425.5h640" />
      <path fill="#3c3b6e" d="M0 0h256v258.5H0z" />
      <g fill="#fff">
        <circle cx="28" cy="24" r="7" />
        <circle cx="70" cy="24" r="7" />
        <circle cx="112" cy="24" r="7" />
        <circle cx="154" cy="24" r="7" />
        <circle cx="196" cy="24" r="7" />
        <circle cx="238" cy="24" r="7" />
        <circle cx="49" cy="48" r="7" />
        <circle cx="91" cy="48" r="7" />
        <circle cx="133" cy="48" r="7" />
        <circle cx="175" cy="48" r="7" />
        <circle cx="217" cy="48" r="7" />
        <circle cx="28" cy="72" r="7" />
        <circle cx="70" cy="72" r="7" />
        <circle cx="112" cy="72" r="7" />
        <circle cx="154" cy="72" r="7" />
        <circle cx="196" cy="72" r="7" />
        <circle cx="238" cy="72" r="7" />
        <circle cx="49" cy="96" r="7" />
        <circle cx="91" cy="96" r="7" />
        <circle cx="133" cy="96" r="7" />
        <circle cx="175" cy="96" r="7" />
        <circle cx="217" cy="96" r="7" />
        <circle cx="28" cy="120" r="7" />
        <circle cx="70" cy="120" r="7" />
        <circle cx="112" cy="120" r="7" />
        <circle cx="154" cy="120" r="7" />
        <circle cx="196" cy="120" r="7" />
        <circle cx="238" cy="120" r="7" />
        <circle cx="49" cy="144" r="7" />
        <circle cx="91" cy="144" r="7" />
        <circle cx="133" cy="144" r="7" />
        <circle cx="175" cy="144" r="7" />
        <circle cx="217" cy="144" r="7" />
        <circle cx="28" cy="168" r="7" />
        <circle cx="70" cy="168" r="7" />
        <circle cx="112" cy="168" r="7" />
        <circle cx="154" cy="168" r="7" />
        <circle cx="196" cy="168" r="7" />
        <circle cx="238" cy="168" r="7" />
        <circle cx="49" cy="192" r="7" />
        <circle cx="91" cy="192" r="7" />
        <circle cx="133" cy="192" r="7" />
        <circle cx="175" cy="192" r="7" />
        <circle cx="217" cy="192" r="7" />
        <circle cx="28" cy="216" r="7" />
        <circle cx="70" cy="216" r="7" />
        <circle cx="112" cy="216" r="7" />
        <circle cx="154" cy="216" r="7" />
        <circle cx="196" cy="216" r="7" />
        <circle cx="238" cy="216" r="7" />
        <circle cx="49" cy="240" r="7" />
        <circle cx="91" cy="240" r="7" />
        <circle cx="133" cy="240" r="7" />
        <circle cx="175" cy="240" r="7" />
        <circle cx="217" cy="240" r="7" />
      </g>
    </svg>
  )
}

export interface LanguageToggleProps {
  className?: string
}

export function LanguageToggle({ className }: LanguageToggleProps): ReactElement {
  const locale = useLocale()
  const pathname = usePathname()
  const [isPending, setIsPending] = useState(false)

  const handleLanguageChange = (nextLocale: 'id' | 'en') => {
    if (nextLocale === locale) return

    setIsPending(true)
    // ponytail: hard navigation because soft locale switch hangs when the target segment has loading.tsx (vercel/next.js#86151); drop once upstream fixed
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000;samesite=lax`
    const target = nextLocale === routing.defaultLocale ? pathname : `/${nextLocale}${pathname === '/' ? '' : pathname}`
    window.location.assign(target)
  }

  const isIndonesian = locale === 'id'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isPending} aria-busy={isPending} className={cn('cursor-pointer gap-2 text-xs font-semibold', className)}>
          {isPending ? (
            <Loader2 className="size-3.5 shrink-0 animate-spin" />
          ) : isIndonesian ? (
            <FlagId className="h-3.5 w-5 shrink-0" />
          ) : (
            <FlagUs className="h-3.5 w-5 shrink-0" />
          )}
          <span>{isIndonesian ? 'ID' : 'EN'}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={isPending}
          onClick={() => handleLanguageChange('id')}
          className={`cursor-pointer gap-2.5 ${isIndonesian ? 'text-primary dark:text-primary font-bold' : ''}`}
        >
          <FlagId className="h-3.5 w-5 shrink-0" />
          <span>Indonesia</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={isPending}
          onClick={() => handleLanguageChange('en')}
          className={`cursor-pointer gap-2.5 ${!isIndonesian ? 'text-primary dark:text-primary font-bold' : ''}`}
        >
          <FlagUs className="h-3.5 w-5 shrink-0" />
          <span>English</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
