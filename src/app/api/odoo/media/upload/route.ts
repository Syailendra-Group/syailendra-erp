import { getSession } from '@/lib/auth/session'
import { odoo } from '@/lib/odoo'
import { MediaService } from '@/services/odoo/scm/media.service'

import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024
const MAX_REQUEST_BYTES = MAX_DOCUMENT_BYTES + 128 * 1024
const ALLOWED_MODELS = new Set(['res.partner', 'syailendra.farm', 'syailendra.distillery', 'product.template'])
const ALLOWED_ROLES = new Set(['profile', 'gallery', 'facility', 'product', 'certificate', 'legal', 'other'])

function jsonError(message: string, status: number): Response {
  return Response.json({ success: false, error: message }, { status, headers: { 'Cache-Control': 'no-store' } })
}

function detectMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png'
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP')
    return 'image/webp'
  const prefix = new TextDecoder()
    .decode(bytes.slice(0, 1024))
    .replace(/^\uFEFF/, '')
    .trimStart()
  return prefix.startsWith('%PDF-') ? 'application/pdf' : null
}

export async function POST(request: NextRequest): Promise<Response> {
  const origin = request.headers.get('origin')
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const host = forwardedHost || request.headers.get('host')
  let originHost: string | null = null
  try {
    originHost = origin ? new URL(origin).host : null
  } catch {
    return jsonError('ORIGIN_INVALID', 403)
  }
  if (!originHost || originHost !== host) return jsonError('ORIGIN_INVALID', 403)
  if (Number(request.headers.get('content-length') || 0) > MAX_REQUEST_BYTES) return jsonError('UPLOAD_TOO_LARGE', 413)

  const session = await getSession()
  if (!session) return jsonError('UNAUTHORIZED', 401)

  try {
    const form = await request.formData()
    const model = String(form.get('model') || '')
    const id = Number(form.get('id'))
    const role = String(form.get('role') || 'gallery')
    const caption = String(form.get('caption') || '').slice(0, 255)
    const file = form.get('file')

    if (!ALLOWED_MODELS.has(model) || !Number.isSafeInteger(id) || id < 1) return jsonError('MEDIA_ENTITY_INVALID', 400)
    if (!ALLOWED_ROLES.has(role)) return jsonError('MEDIA_ROLE_INVALID', 400)
    if (!(file instanceof File) || file.size === 0) return jsonError('MEDIA_FILE_REQUIRED', 400)

    const target = await odoo.client.searchRead<{ id: number; company_id: [number, string] | false }>(
      model,
      [['id', '=', id]],
      ['id', 'company_id'],
      {
        limit: 1,
        context: { active_test: false }
      }
    )
    if (!target[0]) return jsonError('MEDIA_ENTITY_NOT_FOUND', 404)
    const company = Array.isArray(target[0].company_id) ? target[0].company_id[0] : null
    if (company !== null && company !== session.companyId) return jsonError('MEDIA_FORBIDDEN', 403)

    const bytes = new Uint8Array(await file.arrayBuffer())
    const mimetype = detectMime(bytes)
    if (!mimetype || !(mimetype.startsWith('image/') || mimetype === 'application/pdf')) return jsonError('MEDIA_TYPE_INVALID', 415)
    const kind = mimetype === 'application/pdf' ? 'document' : 'image'
    const maxBytes = kind === 'image' ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES
    if (bytes.byteLength > maxBytes) return jsonError(kind === 'image' ? 'MEDIA_IMAGE_TOO_LARGE' : 'MEDIA_DOCUMENT_TOO_LARGE', 413)

    const mediaId = await MediaService.createMedia(model, id, kind, role, file, caption)
    return Response.json({ success: true, id: mediaId }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Media upload failed:', error)
    return jsonError(error instanceof Error ? error.message : 'MEDIA_UPLOAD_FAILED', 500)
  }
}
