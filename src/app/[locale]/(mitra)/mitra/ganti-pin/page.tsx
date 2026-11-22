/**
 * (mitra)/mitra/ganti-pin/page.tsx — Forced PIN change page (server component)
 * Syailendra Group ERP
 */

import { getLocale, getTranslations } from 'next-intl/server'

import { PartnerChangePinForm } from '@/features/mitra/pin/form'
import { redirect } from '@/i18n/navigation'
import { getPartnerSession } from '@/lib/auth/partner-session'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'mitra.pin' })
  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function ChangePinPage(): Promise<ReactElement> {
  const session = await getPartnerSession()
  const locale = await getLocale()

  if (!session) {
    return redirect({ href: '/mitra/login', locale })
  }
  if (!session.mustChangePin) {
    return redirect({ href: '/mitra', locale })
  }

  const t = await getTranslations({ locale, namespace: 'mitra.pin' })

  return (
    <main className="mx-auto w-full max-w-md px-4 pt-8 pb-16">
      <h2 className="text-lg font-semibold">{t('title')}</h2>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">{t('description')}</p>
      <PartnerChangePinForm />
    </main>
  )
}
