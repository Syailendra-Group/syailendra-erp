import { PillarIntlProvider } from '@/providers/pillar-intl-provider'

import type { ReactElement, ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }): ReactElement {
  return <PillarIntlProvider keys={['common', 'admin', 'hris', 'others', 'regional']}>{children}</PillarIntlProvider>
}
