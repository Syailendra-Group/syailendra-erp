import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

import { pickMessages } from '@/utils/i18n'

import type { ReactElement, ReactNode } from 'react'

export interface PillarIntlProviderProps {
  keys: readonly string[]
  children: ReactNode
}

export async function PillarIntlProvider({ keys, children }: PillarIntlProviderProps): Promise<ReactElement> {
  const messages = await getMessages()
  return <NextIntlClientProvider messages={pickMessages(messages, keys)}>{children}</NextIntlClientProvider>
}
