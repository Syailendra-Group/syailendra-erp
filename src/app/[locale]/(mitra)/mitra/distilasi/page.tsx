import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import { redirect } from '@/i18n/navigation'
import { getPartnerSession } from '@/lib/auth/partner-session'

export default async function DistillationListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'mitra.distiller' })
  const session = await getPartnerSession()
  if (!session) {
    redirect({ href: '/mitra/login', locale })
    return
  }
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl font-semibold">{t('nav.distillation')}</h1>
      <p className="text-muted-foreground">{t('list.emptyTitle')}</p>
      <p className="text-muted-foreground text-sm">{t('list.emptyDesc')}</p>
      <Link href={`/${locale}/mitra/distilasi/baru`} className="button">
        {t('button.submit')}
      </Link>
    </div>
  )
}
