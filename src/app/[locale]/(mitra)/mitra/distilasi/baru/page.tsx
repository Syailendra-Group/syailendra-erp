import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import DistillationForm from '@/features/mitra/distillation'
import { redirect } from '@/i18n/navigation'
import { getPartnerSession } from '@/lib/auth/partner-session'

export default async function DistillationCreatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'mitra.distiller' })
  const session = await getPartnerSession()
  if (!session) {
    redirect({ href: '/mitra/login', locale })
    return
  }
  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 lg:p-8">
      <Link href={`/${locale}/mitra/distilasi`} className="text-muted-foreground text-sm">
        ← {t('nav.list')}
      </Link>
      <h1 className="text-xl font-semibold">{t('title.distillation')}</h1>
      <p className="text-muted-foreground text-sm">{t('subtitle.distillation')}</p>
      <DistillationForm accessId={session.accessId} />
    </div>
  )
}
