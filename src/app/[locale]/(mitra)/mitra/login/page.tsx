/**
 * (mitra)/mitra/login/page.tsx — Partner login page (server component)
 * Syailendra Group ERP
 */

import { getLocale, getTranslations } from 'next-intl/server'

import { PartnerLoginForm } from '@/features/mitra/login/form'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'mitra.login' })
  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function LoginPage(): Promise<ReactElement> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'mitra.login' })

  return (
    <main className="mx-auto w-full max-w-md px-4 pt-8 pb-16">
      <h2 className="text-lg font-semibold">{t('title')}</h2>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">{t('description')}</p>
      <PartnerLoginForm />
    </main>
  )
}
