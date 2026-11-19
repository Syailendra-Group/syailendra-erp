/**
 * page.tsx — Create Product Page
 * Syailendra Group ERP — SCM Pillar
 */

import { getTranslations } from 'next-intl/server'

import { ProductForm } from '@/features/scm/products/form'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'scm.products' })

  return {
    title: t('dialog.addTitle'),
    description: t('dialog.addDesc')
  }
}

export default function CreateProductPage(): ReactElement {
  return <ProductForm />
}
