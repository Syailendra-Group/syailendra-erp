'use client'

import { useCallback, useEffect, useState } from 'react'

import { registerMitraSW } from '@/lib/mitra/sw-register'

/**
 * use-online-status.ts — Tracks navigator.onLine and service worker readiness.
 * Syailendra Group ERP
 */

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)

  const handleOnline = useCallback(() => setIsOnline(true), [])
  const handleOffline = useCallback(() => setIsOnline(false), [])

  useEffect(() => {
    registerMitraSW()

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(setSwRegistration, () => setSwRegistration(null))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  return { isOnline, swReady: swRegistration }
}
