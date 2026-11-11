/**
 * middleware.ts — next-intl route negotiation, security headers & session guard
 * Syailendra Group ERP
 */

import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  return res
}

export default function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  // Execute next-intl middleware for locale resolution
  const response = intlMiddleware(request)

  // Validate session authentication token for protected routes
  const sessionCookie = request.cookies.get('syailendra_session')?.value
  const isLoginPage = pathname === '/login' || pathname === '/en/login'
  const isPublicRoute = isLoginPage || pathname.includes('/trace') || pathname === '/' || pathname === '/en' || pathname === '/id'

  // If user is trying to access dashboard without session, redirect to /login
  if (!sessionCookie && !isPublicRoute) {
    const loginUrl = new URL(pathname.startsWith('/en') ? '/en/login' : '/login', request.url)
    return applySecurityHeaders(NextResponse.redirect(loginUrl))
  }

  // If user is already authenticated and visits /login, redirect to /overview
  if (sessionCookie && isLoginPage) {
    const dashboardUrl = new URL(pathname.startsWith('/en') ? '/en/overview' : '/overview', request.url)
    return applySecurityHeaders(NextResponse.redirect(dashboardUrl))
  }

  return applySecurityHeaders(response)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
