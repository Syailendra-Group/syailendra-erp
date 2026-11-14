'use client'

import { Check, ChevronsUpDown } from 'lucide-react'

import { ImageViewer } from '@/components/image/image-viewer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

import type { ComponentType, ReactElement, ReactNode } from 'react'

export interface DropdownSelectOption<T extends string | number = string> {
  value: T
  title: ReactNode
  subtitle?: ReactNode
  icon?: ComponentType<{ className?: string }>
  imageSrc?: string | null
  fallbackText?: string
  badge?: ReactNode
  disabled?: boolean
}

export interface DropdownSelectProps<T extends string | number = string> {
  options: DropdownSelectOption<T>[]
  value?: T
  onValueChange: (value: T) => void
  triggerLabel?: ReactNode
  triggerBadge?: ReactNode
  triggerIcon?: ComponentType<{ className?: string }>
  triggerImageSrc?: string | null
  triggerFallbackText?: string
  menuLabel?: ReactNode
  align?: 'start' | 'center' | 'end'
  contentClassName?: string
  buttonVariant?: 'outline' | 'ghost' | 'secondary' | 'default'
  buttonClassName?: string
  disabled?: boolean
}

export function DropdownSelect<T extends string | number = string>({
  options,
  value,
  onValueChange,
  triggerLabel,
  triggerBadge,
  triggerIcon: TriggerIcon,
  triggerImageSrc,
  triggerFallbackText,
  menuLabel,
  align = 'end',
  contentClassName = 'w-64',
  buttonVariant = 'outline',
  buttonClassName,
  disabled = false
}: DropdownSelectProps<T>): ReactElement {
  const selectedOption = options.find((opt) => opt.value === value)
  const hasTriggerBadge = Boolean(triggerBadge ?? selectedOption?.badge)
  const resolvedTriggerImage = triggerImageSrc !== undefined ? triggerImageSrc : selectedOption?.imageSrc
  const resolvedTriggerFallback =
    triggerFallbackText ?? selectedOption?.fallbackText ?? (typeof selectedOption?.title === 'string' ? selectedOption.title : undefined)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={buttonVariant}
          disabled={disabled}
          className={cn('cursor-pointer gap-2 font-semibold transition-all', buttonClassName)}
        >
          {resolvedTriggerImage !== undefined || resolvedTriggerFallback !== undefined ? (
            <div className="border-border/50 flex aspect-square size-5 shrink-0 items-center justify-center overflow-hidden rounded border">
              <ImageViewer
                src={resolvedTriggerImage}
                alt={resolvedTriggerFallback || 'Selected'}
                fallbackText={resolvedTriggerFallback}
                disabled
                objectFit="contain"
                className="size-full text-[9px]"
              />
            </div>
          ) : (
            TriggerIcon && <TriggerIcon className="size-4 shrink-0" />
          )}

          {triggerBadge ? (
            <Badge variant="default" className="font-bold">
              {triggerBadge}
            </Badge>
          ) : selectedOption?.badge ? (
            <Badge variant="default" className="font-bold">
              {selectedOption.badge}
            </Badge>
          ) : null}

          {triggerLabel !== undefined ? (
            triggerLabel ? (
              <span>{triggerLabel}</span>
            ) : null
          ) : !hasTriggerBadge ? (
            <span>{selectedOption?.title ?? 'Select option'}</span>
          ) : null}

          <ChevronsUpDown className="text-muted-foreground ml-auto size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className={contentClassName}>
        {menuLabel && (
          <>
            <DropdownMenuLabel className="text-muted-foreground text-xs tracking-wider uppercase">{menuLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        {options.map((option) => {
          const isSelected = option.value === value
          const Icon = option.icon
          const hasImageOrFallback = option.imageSrc !== undefined || option.fallbackText !== undefined

          return (
            <DropdownMenuItem
              key={String(option.value)}
              disabled={option.disabled}
              onClick={() => onValueChange(option.value)}
              className={cn('cursor-pointer gap-2.5 p-2 transition-colors', isSelected ? 'bg-primary/10 text-primary font-bold' : '')}
            >
              {hasImageOrFallback ? (
                <div className="border-border/50 flex aspect-square size-6.5 shrink-0 items-center justify-center overflow-hidden rounded-md border">
                  <ImageViewer
                    src={option.imageSrc}
                    alt={typeof option.title === 'string' ? option.title : String(option.value)}
                    fallbackText={option.fallbackText || (typeof option.title === 'string' ? option.title : undefined)}
                    disabled
                    objectFit="contain"
                    className="size-full text-[10px]"
                  />
                </div>
              ) : (
                Icon && (
                  <div
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-md border',
                      isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="size-3.5" />
                  </div>
                )
              )}

              <div className="flex min-w-0 flex-1 flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-semibold">{option.title}</span>
                  {option.badge && (
                    <Badge variant="outline" className="px-1 text-[10px]">
                      {option.badge}
                    </Badge>
                  )}
                </div>
                {option.subtitle && <span className="text-muted-foreground truncate text-[11px] font-normal">{option.subtitle}</span>}
              </div>

              {isSelected && <Check className="text-primary ml-auto size-4 shrink-0" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
