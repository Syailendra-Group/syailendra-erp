'use client'

import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { ComponentProps, ComponentType, ReactElement, ReactNode } from 'react'

export interface LoadingButtonProps extends ComponentProps<typeof Button> {
  isLoading?: boolean
  loadingText?: ReactNode
  icon?: ComponentType<{ className?: string }>
  iconPlacement?: 'start' | 'end'
}

export function LoadingButton({
  isLoading = false,
  loadingText,
  icon: Icon,
  iconPlacement = 'start',
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps): ReactElement {
  const tCommon = useTranslations('common')
  const resolvedLoadingText = loadingText ?? tCommon('actions.loading')

  return (
    <Button disabled={disabled || isLoading} className={cn('cursor-pointer gap-2 font-semibold', className)} {...props}>
      {isLoading ? (
        <>
          <Loader2 className="size-3.5 shrink-0 animate-spin" />
          <span>{resolvedLoadingText}</span>
        </>
      ) : (
        <>
          {Icon && iconPlacement === 'start' && <Icon className="size-3.5 shrink-0" />}
          {children}
          {Icon && iconPlacement === 'end' && <Icon className="size-3.5 shrink-0" />}
        </>
      )}
    </Button>
  )
}
