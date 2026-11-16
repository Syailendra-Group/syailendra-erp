import { PillarIntlProvider } from '@/providers/pillar-intl-provider'

import type { ReactElement, ReactNode } from 'react'

export default function WmsLayout({ children }: { children: ReactNode }): ReactElement {
  return <PillarIntlProvider keys={['common', 'wms']}>{children}</PillarIntlProvider>
}
