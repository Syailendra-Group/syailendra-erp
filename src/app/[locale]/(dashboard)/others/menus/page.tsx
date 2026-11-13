import { MenuAllocationFeature } from '@/features/others/menus'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Pillar & Menu Allocation',
  description: 'Exclusive business pillar assignment across Syailendra Group holding entities'
}

export default function MenuAllocationPage(): ReactElement {
  return <MenuAllocationFeature />
}
