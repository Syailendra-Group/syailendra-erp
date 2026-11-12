import { FarmersFeature } from '@/features/sbi/scm/farmers'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Farmers & Plantations',
  description: 'Official smallholder farmers and supply chain plantations register'
}

export default function FarmersPage(): ReactElement {
  return <FarmersFeature />
}
