/**
 * page.tsx — Create Material Page
 * Syailendra Group ERP — SCM Pillar
 */

import { MaterialForm } from '@/features/scm/materials/form'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Register Material • Syailendra SCM',
  description: 'Register a new botanical commodity or packaging material into the master catalog'
}

export default function CreateMaterialPage(): ReactElement {
  return <MaterialForm />
}
