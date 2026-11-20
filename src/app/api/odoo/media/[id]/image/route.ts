import { getSession } from '@/lib/auth/session'
import { MediaService } from '@/services/odoo/scm/media.service'

import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const session = await getSession()
  if (!session) return new Response('Unauthorized', { status: 401, headers: { 'Cache-Control': 'no-store' } })
  const { id: rawId } = await context.params
  const id = Number(rawId)
  if (!Number.isSafeInteger(id) || id < 1) return new Response('Invalid media id', { status: 400 })
  const media = await MediaService.getMediaImageData(id, session.companyId)
  if (!media || !ALLOWED_IMAGE_TYPES.has(media.mimetype)) return new Response('Not found', { status: 404 })
  const bytes = Buffer.from(media.image, 'base64')
  return new Response(bytes, {
    status: 200,
    headers: {
      'Content-Type': media.mimetype,
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff'
    }
  })
}
