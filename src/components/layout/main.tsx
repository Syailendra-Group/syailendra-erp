import { type HTMLAttributes, type ReactElement } from 'react'

import { cn } from '@/lib/utils'

export interface MainProps extends HTMLAttributes<HTMLElement> {
  fixed?: boolean
  fluid?: boolean
}

export function Main({ fixed, className, fluid, ...props }: MainProps): ReactElement {
  return (
    <main
      data-layout={fixed ? 'fixed' : 'auto'}
      className={cn('px-4 py-6 sm:px-6 lg:px-8', fixed && 'flex grow flex-col overflow-hidden', !fluid && 'mx-auto w-full max-w-7xl', className)}
      {...props}
    />
  )
}
