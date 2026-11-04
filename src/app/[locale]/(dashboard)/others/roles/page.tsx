import { RolesFeature } from '@/features/others/roles'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'RBAC Access Roles • Syailendra Administration',
  description: 'Manage system security groups and permissions'
}

export default function RolesPage(): ReactElement {
  return <RolesFeature />
}
