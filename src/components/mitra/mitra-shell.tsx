'use client'

import { useEffect } from 'react'

import { registerMitraSW } from '@/lib/mitra/sw-register'

import { MitraSyncBar } from './action-bar'
import { MitraBottomNav } from './bottom-nav'
import { MitraConnectivityBanner } from './connectivity-banner'
import { MitraHeader } from './header'

import type { ReactNode } from 'react'

type MitraShellTab = 'home' | 'submissions' | 'profile'

interface MitraShellProps {
  name: string
  role: string
  activeTab?: MitraShellTab
  onTabChange?: (tab: MitraShellTab) => void
  children: ReactNode
}

export function MitraShell({ name, role, activeTab = 'submissions', onTabChange, children }: MitraShellProps) {
  useEffect(() => {
    void registerMitraSW()
    // Expose /manifest.json to the browser so the PWA is installable until the
    // root layout statically references it (layout edit is outside owned paths).
    if (typeof document !== 'undefined' && !document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement('link')
      link.rel = 'manifest'
      link.href = '/manifest.json'
      document.head.appendChild(link)
    }
  }, [])

  return (
    <div className="flex h-dvh flex-col">
      <MitraConnectivityBanner />
      <MitraHeader name={name} role={role} />
      <main className="flex-1 overflow-y-auto p-4">{children}</main>
      <MitraSyncBar />
      <MitraBottomNav activeTab={activeTab} onTabChange={onTabChange ?? (() => undefined)} />
    </div>
  )
}
