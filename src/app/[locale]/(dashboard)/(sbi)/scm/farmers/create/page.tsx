import { FarmerForm } from '@/features/sbi/scm/farmers'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Register Farmer • Syailendra Traceability',
  description: 'Register a new smallholder farmer and plantation into the SCM network'
}

export default function CreateFarmerPage(): ReactElement {
  return <FarmerForm />
}
