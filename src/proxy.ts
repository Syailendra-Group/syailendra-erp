/**
 * proxy.ts — next-intl route negotiation, security headers & verified session guard
 * Syailendra Group ERP (Next.js 16 Convention)
 */

import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'
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

function clearSessionCookie(res: NextResponse): NextResponse {
  res.cookies.set(SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax' })
  return res
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  // Execute next-intl middleware for locale resolution
  const response = intlMiddleware(request)

  // Verify the signed session token — cookie presence alone is not authentication
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const sessionSecret = process.env.SESSION_SECRET
  const isAuthenticated = Boolean(sessionToken && sessionSecret && (await verifySessionToken(sessionToken, sessionSecret)))

  const isLoginPage = pathname === '/login' || pathname === '/en/login' || pathname === '/id/login'
  const isPublicRoute =
    isLoginPage ||
    pathname.includes('/trace') ||
    pathname === '/' ||
    pathname === '/en' ||
    pathname === '/id' ||
    pathname === '/api' ||
    pathname.startsWith('/api/')

  // Unauthenticated (or tampered/expired token) access to protected routes → /login
  if (!isAuthenticated && !isPublicRoute) {
    const isEn = pathname.startsWith('/en')
    const loginUrl = new URL(isEn ? '/en/login' : '/login', request.url)
    const redirectResponse = applySecurityHeaders(NextResponse.redirect(loginUrl))
    return sessionToken ? clearSessionCookie(redirectResponse) : redirectResponse
  }

  // Authenticated users no longer need the login page
  if (isAuthenticated && isLoginPage) {
    const isEn = pathname.startsWith('/en')
    const rawDefault = request.cookies.get('syailendra_default_route')?.value
    const defaultRoute = rawDefault ? decodeURIComponent(rawDefault) : '/ftm'
    const targetPath = isEn ? `/en${defaultRoute}` : defaultRoute
    return applySecurityHeaders(NextResponse.redirect(new URL(targetPath, request.url)))
  }

  return applySecurityHeaders(response)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
