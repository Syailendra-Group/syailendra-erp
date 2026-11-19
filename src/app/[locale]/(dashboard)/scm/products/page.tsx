import { getTranslations } from 'next-intl/server'

import { ProductsFeature } from '@/features/scm/products'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'scm.products' })

  return {
    title: t('title'),
    description: t('subtitle')
  }
}

export default function ProductsPage(): ReactElement {
  return <ProductsFeature />
}
