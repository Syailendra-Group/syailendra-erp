/**
 * navigation.ts — Locale-aware navigation APIs from next-intl
 * Syailendra Group ERP
 */

import { createNavigation } from 'next-intl/navigation'

import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
