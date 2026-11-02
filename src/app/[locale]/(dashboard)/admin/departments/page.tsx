import { getDepartmentsAction } from '@/actions/hris/department.action'
import { DepartmentsFeature } from '@/features/admin/departments'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Departments & Divisions • Syailendra Administration',
  description: 'Manage corporate departments and divisional structure'
}

export default async function DepartmentsPage(): Promise<ReactElement> {
  const { departments } = await getDepartmentsAction()
  return <DepartmentsFeature initialData={departments} />
}
