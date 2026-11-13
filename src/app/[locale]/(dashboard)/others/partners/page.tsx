import { PartnersFeature } from '@/features/others/partners'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Partners & Unified Contacts • Syailendra Administration',
  description: 'Central registry of farmers, suppliers, and B2B buyers'
}

export default function PartnersPage(): ReactElement {
  return <PartnersFeature />
}
