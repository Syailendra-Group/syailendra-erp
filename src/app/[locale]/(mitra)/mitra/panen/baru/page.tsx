import { getLocale } from 'next-intl/server'

import { FarmerHarvestForm } from '@/features/mitra/harvest'
import { redirect } from '@/i18n/navigation'
import { getPartnerSession } from '@/lib/auth/partner-session'

/**
 * (mitra)/mitra/panen/baru/page.tsx — Create a harvest submission
 * (Catat Panen). Server-side partner guard, then the dedicated form.
 */
export default async function FarmerHarvestCreatePage() {
  const session = await getPartnerSession()
  const locale = await getLocale()

  if (!session) {
    redirect({ href: '/mitra/login', locale })
    return
  }

  return <FarmerHarvestForm partnerName={session.partnerName ?? '-'} role={session.role ?? '-'} />
}
