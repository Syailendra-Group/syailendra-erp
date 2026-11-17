/**
 * ssr-config.ts — Dynamic SSR & Next.js App Router Segment Configurations
 * Syailendra Group ERP
 */

export const DYNAMIC_SSR_CONFIG = {
  dynamic: 'force-dynamic',
  revalidate: 0,
  fetchCache: 'force-no-store'
} as const

export const CACHE_TAGS = {
  farmers: 'farmers-tag',
  distilleries: 'distilleries-tag',
  regional: 'regional-tag',
  settings: 'settings-tag'
} as const
