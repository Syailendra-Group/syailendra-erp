'use client'

import { ImageViewer } from '@/components/image/image-viewer'
import { LongText } from '@/components/text/long-text'
import { cn } from '@/lib/utils'

import type { EntityIdentityCellProps } from '@/types/components/media'
import type { ReactElement } from 'react'

export function EntityIdentityCell({ name, secondary, imageUrl, className }: EntityIdentityCellProps): ReactElement {
  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border shadow-xs">
        <ImageViewer src={imageUrl} alt={name} fallbackText={name} disabled objectFit="cover" className="size-full text-[10px]" />
      </div>
      <div className="min-w-0 flex-1">
        <LongText className="truncate text-xs font-semibold">{name}</LongText>
        {secondary ? <p className="text-muted-foreground truncate text-[10px]">{secondary}</p> : null}
      </div>
    </div>
  )
}
