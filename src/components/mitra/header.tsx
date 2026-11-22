'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { useOutboxStore } from '@/stores/mitra-outbox-store'

interface MitraHeaderProps {
  name: string
  role: string
}

export function MitraHeader({ name, role }: MitraHeaderProps) {
  const t = useTranslations('mitra.shell')
  const pending = useOutboxStore((state) => state.items.length)

  return (
    <div className="border-border/60 bg-background flex flex-col gap-1 border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{name}</span>
        <span className="text-muted-foreground text-xs">{role}</span>
      </div>
      {pending > 0 ? (
        <Badge variant="secondary" className="shrink-0 text-xs">
          {t('status.pending', { count: pending })}
        </Badge>
      ) : null}
    </div>
  )
}
