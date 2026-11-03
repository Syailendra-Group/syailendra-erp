'use client'

import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import type { MapPickerProps } from '@/types/components/map'
import type { ReactElement } from 'react'

const MapPickerInner = dynamic(() => import('./map-picker-inner'), {
  ssr: false,
  loading: () => (
    <div className="border-border/80 bg-muted/30 relative flex min-h-[280px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border">
      <Skeleton className="absolute inset-0 h-full w-full" />
      <div className="text-muted-foreground relative z-10 flex flex-col items-center gap-2">
        <MapPin className="text-primary size-6 animate-bounce" />
        <span className="text-xs font-medium">Memuat Peta Interaktif...</span>
      </div>
    </div>
  )
})

export function MapPicker(props: MapPickerProps): ReactElement {
  return (
    <div className={cn('w-full', props.className)}>
      <MapPickerInner {...props} />
    </div>
  )
}
