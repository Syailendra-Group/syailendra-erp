/**
 * i18n.ts — Client message subset helpers
 * Syailendra Group ERP
 */

import type { AbstractIntlMessages } from 'next-intl'

export function pickMessages(messages: AbstractIntlMessages, keys: readonly string[]): AbstractIntlMessages {
  return Object.fromEntries(keys.filter((key) => key in messages).map((key) => [key, messages[key]]))
}
