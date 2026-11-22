import { createReadStream } from 'node:fs'
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

import { isSafeStorageKey } from './media-policy'

/**
 * Server-only S3 client for the self-hosted Supabase Storage endpoint.
 *
 * Credentials never leave the server: no `NEXT_PUBLIC_*` variable carries them and the
 * browser only ever talks to our own route handlers. Values are read lazily so a missing
 * configuration surfaces as a typed error instead of a crash at import time.
 */

const REQUIRED_ENV = [
  'SUPABASE_STORAGE_URL',
  'SUPABASE_STORAGE_BUCKET',
  'SUPABASE_STORAGE_ACCESS_KEY_ID',
  'SUPABASE_STORAGE_SECRET_ACCESS_KEY',
  'SUPABASE_STORAGE_REGION'
] as const

export class StorageNotConfiguredError extends Error {
  constructor() {
    super('STORAGE_NOT_CONFIGURED')
    this.name = 'StorageNotConfiguredError'
  }
}

interface StorageRuntime {
  client: S3Client
  bucket: string
}

let runtime: StorageRuntime | null = null

function readEnv(): Record<(typeof REQUIRED_ENV)[number], string> {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name])
  if (missing.length > 0) throw new StorageNotConfiguredError()
  return {
    SUPABASE_STORAGE_URL: process.env.SUPABASE_STORAGE_URL as string,
    SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET as string,
    SUPABASE_STORAGE_ACCESS_KEY_ID: process.env.SUPABASE_STORAGE_ACCESS_KEY_ID as string,
    SUPABASE_STORAGE_SECRET_ACCESS_KEY: process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY as string,
    SUPABASE_STORAGE_REGION: process.env.SUPABASE_STORAGE_REGION as string
  }
}

export function isStorageConfigured(): boolean {
  return REQUIRED_ENV.every((name) => Boolean(process.env[name]))
}

function getRuntime(): StorageRuntime {
  if (runtime) return runtime
  const env = readEnv()
  const endpoint = env.SUPABASE_STORAGE_URL.replace(/\/+$/, '')
  runtime = {
    bucket: env.SUPABASE_STORAGE_BUCKET,
    client: new S3Client({
      endpoint: endpoint.endsWith('/storage/v1/s3') ? endpoint : `${endpoint}/storage/v1/s3`,
      region: env.SUPABASE_STORAGE_REGION,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.SUPABASE_STORAGE_ACCESS_KEY_ID,
        secretAccessKey: env.SUPABASE_STORAGE_SECRET_ACCESS_KEY
      }
    })
  }
  return runtime
}

function assertKey(key: string): string {
  if (!isSafeStorageKey(key)) throw new Error('MEDIA_KEY_INVALID')
  return key
}

function mapStorageError(error: unknown): Error {
  const name = error instanceof Error ? error.name : ''
  if (name === 'NoSuchKey' || name === 'NotFound') return new Error('MEDIA_OBJECT_NOT_FOUND')
  if (name === 'EntityTooLarge') return new Error('MEDIA_FILE_TOO_LARGE')
  if (name === 'AccessDenied') return new Error('MEDIA_STORAGE_DENIED')
  return error instanceof Error ? error : new Error('MEDIA_STORAGE_FAILED')
}

export interface StoredObject {
  key: string
  size: number
  contentType: string
  etag: string | null
}

/**
 * Upload one object from a file already written to disk. A single PUT with an explicit
 * `ContentLength` is enough here: the storage service caps objects at 50 MB, well below
 * the size where multipart becomes necessary (and streaming bodies of unknown length are
 * the documented lib-storage failure mode).
 */
export async function putFile(key: string, filePath: string, contentType: string, size: number): Promise<StoredObject> {
  const { client, bucket } = getRuntime()
  try {
    const result = await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: assertKey(key),
        Body: createReadStream(filePath),
        ContentLength: size,
        ContentType: contentType,
        CacheControl: 'private, max-age=0, no-store'
      })
    )
    return { key, size, contentType, etag: result.ETag ?? null }
  } catch (error) {
    throw mapStorageError(error)
  }
}

export async function headObject(key: string): Promise<StoredObject | null> {
  const { client, bucket } = getRuntime()
  try {
    const result = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: assertKey(key) }))
    return {
      key,
      size: result.ContentLength ?? 0,
      contentType: result.ContentType ?? 'application/octet-stream',
      etag: result.ETag ?? null
    }
  } catch (error) {
    const mapped = mapStorageError(error)
    if (mapped.message === 'MEDIA_OBJECT_NOT_FOUND') return null
    throw mapped
  }
}

export interface ObjectStream {
  body: ReadableStream<Uint8Array>
  contentLength: number | null
  contentRange: string | null
  contentType: string | null
  etag: string | null
}

/** Stream an object, optionally as a byte range so a video player can seek. */
export async function getObjectStream(key: string, range?: string | null): Promise<ObjectStream | null> {
  const { client, bucket } = getRuntime()
  try {
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: assertKey(key), Range: range ?? undefined }))
    if (!result.Body) return null
    return {
      body: result.Body.transformToWebStream() as ReadableStream<Uint8Array>,
      contentLength: result.ContentLength ?? null,
      contentRange: result.ContentRange ?? null,
      contentType: result.ContentType ?? null,
      etag: result.ETag ?? null
    }
  } catch (error) {
    const mapped = mapStorageError(error)
    if (mapped.message === 'MEDIA_OBJECT_NOT_FOUND') return null
    throw mapped
  }
}

export async function deleteObject(key: string): Promise<void> {
  const { client, bucket } = getRuntime()
  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: assertKey(key) }))
  } catch (error) {
    throw mapStorageError(error)
  }
}
