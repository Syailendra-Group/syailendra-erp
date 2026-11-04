import { DepartmentsFeature } from '@/features/hris/departments'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Departments & Divisions • Syailendra Administration',
  description: 'Manage corporate departments and divisional structure'
}

export default function DepartmentsPage(): ReactElement {
  return <DepartmentsFeature />
}
