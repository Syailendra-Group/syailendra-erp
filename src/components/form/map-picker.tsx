'use client'

import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import type { MapPickerProps } from '@/types/components/map'
import type { ReactElement } from 'react'

function MapPickerLoading(): ReactElement {
  const tMap = useTranslations('common.map')

  return (
    <div className="border-border/80 bg-muted/30 relative flex min-h-70 w-full flex-col items-center justify-center overflow-hidden rounded-lg border">
      <Skeleton className="absolute inset-0 h-full w-full" />
      <div className="text-muted-foreground relative z-10 flex flex-col items-center gap-2">
        <MapPin className="text-primary size-6 animate-bounce" />
        <span className="text-xs font-medium">{tMap('loading')}</span>
      </div>
    </div>
  )
}

const MapPickerInner = dynamic(() => import('./map-picker-inner'), {
  ssr: false,
  loading: () => <MapPickerLoading />
})

export function MapPicker(props: MapPickerProps): ReactElement {
  return (
    <div className={cn('w-full', props.className)}>
      <MapPickerInner {...props} />
    </div>
  )
}
