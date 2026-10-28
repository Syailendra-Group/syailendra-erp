import { LoginPage } from '@/features/auth/login'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In • ERP Syailendra Group',
  description: 'Sign in to Syailendra Group Enterprise Portal'
}

export default function Page(): React.ReactElement {
  return <LoginPage />
}
