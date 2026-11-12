import { MaterialsFeature } from '@/features/sbi/scm/materials'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Material Master • Syailendra SCM',
  description: 'Official raw materials, essential oils, botanical specs & export quality catalog'
}

export default function MaterialsPage(): ReactElement {
  return <MaterialsFeature />
}
