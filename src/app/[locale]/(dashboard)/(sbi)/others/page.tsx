import { OthersOverview } from '@/features/sbi/others/overview'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'System Overview • Syailendra ERP',
  description: 'System governance, regional master data, and security controls'
}

export default function OthersPage(): ReactElement {
  return <OthersOverview />
}
