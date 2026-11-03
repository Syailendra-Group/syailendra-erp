import { FarmersFeature } from '@/features/traceability/farmers'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Farmers & Plantations • Syailendra ERP',
  description: 'Official smallholder farmers and supply chain plantations register'
}

export default function FarmersPage(): ReactElement {
  return <FarmersFeature />
}
