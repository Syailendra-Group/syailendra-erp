'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useOutboxStore } from '@/stores/mitra-outbox-store'

export function MitraSyncBar() {
  const t = useTranslations('mitra.shell')
  const { items, isSyncing, sync, error } = useOutboxStore()
  const pending = items.length

  return (
    <div className="border-border/60 bg-background/95 sticky bottom-14 z-20 w-full border-t px-4 py-2 backdrop-blur">
      {error ? <p className="text-destructive text-[11px] font-medium">{t('status.error', { message: error })}</p> : null}
      <Button onClick={sync} disabled={isSyncing || pending === 0} className="w-full text-sm">
        {isSyncing ? t('actions.syncing') : pending > 0 ? `${t('actions.sync')} (${pending})` : t('status.synced')}
      </Button>
    </div>
  )
}
