import { PillarIntlProvider } from '@/providers/pillar-intl-provider'

import type { ReactElement, ReactNode } from 'react'

export default function PublicLayout({ children }: { children: ReactNode }): ReactElement {
  return <PillarIntlProvider keys={['common', 'scm']}>{children}</PillarIntlProvider>
}
