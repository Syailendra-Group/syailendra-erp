import { getSession } from '@/lib/auth/session'
import { respondWithMedia } from '@/lib/storage/media-response'
import { MediaService } from '@/services/odoo/scm/media.service'

import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const session = await getSession()
  if (!session) return new Response('Unauthorized', { status: 401, headers: { 'Cache-Control': 'no-store' } })
  const { id: rawId } = await context.params
  const id = Number(rawId)
  if (!Number.isSafeInteger(id) || id < 1) return new Response('Invalid media id', { status: 400 })
  const media = await MediaService.getStreamableMedia(id, session.companyId)
  if (!media || media.kind !== 'document') {
    return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } })
  }
  return respondWithMedia(media, {
    range: request.headers.get('range'),
    attachment: true,
    companyId: session.companyId
  })
}
