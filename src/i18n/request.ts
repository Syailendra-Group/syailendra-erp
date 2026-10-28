/**
 * request.ts — Server-side request configuration & modular message loader
 */

import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import enAdmin from '@/messages/en/admin.json'
import enAuth from '@/messages/en/auth.json'
import enCommon from '@/messages/en/common.json'
import enInventory from '@/messages/en/inventory.json'
import enNav from '@/messages/en/nav.json'
import idAdmin from '@/messages/id/admin.json'
import idAuth from '@/messages/id/auth.json'
// Import modular json files statically to ensure bundle portability
import idCommon from '@/messages/id/common.json'
import idInventory from '@/messages/id/inventory.json'
import idNav from '@/messages/id/nav.json'

import { routing } from './routing'

const messagesMap = {
  id: {
    common: idCommon,
    auth: idAuth,
    nav: idNav,
    inventory: idInventory,
    admin: idAdmin
  },
  en: {
    common: enCommon,
    auth: enAuth,
    nav: enNav,
    inventory: enInventory,
    admin: enAdmin
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: messagesMap[locale as 'id' | 'en']
  }
})
