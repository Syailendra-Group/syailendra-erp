/**
 * page.tsx — Edit Product Page
 * Syailendra Group ERP — SCM Pillar
 */

import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { ProductForm } from '@/features/scm/products/form'
import { fetchProductById } from '@/services/odoo/scm/product.service'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

interface EditProductPageProps {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'scm.products' })

  return {
    title: t('dialog.editTitle'),
    description: t('dialog.editDesc')
  }
}

export default async function EditProductPage({ params }: EditProductPageProps): Promise<ReactElement> {
  const { id } = await params
  const product = await fetchProductById(Number(id))

  if (!product) {
    notFound()
  }

  return <ProductForm initialData={product} />
}
