'use client'

import { SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useSearch } from '@/contexts/main/search.context'
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
        'group text-muted-foreground hover:bg-muted bg-muted/30 relative h-8 cursor-pointer justify-center rounded-lg p-0 text-xs font-normal shadow-none max-sm:size-8 max-sm:w-8 sm:w-40 sm:justify-start sm:px-2.5 sm:pe-12 md:flex-none lg:w-48 xl:w-56',
        className
      )}
      onClick={() => setOpen(true)}
      aria-label={tSearch('placeholder')}
    >
      <SearchIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 sm:mr-2" />

      <span className="hidden truncate sm:inline">{placeholder || tSearch('placeholder')}</span>

      <kbd className="bg-muted pointer-events-none absolute top-[0.3rem] right-[0.3rem] hidden h-5 items-center gap-0.5 rounded border px-1.5 font-mono text-[10px] font-medium sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}
