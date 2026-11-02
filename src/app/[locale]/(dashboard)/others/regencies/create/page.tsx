import { RegencyForm } from '@/features/others/regencies'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'New Regency/City • Syailendra ERP',
  description: 'Register a new regency or city'
}

export default function CreateRegencyPage(): ReactElement {
  return <RegencyForm />
}
