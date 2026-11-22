'use client'

import { WifiOff } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { useOnlineStatus } from '@/hooks/use-online-status'

export function MitraConnectivityBanner() {
  const t = useTranslations('mitra.shell')
  const { isOnline } = useOnlineStatus()

  if (isOnline) {
    return null
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-destructive/20 bg-destructive/10 text-destructive flex items-center gap-2 border-b px-4 py-2 text-[11px] font-medium"
    >
      <WifiOff className="size-3.5 shrink-0" />
      {t('status.offline')}
    </div>
  )
}
