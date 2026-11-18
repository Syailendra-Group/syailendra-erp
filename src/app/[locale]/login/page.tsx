import { getTranslations } from 'next-intl/server'

import { LoginPage } from '@/features/auth/login'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth' })

  return {
    title: {
      absolute: t('productName') + ' | ' + t('subtitle')
    },
    description: t('descriptor') + ' — ' + t('digitalBackbone')
  }
}

export default function Page(): ReactElement {
  return <LoginPage />
}
