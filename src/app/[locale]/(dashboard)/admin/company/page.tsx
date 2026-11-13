import { CompanyFeature } from '@/features/others/company'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Company Profile',
  description: 'Manage holding corporate details and public metadata'
}

export default function CompanyPage(): ReactElement {
  return <CompanyFeature />
}
