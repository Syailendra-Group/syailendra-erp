/**
 * routing.ts — Centralized routing definition for next-intl
 * Default: id (Bahasa Indonesia) with as-needed prefix
 */

import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['id', 'en'],
  defaultLocale: 'id',
  localePrefix: 'as-needed'
})

export type Locale = (typeof routing.locales)[number]
