'use client'

import { SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useSearch } from '@/contexts/search-context'
import { cn } from '@/lib/utils'

import type { ComponentProps, ReactElement } from 'react'

export interface SearchProps extends ComponentProps<'button'> {
  placeholder?: string
}

export function Search({ className = '', placeholder, ...props }: SearchProps): ReactElement {
  const { setOpen } = useSearch()
  const tSearch = useTranslations('common.search')

  return (
    <Button
      {...props}
      variant="outline"
      className={cn(
        'group text-muted-foreground hover:bg-muted bg-muted/30 relative h-8 w-full flex-1 cursor-pointer justify-start rounded-lg text-xs font-normal shadow-none sm:w-40 sm:pe-12 md:flex-none lg:w-48 xl:w-56',
        className
      )}
      onClick={() => setOpen(true)}
    >
      <SearchIcon aria-hidden="true" className="mr-2 h-3.5 w-3.5" />
      <span className="truncate">{placeholder || tSearch('placeholder')}</span>
      <kbd className="bg-muted pointer-events-none absolute top-[0.3rem] right-[0.3rem] hidden h-5 items-center gap-0.5 rounded border px-1.5 font-mono text-[10px] font-medium sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}
