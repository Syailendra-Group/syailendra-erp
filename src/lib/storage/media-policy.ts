import { randomUUID } from 'node:crypto'

/** Media kinds accepted by `syailendra.media` and the upload pipeline. */
export type MediaKind = 'image' | 'document' | 'video'

export const MEDIA_KINDS: readonly MediaKind[] = ['image', 'document', 'video']

export const MEDIA_ROLES = ['profile', 'gallery', 'facility', 'product', 'certificate', 'legal', 'other'] as const

export type MediaRole = (typeof MEDIA_ROLES)[number]

/** Entities the media layer may attach to. Anything else is rejected before I/O. */
export const MEDIA_ENTITIES = ['res.partner', 'syailendra.farm', 'syailendra.distillery', 'product.template'] as const

export type MediaEntity = (typeof MEDIA_ENTITIES)[number]

/** Hard cap enforced by the storage service (`FILE_SIZE_LIMIT`), not by our code. */
export const STORAGE_HARD_LIMIT = 50 * 1024 * 1024

export const KIND_LIMITS: Record<MediaKind, number> = {
  image: 5 * 1024 * 1024,
  document: 10 * 1024 * 1024,
  video: STORAGE_HARD_LIMIT
}

export const KIND_QUOTAS: Record<MediaKind, number> = {
  image: 12,
  document: 12,
  video: 6
}

export const KIND_MIMETYPES: Record<MediaKind, readonly string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp'],
  document: ['application/pdf'],
  video: ['video/mp4', 'video/webm']
}

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'video/mp4': 'mp4',
  'video/webm': 'webm'
}

export function extensionFor(mimetype: string): string | null {
  return EXTENSIONS[mimetype] ?? null
}

export function kindForMimetype(mimetype: string): MediaKind | null {
  for (const kind of MEDIA_KINDS) {
    if (KIND_MIMETYPES[kind].includes(mimetype)) return kind
  }
  return null
}

export function isMediaEntity(value: string): value is MediaEntity {
  return (MEDIA_ENTITIES as readonly string[]).includes(value)
}

export function isMediaRole(value: string): value is MediaRole {
  return (MEDIA_ROLES as readonly string[]).includes(value)
}

/**
 * Sniff the real content type from the leading bytes. Never trust the extension or the
 * browser-supplied Content-Type: both are attacker controlled.
 */
export function detectMimetype(head: Uint8Array): string | null {
  if (head.length >= 8 && head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) {
    return 'image/png'
  }
  if (head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) {
    return 'image/jpeg'
  }
  if (head.length >= 12 && String.fromCharCode(...head.subarray(0, 4)) === 'RIFF' && String.fromCharCode(...head.subarray(8, 12)) === 'WEBP') {
    return 'image/webp'
  }
  if (head.length >= 5 && String.fromCharCode(...head.subarray(0, 5)) === '%PDF-') {
    return 'application/pdf'
  }
  if (head.length >= 12 && String.fromCharCode(...head.subarray(4, 8)) === 'ftyp') {
    const brand = String.fromCharCode(...head.subarray(8, 12))
    if (['isom', 'iso2', 'mp41', 'mp42', 'avc1', 'M4V ', 'dash'].includes(brand)) return 'video/mp4'
    if (brand === 'qt  ') return 'video/quicktime'
    return 'video/mp4'
  }
  if (head.length >= 4 && head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3) {
    return 'video/webm'
  }
  return null
}

/**
 * Object keys are generated server-side only: `media/{model}/{id}/{uuid}.{ext}`.
 * The model is validated against a fixed allowlist, the id is an integer, and the
 * filename never comes from the client — that removes traversal from the key space.
 */
export function buildStorageKey(model: string, id: number, mimetype: string): string {
  const ext = extensionFor(mimetype)
  if (!isMediaEntity(model) || !Number.isSafeInteger(id) || id < 1 || !ext) {
    throw new Error('MEDIA_KEY_INVALID')
  }
  return `media/${model}/${id}/${randomUUID()}.${ext}`
}

/** Defensive check for keys read back from the database before they reach the client. */
export function isSafeStorageKey(key: string): boolean {
  return key.length <= 255 && /^media\/[A-Za-z0-9_@./-]+$/.test(key) && !key.includes('..')
}
