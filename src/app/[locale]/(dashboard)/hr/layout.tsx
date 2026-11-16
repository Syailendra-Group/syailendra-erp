import { PillarIntlProvider } from '@/providers/pillar-intl-provider'

import type { ReactElement, ReactNode } from 'react'

export default function HrLayout({ children }: { children: ReactNode }): ReactElement {
  return <PillarIntlProvider keys={['common', 'hris', 'admin']}>{children}</PillarIntlProvider>
}
