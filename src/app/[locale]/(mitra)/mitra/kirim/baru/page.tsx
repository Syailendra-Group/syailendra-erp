import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import ShipmentForm from '@/features/mitra/shipment'
import { redirect } from '@/i18n/navigation'
import { getPartnerSession } from '@/lib/auth/partner-session'

export default async function ShipmentCreatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'mitra.distiller' })
  const session = await getPartnerSession()
  if (!session) {
    redirect({ href: '/mitra/login', locale })
    return
  }
  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 lg:p-8">
      <Link href={`/${locale}/mitra/kirim`} className="text-muted-foreground text-sm">
        ← {t('nav.list')}
      </Link>
      <h1 className="text-xl font-semibold">{t('title.shipment')}</h1>
      <p className="text-muted-foreground text-sm">{t('subtitle.shipment')}</p>
      <ShipmentForm accessId={session.accessId} />
    </div>
  )
}
