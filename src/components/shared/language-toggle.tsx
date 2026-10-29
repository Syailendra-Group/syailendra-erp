'use client'

import { Languages } from 'lucide-react'
import { useLocale } from 'next-intl'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { usePathname, useRouter } from '@/i18n/navigation'

import type { ReactElement } from 'react'

export function LanguageToggle(): ReactElement {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (nextLocale: 'id' | 'en') => {
    // next-intl useRouter automatically handles switching locale with current pathname
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer gap-2 text-xs font-semibold">
          <Languages className="text-primary h-4 w-4" />
          <span className="uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLanguageChange('id')}
          className={`cursor-pointer ${locale === 'id' ? 'text-primary dark:text-primary font-bold' : ''}`}
        >
          🇮🇩 Bahasa Indonesia (Default)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('en')}
          className={`cursor-pointer ${locale === 'en' ? 'text-primary dark:text-primary font-bold' : ''}`}
        >
          🇬🇧 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
