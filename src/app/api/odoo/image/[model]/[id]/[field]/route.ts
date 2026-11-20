/**
 * GET /api/odoo/image/[model]/[id]/[field]?size=256
 *
 * Streams an Odoo binary/Image field as real image bytes instead of shipping a base64
 * payload inside every JSON-RPC response. Branding fields (company / site logos) are public
 * so the login screen can render them; operational media requires an authenticated session.
 */

import { getSession } from '@/lib/auth/session'

import type { NextRequest } from 'next/server'

type RouteContext = { params: Promise<{ model: string; id: string; field: string }> }

/** Only these model/field pairs may be proxied -- prevents arbitrary record scraping. */
const PUBLIC_FIELDS: Record<string, string[]> = {
  'res.company': ['logo_web', 'image_128', 'image_256'],
  'syailendra.site.config': ['logo_light', 'logo_dark', 'logo_monogram']
}

const PROTECTED_FIELDS: Record<string, string[]> = {
  'syailendra.farm': ['photo_farm'],
  'syailendra.distillery': ['photo_distillery'],
  'res.partner': ['image_128', 'image_1920'],
  'product.template': ['image_128', 'image_1920'],
  'syailendra.media': ['image']
}

const ALLOWED_SIZES = new Set(['128', '256', '512', '1024', '1920'])

const SESSION_TTL_MS = 20 * 60 * 1000
let cachedSession: { cookie: string; expiresAt: number } | null = null

function resolveOdooConfig(): { baseUrl: string; db: string; username: string; password: string } | null {
  const baseUrl = process.env.ODOO_BASE_URL?.trim().replace(/\/+$/, '')
  const db = process.env.ODOO_DB?.trim()
  const username = process.env.ODOO_USERNAME?.trim()
  const password = (process.env.ODOO_API_KEY || process.env.ODOO_PASSWORD || '').trim()

  if (!baseUrl || !db || !username || !password) return null
  return { baseUrl, db, username, password }
}

async function resolveSessionCookie(config: { baseUrl: string; db: string; username: string; password: string }): Promise<string | null> {
  if (cachedSession && cachedSession.expiresAt > Date.now()) return cachedSession.cookie

  const response = await fetch(`${config.baseUrl}/web/session/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: { db: config.db, login: config.username, password: config.password },
      id: 1
    }),
    cache: 'no-store'
  })

  if (!response.ok) return null

  const setCookie = response.headers.getSetCookie?.() ?? []
  const raw = setCookie.find((value) => value.startsWith('session_id='))
  if (!raw) return null

  const cookie = raw.split(';')[0]
  cachedSession = { cookie, expiresAt: Date.now() + SESSION_TTL_MS }
  return cookie
}

export async function GET(request: NextRequest, context: RouteContext): Promise<Response> {
  const { model, id, field } = await context.params

  const publicFields = PUBLIC_FIELDS[model] ?? []
  const protectedFields = PROTECTED_FIELDS[model] ?? []
  const isPublic = publicFields.includes(field)
  const isProtected = protectedFields.includes(field)

  if (!isPublic && !isProtected) {
    return new Response('Field not allowed', { status: 404 })
  }

  if (isProtected) {
    const session = await getSession()
    if (!session) return new Response('Unauthorized', { status: 401 })
  }

  const recordId = Number(id)
  if (!Number.isInteger(recordId) || recordId <= 0) {
    return new Response('Invalid record id', { status: 400 })
  }

  const requestedSize = request.nextUrl.searchParams.get('size') ?? ''
  const size = ALLOWED_SIZES.has(requestedSize) ? requestedSize : '256'

  const config = resolveOdooConfig()
  if (!config) return new Response('Storage backend not configured', { status: 503 })

  let cookie: string | null = null
  try {
    cookie = await resolveSessionCookie(config)
  } catch {
    cookie = null
  }
  if (!cookie) return new Response('Upstream authentication failed', { status: 502 })

  const imageUrl = `${config.baseUrl}/web/image/${model}/${recordId}/${field}?size=${size}`
  let upstream: Response
  try {
    upstream = await fetch(imageUrl, {
      headers: { Cookie: cookie },
      cache: 'no-store',
      redirect: 'follow'
    })
  } catch {
    return new Response('Upstream unreachable', { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    return new Response('Image not found', { status: upstream.status === 404 ? 404 : 502 })
  }

  const contentType = upstream.headers.get('content-type') || 'image/png'
  if (!contentType.startsWith('image/')) {
    return new Response('Not an image', { status: 415 })
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': isProtected ? 'private, no-store, max-age=0' : 'public, max-age=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff'
    }
  })
}
