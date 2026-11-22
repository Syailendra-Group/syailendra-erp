'use client'

import { toast } from 'sonner'

/**
 * sw-register.ts — Service worker registration with update toast for the Mitra portal.
 * Syailendra Group ERP
 */

export function registerMitraSW(): void {
  if (typeof window === 'undefined') {
    return
  }
  if (!('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((registration) => {
      registration.onupdatefound = () => {
        const installing = registration.installing
        if (!installing) {
          return
        }
        installing.onstatechange = () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            toast('Versi baru Portal Mitra tersedia', {
              action: {
                label: 'Muat Ulang',
                onClick: () => {
                  window.location.reload()
                }
              }
            })
          }
        }
      }
    })
    .catch((error) => {
      console.warn('[mitra-sw] Pendaftaran service worker gagal:', error)
    })
}

export function mitraswReady(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(null)
  }
  return navigator.serviceWorker.ready.then(
    (registration) => registration,
    () => null
  )
}
