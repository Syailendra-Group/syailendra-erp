import { ProvinceForm } from '@/features/others/provinces'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'New Province • Syailendra ERP',
  description: 'Register a new province or state'
}

export default function CreateProvincePage(): ReactElement {
  return <ProvinceForm />
}
