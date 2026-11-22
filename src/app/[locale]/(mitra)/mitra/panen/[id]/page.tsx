import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'

import { MitraShell } from '@/components/mitra/mitra-shell'
import { DetailRow } from '@/components/shared/detail-row'
import { redirect } from '@/i18n/navigation'
import { getPartnerSession } from '@/lib/auth/partner-session'

/**
 * (mitra)/mitra/panen/[id]/page.tsx — Harvest submission detail (W2 shell).
 * Read-only shell; full payload/review data is surfaced in the staff review UI.
 */
export default async function FarmerHarvestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getPartnerSession()
  const locale = await getLocale()

  if (!session) {
    redirect({ href: '/mitra/login', locale })
    return
  }

  const { id } = await params
  const t = await getTranslations('mitra.farmer')

  return (
    <MitraShell name={session.partnerName ?? '-'} role={session.role ?? '-'} activeTab="submissions">
      <div className="space-y-4 p-4">
        <h1 className="text-base font-semibold">{t('detail.title')}</h1>
        <DetailRow label={t('detail.reference')} value={id} mono />
        <DetailRow label={t('detail.kind')} value={t('detail.kinds.harvest')} />
        <DetailRow label={t('detail.partner')} value={session.partnerName ?? '-'} />
        <Link
          href="/mitra/panen"
          className="border-input bg-background hover:bg-muted inline-flex items-center justify-center gap-2 rounded-md border px-4 py-3 text-base font-medium shadow-sm"
        >
          {t('common.back')}
        </Link>
      </div>
    </MitraShell>
  )
}
