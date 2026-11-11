'use client'

import { useCallback, useEffect, useRef } from 'react'
import Script from 'next/script'
import { useTheme } from 'next-themes'

import type { ReactElement } from 'react'

type TurnstileWidgetId = string

interface TurnstileRenderOptions {
  sitekey: string
  action?: string
  theme?: 'light' | 'dark' | 'auto'
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => TurnstileWidgetId
  reset: (widgetId: TurnstileWidgetId) => void
  remove: (widgetId: TurnstileWidgetId) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

export interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  action?: string
  resetTrigger?: number
}

const DEFAULT_TEST_SITE_KEY = '1x00000000000000000000AA'

export function TurnstileWidget({ onVerify, onExpire, action = 'login', resetTrigger = 0 }: TurnstileWidgetProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<TurnstileWidgetId | null>(null)
  const onVerifyRef = useRef(onVerify)
  const onExpireRef = useRef(onExpire)
  const { resolvedTheme } = useTheme()

  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || DEFAULT_TEST_SITE_KEY

  useEffect(() => {
    onVerifyRef.current = onVerify
    onExpireRef.current = onExpire
  }, [onVerify, onExpire])

  const renderWidget = useCallback(() => {
    if (!window.turnstile || !containerRef.current || widgetIdRef.current !== null) return

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey,
      action,
      theme: resolvedTheme === 'dark' ? 'dark' : 'light',
      callback: (token: string) => onVerifyRef.current(token),
      'expired-callback': () => onExpireRef.current?.(),
      'error-callback': () => onExpireRef.current?.()
    })
  }, [action, resolvedTheme, sitekey])

  useEffect(() => {
    renderWidget()

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [renderWidget])

  useEffect(() => {
    if (resetTrigger > 0 && widgetIdRef.current !== null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
    }
  }, [resetTrigger])

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={renderWidget} />
      <div className="flex min-h-[66px] w-full items-center justify-center">
        <div ref={containerRef} />
      </div>
    </>
  )
}
