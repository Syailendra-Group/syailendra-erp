/**
 * middleware.ts — next-intl route negotiation & session guard
 * Syailendra Group ERP
 */

import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // 1. Run next-intl middleware for locale negotiation
  const response = intlMiddleware(request);

  // 2. Session cookie validation for protected routes
  const sessionCookie = request.cookies.get("syailendra_session")?.value;
  const isLoginPage = pathname === "/login" || pathname === "/en/login";
  const isPublicRoute =
    isLoginPage ||
    pathname.startsWith("/trace") ||
    pathname.startsWith("/en/trace") ||
    pathname === "/" ||
    pathname === "/en";

  // If user is trying to access dashboard without session, redirect to /login
  if (!sessionCookie && !isPublicRoute) {
    const loginUrl = new URL(pathname.startsWith("/en") ? "/en/login" : "/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If user is already authenticated and visits /login, redirect to /inventory
  if (sessionCookie && isLoginPage) {
    const dashboardUrl = new URL(
      pathname.startsWith("/en") ? "/en/inventory" : "/inventory",
      request.url
    );
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
