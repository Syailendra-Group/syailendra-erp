import { PublicTraceView } from '@/features/traceability/public-trace'
import { odoo } from '@/lib/odoo'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

interface Props {
  params: Promise<{
    locale: string
    lot_code: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lot_code } = await params
  return {
    title: `Batch ${lot_code} • DDistillers Traceability`,
    description: `Verified origin, distillation method, and laboratory GC-MS analysis for batch ${lot_code}`
  }
}

export default async function PublicTracePage({ params }: Props): Promise<ReactElement> {
  const { lot_code } = await params
  const data = await odoo.traceability.getPublicTrace(lot_code)

  return <PublicTraceView data={data} lotCode={lot_code} />
}
