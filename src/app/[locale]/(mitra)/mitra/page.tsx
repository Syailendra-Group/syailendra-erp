/**
 * (mitra)/mitra/page.tsx — Partner portal landing (server guard)
 * Syailendra Group ERP
 *
 * Server-side guard: no session goes to the login screen; a pending PIN
 * change goes to the change-PIN screen. The rich mobile shell lands in the
 * shell workstream; this stub proves the route, the guard and the dictionary
 * wiring.
 */

import { getLocale, getTranslations } from 'next-intl/server'

import { redirect } from '@/i18n/navigation'
import { getPartnerSession } from '@/lib/auth/partner-session'

export default async function MitraLandingPage() {
  const session = await getPartnerSession()
  const locale = await getLocale()

  if (!session) {
    redirect({ href: '/mitra/login', locale })
    return
  }
  if (session.mustChangePin) {
    redirect({ href: '/mitra/ganti-pin', locale })
    return
  }

  const t = await getTranslations('mitra.landing')

  return (
    <main className="mx-auto w-full max-w-md px-4 pt-8 pb-16">
      <h1 className="text-xl font-semibold">{t('welcome', { name: session.partnerName })}</h1>
      <p className="text-muted-foreground mt-2 text-sm">{t('role', { role: session.role })}</p>
    </main>
  )
}
