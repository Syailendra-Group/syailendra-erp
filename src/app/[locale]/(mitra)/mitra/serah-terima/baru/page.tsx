import { getLocale } from 'next-intl/server'

import { FarmerHandoverForm } from '@/features/mitra/handover'
import { redirect } from '@/i18n/navigation'
import { getPartnerSession } from '@/lib/auth/partner-session'

/**
 * (mitra)/mitra/serah-terima/baru/page.tsx — Create a handover submission
 * (Serah Terima ke Penyuling). Server-side partner guard, then the dedicated form.
 */
export default async function FarmerHandoverCreatePage() {
  const session = await getPartnerSession()
  const locale = await getLocale()

  if (!session) {
    redirect({ href: '/mitra/login', locale })
    return
  }

  return <FarmerHandoverForm partnerName={session.partnerName ?? '-'} role={session.role ?? '-'} />
}
