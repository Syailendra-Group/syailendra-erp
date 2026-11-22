/**
 * proxy.ts — next-intl route negotiation, security headers & verified session guard
 * Syailendra Group ERP (Next.js 16 Convention)
 *
 * Two mutually exclusive audiences:
 * - staff   → cookie syailendra_session,        guards the dashboard (/scm, /ftm, ...)
 * - partner → cookie syailendra_partner_session, guards the public portal (/mitra)
 * A staff token never grants access to /mitra, and a partner token is never read
 * on dashboard paths, so it cannot grant access there either.
 */

import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'
import { PARTNER_COOKIE_NAME, verifyPartnerToken } from './lib/auth/partner-token'
import { SESSION_COOKIE_NAME, verifySessionToken } from './lib/auth/token'

const intlMiddleware = createMiddleware(routing)

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return res
}

/** Field capture needs GPS and camera on the partner portal only. */
function applyPartnerPermissions(res: NextResponse): NextResponse {
  res.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(self)')
  return res
}

function clearSessionCookie(res: NextResponse): NextResponse {
  res.cookies.set(SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax' })
  return res
}

function clearPartnerCookie(res: NextResponse): NextResponse {
  res.cookies.set(PARTNER_COOKIE_NAME, '', { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax' })
  return res
}

/** Drop the locale prefix so route checks are exact, never substring matches. */
function stripLocale(pathname: string): string {
  if (pathname === '/en' || pathname === '/id') return '/'
  if (pathname.startsWith('/en/') || pathname.startsWith('/id/')) return pathname.slice(3)
  return pathname
}

function localePrefix(pathname: string): string {
  return pathname === '/en' || pathname.startsWith('/en/') ? '/en' : ''
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  const route = stripLocale(pathname)
  const prefix = localePrefix(pathname)

  // Execute next-intl middleware for locale resolution
  const response = intlMiddleware(request)

  // ------------------------------------------------------------------
  // Partner audience (/mitra) — evaluated first and returned early so the
  // staff branch below can never authenticate a partner request.
  // ------------------------------------------------------------------
  const isPartnerArea = route === '/mitra' || route.startsWith('/mitra/')
  if (isPartnerArea) {
    const partnerToken = request.cookies.get(PARTNER_COOKIE_NAME)?.value
    const partnerSecret = process.env.PARTNER_SESSION_SECRET
    const isPartnerAuthenticated = Boolean(partnerToken && partnerSecret && (await verifyPartnerToken(partnerToken, partnerSecret)))
    const isPartnerLogin = route === '/mitra/login'

    if (isPartnerLogin && isPartnerAuthenticated) {
      return applySecurityHeaders(NextResponse.redirect(new URL(`${prefix}/mitra`, request.url)))
    }

    if (!isPartnerLogin && !isPartnerAuthenticated) {
      const loginUrl = new URL(`${prefix}/mitra/login`, request.url)
      const redirectResponse = applySecurityHeaders(NextResponse.redirect(loginUrl))
      return partnerToken ? clearPartnerCookie(redirectResponse) : redirectResponse
    }

    return applyPartnerPermissions(applySecurityHeaders(response))
  }

  // ------------------------------------------------------------------
  // Staff audience — the partner cookie is deliberately never read here.
  // ------------------------------------------------------------------
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const sessionSecret = process.env.SESSION_SECRET
  const isAuthenticated = Boolean(sessionToken && sessionSecret && (await verifySessionToken(sessionToken, sessionSecret)))

  const isLoginPage = route === '/login'
  const isPublicRoute = isLoginPage || route === '/trace' || route.startsWith('/trace/') || route === '/api' || route.startsWith('/api/')

  // Unauthenticated (or tampered/expired token) access to protected routes → /login
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL(`${prefix}/login`, request.url)
    const redirectResponse = applySecurityHeaders(NextResponse.redirect(loginUrl))
    return sessionToken ? clearSessionCookie(redirectResponse) : redirectResponse
  }

  // Authenticated users no longer need the login page
  if (isAuthenticated && isLoginPage) {
    const rawDefault = request.cookies.get('syailendra_default_route')?.value
    const defaultRoute = rawDefault ? decodeURIComponent(rawDefault) : '/ftm'
    return applySecurityHeaders(NextResponse.redirect(new URL(`${prefix}${defaultRoute}`, request.url)))
  }

  return applySecurityHeaders(response)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
