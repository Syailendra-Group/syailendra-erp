import { WebsiteFeature } from '@/features/others/website'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Website & Theme Configuration',
  description: 'Global application branding, login tagline, corporate logos, and dynamic theme color palette'
}

export default function WebsiteSettingsPage(): ReactElement {
  return <WebsiteFeature />
}
