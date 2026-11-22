import { createHash, randomUUID } from 'node:crypto'
import { createWriteStream, promises as fsp } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import Busboy from 'busboy'

import { getSession } from '@/lib/auth/session'
import {
  buildStorageKey,
  detectMimetype,
  isMediaEntity,
  isMediaRole,
  KIND_LIMITS,
  KIND_QUOTAS,
  kindForMimetype,
  STORAGE_HARD_LIMIT
} from '@/lib/storage/media-policy'
import { deleteObject, putFile, StorageNotConfiguredError } from '@/lib/storage/supabase-storage'
import { MediaService } from '@/services/odoo/scm/media.service'

import type { NextRequest } from 'next/server'
import type { ReadableStream as NodeWebReadableStream } from 'node:stream/web'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Multipart envelope overhead allowance on top of the largest accepted object. */
const MAX_REQUEST_BYTES = STORAGE_HARD_LIMIT + 256 * 1024
const HEAD_BYTES = 32

class UploadError extends Error {
  readonly status: number

  constructor(code: string, status: number) {
    super(code)
    this.name = 'UploadError'
    this.status = status
  }
}

interface MultipartUpload {
  fields: Record<string, string>
  tempPath: string
  size: number
  checksum: string
  head: Buffer
}

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

/**
 * Parse the multipart body without buffering the file in memory: bytes are hashed as they
 * arrive and written straight to a scratch file, which is then uploaded as a stream.
 */
function parseMultipart(request: NextRequest): Promise<MultipartUpload> {
  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.includes('multipart/form-data')) {
    return Promise.reject(new UploadError('MEDIA_CONTENT_TYPE_INVALID', 415))
  }
  if (!request.body) return Promise.reject(new UploadError('MEDIA_FILE_REQUIRED', 400))

  return new Promise<MultipartUpload>((resolve, reject) => {
    const fields: Record<string, string> = {}
    const tempPath = path.join(tmpdir(), `sg13-upload-${randomUUID()}`)
    const hash = createHash('sha256')
    let head = Buffer.alloc(0)
    let size = 0
    let settled = false
    let fileCount = 0

    const fail = (error: Error): void => {
      if (settled) return
      settled = true
      void fsp.rm(tempPath, { force: true })
      reject(error)
    }

    let busboy: Busboy.Busboy
    try {
      busboy = Busboy({
        headers: Object.fromEntries(new Headers({ 'content-type': contentType })),
        limits: { files: 1, fields: 8, fileSize: STORAGE_HARD_LIMIT, fieldSize: 2048 }
      })
    } catch {
      fail(new UploadError('MEDIA_CONTENT_TYPE_INVALID', 415))
      return
    }

    busboy.on('field', (name: string, value: string) => {
      fields[name] = value
    })

    busboy.on('file', (_name: string, stream: Readable) => {
      fileCount += 1
      if (fileCount > 1) {
        stream.resume()
        fail(new UploadError('MEDIA_FILE_INVALID', 400))
        return
      }
      if (!fields.model) {
        stream.resume()
        fail(new UploadError('MEDIA_FIELDS_ORDER', 400))
        return
      }

      const target = createWriteStream(tempPath)
      stream.on('data', (chunk: Buffer) => {
        size += chunk.length
        hash.update(chunk)
        if (head.length < HEAD_BYTES) head = Buffer.concat([head, chunk.subarray(0, HEAD_BYTES - head.length)])
      })
      stream.on('limit', () => {
        target.destroy()
        fail(new UploadError('MEDIA_FILE_TOO_LARGE', 413))
      })
      stream.on('error', () => fail(new UploadError('MEDIA_UPLOAD_ABORTED', 400)))
      target.on('error', () => fail(new UploadError('MEDIA_UPLOAD_FAILED', 500)))
      target.on('close', () => {
        if (settled) return
        if (size === 0) {
          void fsp.rm(tempPath, { force: true })
          fail(new UploadError('MEDIA_FILE_REQUIRED', 400))
          return
        }
        settled = true
        resolve({ fields, tempPath, size, checksum: hash.digest('hex'), head })
      })
      stream.pipe(target)
    })

    busboy.on('error', () => fail(new UploadError('MEDIA_UPLOAD_FAILED', 400)))
    busboy.on('close', () => {
      if (!settled && fileCount === 0) fail(new UploadError('MEDIA_FILE_REQUIRED', 400))
    })

    const source = Readable.fromWeb(request.body as unknown as NodeWebReadableStream<Uint8Array>)
    source.on('error', () => fail(new UploadError('MEDIA_UPLOAD_ABORTED', 400)))
    source.pipe(busboy)
  })
}

