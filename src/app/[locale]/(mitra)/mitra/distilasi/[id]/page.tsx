import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import { DetailRow } from '@/components/shared/detail-row'
import { redirect } from '@/i18n/navigation'
import { getPartnerSession } from '@/lib/auth/partner-session'

export default async function DistillationDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const t = await getTranslations({ locale, namespace: 'mitra.distiller' })
  const session = await getPartnerSession()
  if (!session) {
    redirect({ href: '/mitra/login', locale })
    return
  }
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:p-6 lg:p-8">
      <Link href={`/${locale}/mitra/distilasi`} className="text-muted-foreground text-sm">
        ← {t('nav.list')}
      </Link>
      <h1 className="text-xl font-semibold">{t('detail.title')}</h1>
      <DetailRow label={t('field.reference')} value={id} />
      <DetailRow label={t('field.kind')} value={t('nav.distillation')} />
      <DetailRow label={t('field.state')} value="Draft" />
      <DetailRow label={t('field.createdAt')} value="—" />
    </div>
  )
}
