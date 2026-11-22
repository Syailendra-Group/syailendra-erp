import { MediaService } from '@/services/odoo/scm/media.service'

import { getObjectStream } from './supabase-storage'

import type { StreamableMedia } from '@/services/odoo/scm/media.service'

const LEGACY_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function safeFilename(name: string): string {
  return name.replace(/["\\\r\n]/g, '_')
}

function baseHeaders(contentType: string): Headers {
  return new Headers({
    'Content-Type': contentType,
    'Cache-Control': 'private, no-store, max-age=0',
    'X-Content-Type-Options': 'nosniff'
  })
}

/**
 * Serve one media row. Object-backed rows are streamed from the storage service (with byte
 * ranges for video); rows created before the storage tier are still served from the Odoo
 * filestore so nothing published earlier breaks.
 */
export async function respondWithMedia(
  media: StreamableMedia,
  options: { range?: string | null; attachment?: boolean; companyId?: number } = {}
): Promise<Response> {
  if (media.storageKey) {
    const object = await getObjectStream(media.storageKey, options.range ?? null)
    if (!object) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } })
    const headers = baseHeaders(object.contentType ?? media.mimetype)
    headers.set('Accept-Ranges', 'bytes')
    if (object.contentLength !== null) headers.set('Content-Length', String(object.contentLength))
    if (object.contentRange) headers.set('Content-Range', object.contentRange)
    if (options.attachment) headers.set('Content-Disposition', `attachment; filename="${safeFilename(media.name)}"`)
    return new Response(object.body, { status: object.contentRange ? 206 : 200, headers })
  }

  if (media.kind === 'image') {
    const legacy = await MediaService.getMediaImageData(media.id, options.companyId)
    if (!legacy || !LEGACY_IMAGE_TYPES.has(legacy.mimetype)) {
      return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } })
    }
    const bytes = Buffer.from(legacy.image, 'base64')
    const headers = baseHeaders(legacy.mimetype)
    headers.set('Content-Length', String(bytes.byteLength))
    return new Response(bytes, { status: 200, headers })
  }

  if (media.kind === 'document') {
    const legacy = await MediaService.getDocumentData(media.id, options.companyId)
    if (!legacy) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } })
    const bytes = Buffer.from(legacy.document, 'base64')
    const headers = baseHeaders('application/pdf')
    headers.set('Content-Length', String(bytes.byteLength))
    if (options.attachment) headers.set('Content-Disposition', `attachment; filename="${safeFilename(legacy.name)}"`)
    return new Response(bytes, { status: 200, headers })
  }

  return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } })
}