export async function POST(request: NextRequest): Promise<Response> {
  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (declaredLength > MAX_REQUEST_BYTES) return jsonError('MEDIA_FILE_TOO_LARGE', 413)

  try {
    assertSameOrigin(request)
    const session = await getSession()
    if (!session) return jsonError('UNAUTHORIZED', 401)

    const upload = await parseMultipart(request)
    try {
      const model = upload.fields.model ?? ''
      const role = upload.fields.role ?? 'gallery'
      const caption = (upload.fields.caption ?? '').slice(0, 255)
      const altText = (upload.fields.altText ?? caption).slice(0, 255)
      const id = Number(upload.fields.id)

      if (!isMediaEntity(model) || !Number.isSafeInteger(id) || id < 1) {
        return jsonError('MEDIA_ENTITY_INVALID', 400)
      }
      if (!isMediaRole(role)) return jsonError('MEDIA_ROLE_INVALID', 400)

      const mimetype = detectMimetype(upload.head)
      const kind = mimetype ? kindForMimetype(mimetype) : null
      if (!mimetype || !kind) return jsonError('MEDIA_TYPE_INVALID', 415)
      if (upload.size > KIND_LIMITS[kind]) {
        return jsonError(kind === 'video' ? 'MEDIA_VIDEO_TOO_LARGE' : `MEDIA_${kind.toUpperCase()}_TOO_LARGE`, 413)
      }

      await MediaService.assertEntity(model, id, session.companyId)
      const usage = await MediaService.countMedia(model, id, kind)
      if (usage >= KIND_QUOTAS[kind]) return jsonError('MEDIA_LIMIT_REACHED', 409)

      const fileName = (upload.fields.name || 'berkas').slice(0, 255)

      // Bridge: an addon older than 18.0.1.6.0 has no storage columns, so images and
      // documents keep going to the Odoo filestore exactly as before. Video has no legacy
      // home and refuses with an explicit code instead of a cryptic ORM error.
      if (!(await MediaService.supportsObjectStorage())) {
        if (kind === 'video') return jsonError('MEDIA_SCHEMA_OUTDATED', 409)
        const bytes = await fsp.readFile(upload.tempPath)
        const mediaId = await MediaService.createLegacyMedia({
          resModel: model,
          resId: id,
          kind,
          role,
          name: fileName,
          mimetype,
          bytes,
          caption
        })
        return Response.json({ success: true, id: mediaId, checksum: upload.checksum }, { headers: { 'Cache-Control': 'no-store' } })
      }

      const storageKey = buildStorageKey(model, id, mimetype)
      await putFile(storageKey, upload.tempPath, mimetype, upload.size)

      try {
        const mediaId = await MediaService.createObjectMedia({
          resModel: model,
          resId: id,
          kind,
          role,
          name: fileName,
          mimetype,
          size: upload.size,
          checksum: upload.checksum,
          storageKey,
          caption,
          altText
        })
        return Response.json({ success: true, id: mediaId, checksum: upload.checksum }, { headers: { 'Cache-Control': 'no-store' } })
      } catch (error) {
        await deleteObject(storageKey).catch(() => undefined)
        throw error
      }
    } finally {
      await fsp.rm(upload.tempPath, { force: true })
    }
  } catch (error) {
    if (error instanceof UploadError) return jsonError(error.message, error.status)
    if (error instanceof StorageNotConfiguredError) return jsonError('STORAGE_NOT_CONFIGURED', 503)
    console.error('Media upload failed:', error)
    return jsonError(error instanceof Error ? error.message : 'MEDIA_UPLOAD_FAILED', 500)
  }
}
