import { VillageForm } from '@/features/others/villages'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'New Village • Syailendra ERP',
  description: 'Register a new village'
}

export default function CreateVillagePage(): ReactElement {
  return <VillageForm />
}
