import * as React from 'react'

import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps): React.ReactElement {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
