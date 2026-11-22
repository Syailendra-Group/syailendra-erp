import { promises as fsp } from 'node:fs'

import { getSession } from '@/lib/auth/session'
import { ingestUploadedMedia, MAX_REQUEST_BYTES, parseMultipart, StorageNotConfiguredError, UploadError } from '@/lib/storage/media-ingest'

import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function jsonError(code: string, status: number): Response {
  return Response.json({ success: false, error: code }, { status, headers: { 'Cache-Control': 'no-store' } })
}

function assertSameOrigin(request: NextRequest): void {
  const origin = request.headers.get('origin')
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const host = forwardedHost || request.headers.get('host')
  let originHost: string | null = null
  try {
    originHost = origin ? new URL(origin).host : null
  } catch {
    throw new UploadError('ORIGIN_INVALID', 403)
  }
  if (!originHost || originHost !== host) throw new UploadError('ORIGIN_INVALID', 403)
}

export async function POST(request: NextRequest): Promise<Response> {
  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (declaredLength > MAX_REQUEST_BYTES) return jsonError('MEDIA_FILE_TOO_LARGE', 413)

  let tempPath: string | null = null
  try {
    assertSameOrigin(request)
    const session = await getSession()
    if (!session) return jsonError('UNAUTHORIZED', 401)

    const upload = await parseMultipart(request)
    tempPath = upload.tempPath
    const result = await ingestUploadedMedia({
      upload,
      model: upload.fields.model ?? '',
      id: Number(upload.fields.id),
      role: upload.fields.role ?? 'gallery',
      name: upload.fields.name ?? 'berkas',
      caption: upload.fields.caption,
      altText: upload.fields.altText,
      companyId: session.companyId
    })
    return Response.json({ success: true, id: result.id, checksum: upload.checksum }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof UploadError) return jsonError(error.message, error.status)
    if (error instanceof StorageNotConfiguredError) return jsonError('STORAGE_NOT_CONFIGURED', 503)
    console.error('Media upload failed:', error)
    return jsonError(error instanceof Error ? error.message : 'MEDIA_UPLOAD_FAILED', 500)
  } finally {
    if (tempPath) await fsp.rm(tempPath, { force: true })
  }
}
