import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { ProductDetail } from '@/features/scm/products/detail'
import { fetchProductById } from '@/services/odoo/scm/product.service'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

interface ProductDetailPageProps {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'scm.products' })
  return { title: t('detail.title'), description: t('detail.description') }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps): Promise<ReactElement> {
  const { id } = await params
  const productId = Number(id)
  if (!Number.isSafeInteger(productId) || productId < 1) notFound()
  const product = await fetchProductById(productId)
  if (!product) notFound()
  return <ProductDetail product={product} />
}
