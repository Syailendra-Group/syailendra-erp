import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

/**
 * (mitra)/offline/page.tsx — Offline fallback page for the Mitra portal.
 * Syailendra Group ERP
 */

export default async function MitraOfflinePage() {
  const t = await getTranslations('mitra.shell')

  return (
    <main className="flex h-dvh flex-col items-center justify-center px-4 text-center">
      <h1 className="text-lg font-semibold">{t('offline.title')}</h1>
      <p className="text-muted-foreground mt-2 text-sm">{t('offline.desc')}</p>
      <Link href="/mitra" className="mt-6 text-sm underline underline-offset-4">
        {t('actions.back')}
      </Link>
    </main>
  )
}
