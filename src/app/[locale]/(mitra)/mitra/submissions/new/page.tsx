import { getLocale } from 'next-intl/server'

import { SubmissionForm } from '@/features/mitra/submission-form'
import { redirect } from '@/i18n/navigation'
import { getPartnerSession } from '@/lib/auth/partner-session'

/**
 * (mitra)/mitra/submissions/new/page.tsx — Field submission page (server guard).
 * Syailendra Group ERP
 *
 * Guards the partner session server-side, then renders the offline-capable
 * submission shell. Online submissions POST to /api/mitra/submissions
 * (endpoint to be provided by the platform team); offline submissions land in
 * the IndexedDB outbox and sync automatically when the browser is back online.
 */

export default async function MitraSubmissionNewPage() {
  const session = await getPartnerSession()
  const locale = await getLocale()

  if (!session) {
    redirect({ href: '/mitra/login', locale })
    return
  }

  return <SubmissionForm partnerName={session.partnerName ?? '-'} role={session.role ?? '-'} />
}
