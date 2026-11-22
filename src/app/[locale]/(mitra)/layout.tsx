/**
 * (mitra)/layout.tsx — Layout for the public partner portal route group
 * Syailendra Group ERP
 *
 * The partner portal owns its own mobile-first chrome, its own session cookie
 * and its own dictionary namespace; it shares nothing with the dashboard shell
 * or the staff session.
 */

import { PillarIntlProvider } from '@/providers/pillar-intl-provider'

import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Portal Mitra'
}

export const viewport: Viewport = {
  themeColor: '#004E52',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
}

export default function MitraLayout({ children }: { children: ReactNode }) {
  return (
    <PillarIntlProvider keys={['common', 'mitra']}>
      <div className="bg-background text-foreground min-h-dvh">{children}</div>
    </PillarIntlProvider>
  )
}
