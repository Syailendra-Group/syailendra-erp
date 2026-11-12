import { CompanyFeature } from '@/features/sbi/others/company'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Company Profile • Syailendra Administration',
  description: 'Manage holding corporate details and public metadata'
}

export default function CompanyPage(): ReactElement {
  return <CompanyFeature />
}
