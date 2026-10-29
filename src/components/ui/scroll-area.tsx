'use client'

import { Corner, Root, Scrollbar, Thumb, Viewport } from '@radix-ui/react-scroll-area'

import { cn } from '@/lib/utils'

import type { ComponentProps } from 'react'

function ScrollArea({
  className,
  children,
  orientation = 'vertical',
  ...props
}: ComponentProps<typeof Root> & { orientation?: 'vertical' | 'horizontal' }) {
  return (
    <Root data-slot="scroll-area" className={cn('relative', className)} {...props}>
      <Viewport
        data-slot="scroll-area-viewport"
        className={cn(
          'focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px]',
          orientation === 'horizontal' && 'overflow-x-auto'
        )}
      >
        {children}
      </Viewport>
      <ScrollBar orientation={orientation} />
      <Corner />
    </Root>
  )
}

function ScrollBar({ className, orientation = 'vertical', ...props }: ComponentProps<typeof Scrollbar>) {
  return (
    <Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        'flex touch-none p-px transition-colors select-none',
        orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent',
        orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent',
        className
      )}
      {...props}
    >
      <Thumb data-slot="scroll-area-thumb" className="bg-border relative flex-1 rounded-full" />
    </Scrollbar>
  )
}

export { ScrollArea, ScrollBar }
