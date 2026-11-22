import { createHash, randomUUID } from 'node:crypto'
import { createWriteStream, promises as fsp } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import Busboy from 'busboy'

import { MediaService } from '@/services/odoo/scm/media.service'

import {
  buildStorageKey,
  detectMimetype,
  isMediaEntity,
  isMediaRole,
  KIND_LIMITS,
  KIND_QUOTAS,
  kindForMimetype,
  STORAGE_HARD_LIMIT
} from './media-policy'
import { deleteObject, putFile, StorageNotConfiguredError } from './supabase-storage'

import type { ReadableStream as NodeWebReadableStream } from 'node:stream/web'
import type { MediaKind } from './media-policy'

/** Multipart envelope overhead allowance on top of the largest accepted object. */
export const MAX_REQUEST_BYTES = STORAGE_HARD_LIMIT + 256 * 1024
const HEAD_BYTES = 32

export class UploadError extends Error {
  readonly status: number

  constructor(code: string, status: number) {
    super(code)
    this.name = 'UploadError'
    this.status = status
  }
}

export interface MultipartRequest {
  headers: Headers
  body: ReadableStream<Uint8Array> | null
}

export interface MultipartUpload {
  fields: Record<string, string>
  tempPath: string
  size: number
  checksum: string
  head: Buffer
}

/**
 * Parse a multipart body without buffering the file in memory: bytes are hashed as they
 * arrive and written straight to a scratch file that is later uploaded as a stream.
 *
 * The file part must come after the small metadata fields. A browser FormData keeps that
 * order; anything else is refused with MEDIA_FIELDS_ORDER rather than inferred.
 */
export function parseMultipart(request: MultipartRequest): Promise<MultipartUpload> {
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
      if (!fields.kind && !fields.model) {
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

export interface IngestInput {
  upload: MultipartUpload
  model: string
  id: number
  role: string
  name: string
  caption?: string
  altText?: string
  companyId?: number
  /** Portal callers may only send images, and the row owns no company of its own. */
  allowedKinds?: MediaKind[]
}

export interface IngestResult {
  id: number
  kind: MediaKind
  mimetype: string
  storageKey: string | null
}

/**
 * Shared ingest step for every upload surface (staff dashboard and partner portal):
 * validate → sniff → cap → quota → store bytes → create the Odoo row, with the object
 * removed again when the row cannot be created.
 */
export async function ingestUploadedMedia(input: IngestInput): Promise<IngestResult> {
  const { upload } = input
  if (!isMediaEntity(input.model) || !Number.isSafeInteger(input.id) || input.id < 1) {
    throw new UploadError('MEDIA_ENTITY_INVALID', 400)
  }
  if (!isMediaRole(input.role)) throw new UploadError('MEDIA_ROLE_INVALID', 400)

  const mimetype = detectMimetype(upload.head)
  const kind = mimetype ? kindForMimetype(mimetype) : null
  if (!mimetype || !kind) throw new UploadError('MEDIA_TYPE_INVALID', 415)
  if (input.allowedKinds && !input.allowedKinds.includes(kind)) {
    throw new UploadError('MEDIA_KIND_NOT_ALLOWED', 415)
  }
  if (upload.size > KIND_LIMITS[kind]) {
    throw new UploadError(kind === 'video' ? 'MEDIA_VIDEO_TOO_LARGE' : `MEDIA_${kind.toUpperCase()}_TOO_LARGE`, 413)
  }

  await MediaService.assertEntity(input.model, input.id, input.companyId)
  const usage = await MediaService.countMedia(input.model, input.id, kind)
  if (usage >= KIND_QUOTAS[kind]) throw new UploadError('MEDIA_LIMIT_REACHED', 409)

  const fileName = (input.name || 'berkas').slice(0, 255)
  const caption = (input.caption ?? '').slice(0, 255)
  const altText = (input.altText ?? caption).slice(0, 255)

  // Bridge: an addon older than 18.0.1.6.0 has no storage columns, so images and documents
  // keep going to the Odoo filestore. Video has no legacy home and refuses explicitly.
  if (!(await MediaService.supportsObjectStorage())) {
    if (kind === 'video') throw new UploadError('MEDIA_SCHEMA_OUTDATED', 409)
    const bytes = await fsp.readFile(upload.tempPath)
    const id = await MediaService.createLegacyMedia({
      resModel: input.model,
      resId: input.id,
      kind,
      role: input.role,
      name: fileName,
      mimetype,
      bytes,
      caption
    })
    return { id, kind, mimetype, storageKey: null }
  }

  const storageKey = buildStorageKey(input.model, input.id, mimetype)
  await putFile(storageKey, upload.tempPath, mimetype, upload.size)
  try {
    const id = await MediaService.createObjectMedia({
      resModel: input.model,
      resId: input.id,
      kind,
      role: input.role,
      name: fileName,
      mimetype,
      size: upload.size,
      checksum: upload.checksum,
      storageKey,
      caption,
      altText
    })
    return { id, kind, mimetype, storageKey }
  } catch (error) {
    await deleteObject(storageKey).catch(() => undefined)
    throw error
  }
}

export { StorageNotConfiguredError }
