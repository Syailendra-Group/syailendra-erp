'use client'

import { useRef, useState } from 'react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import type { ReactElement, ReactNode } from 'react'

export interface LongTextProps {
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function LongText({ children, className = '', contentClassName = '' }: LongTextProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null)
  const [isOverflown, setIsOverflown] = useState(false)

  const refCallback = (node: HTMLDivElement | null) => {
    ref.current = node
    if (node) {
      const hasOverflow = node.offsetHeight < node.scrollHeight || node.offsetWidth < node.scrollWidth
      if (hasOverflow) {
        queueMicrotask(() => setIsOverflown(true))
      }
    }
  }

  if (!isOverflown) {
    return (
      <div ref={refCallback} className={cn('truncate', className)}>
        {children}
      </div>
    )
  }

  return (
    <>
      <div className="hidden sm:block">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div ref={refCallback} className={cn('truncate', className)}>
                {children}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className={contentClassName}>{children}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="sm:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <div ref={refCallback} className={cn('truncate', className)}>
              {children}
            </div>
          </PopoverTrigger>
          <PopoverContent className={cn('w-fit text-xs', contentClassName)}>
            <p>{children}</p>
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}
