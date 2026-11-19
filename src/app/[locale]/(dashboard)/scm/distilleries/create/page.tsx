import { DistilleryForm } from '@/features/scm/distilleries/form'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Register Distillation Facility',
  description: 'Register a new distillation facility with technical specifications and capacity'
}

export default function DistilleryCreatePage(): ReactElement {
  return <DistilleryForm />
}
