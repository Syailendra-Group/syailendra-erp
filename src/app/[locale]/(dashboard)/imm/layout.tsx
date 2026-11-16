import { PillarIntlProvider } from '@/providers/pillar-intl-provider'

import type { ReactElement, ReactNode } from 'react'

export default function ImmLayout({ children }: { children: ReactNode }): ReactElement {
  return <PillarIntlProvider keys={['common', 'imm']}>{children}</PillarIntlProvider>
}
