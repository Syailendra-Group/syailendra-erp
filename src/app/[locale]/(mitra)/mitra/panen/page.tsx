import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'

import { MitraShell } from '@/components/mitra/mitra-shell'
import { redirect } from '@/i18n/navigation'
import { getPartnerSession } from '@/lib/auth/partner-session'

/**
 * (mitra)/mitra/panen/page.tsx — Harvest submissions list (W2 shell).
 * Creation lives at /mitra/panen/baru.
 */
export default async function FarmerHarvestListPage() {
  const session = await getPartnerSession()
  const locale = await getLocale()

  if (!session) {
    redirect({ href: '/mitra/login', locale })
    return
  }

  const t = await getTranslations('mitra.farmer')

  return (
    <MitraShell name={session.partnerName ?? '-'} role={session.role ?? '-'} activeTab="submissions">
      <div className="space-y-4 p-4">
        <h1 className="text-base font-semibold">{t('harvest.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('list.subtitle')}</p>
        <p className="text-muted-foreground text-sm">{t('list.empty')}</p>
        <Link
          href="/mitra/panen/baru"
          className="border-input bg-background hover:bg-muted inline-flex items-center justify-center gap-2 rounded-md border px-4 py-3 text-base font-medium shadow-sm"
        >
          {t('list.create')}
        </Link>
      </div>
    </MitraShell>
  )
}
