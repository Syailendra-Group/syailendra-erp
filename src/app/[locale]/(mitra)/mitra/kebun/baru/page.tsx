import { getLocale } from 'next-intl/server'

import { FarmerProfileForm } from '@/features/mitra/farmer-profile'
import { redirect } from '@/i18n/navigation'
import { getPartnerSession } from '@/lib/auth/partner-session'

/**
 * (mitra)/mitra/kebun/baru/page.tsx — Create a farmer_profile submission
 * (Profil & Lahan Petani). Server-side partner guard, then the dedicated form.
 */
export default async function FarmerProfileCreatePage() {
  const session = await getPartnerSession()
  const locale = await getLocale()

  if (!session) {
    redirect({ href: '/mitra/login', locale })
    return
  }

  return <FarmerProfileForm partnerName={session.partnerName ?? '-'} role={session.role ?? '-'} />
}
