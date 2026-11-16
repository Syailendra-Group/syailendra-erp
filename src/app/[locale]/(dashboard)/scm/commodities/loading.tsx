import { TablePageSkeleton } from '@/components/shared/table-page-skeleton'

import type { ReactElement } from 'react'

export default function Loading(): ReactElement {
  return <TablePageSkeleton columnCount={7} />
}
