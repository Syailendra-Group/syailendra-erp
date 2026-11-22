import { odoo } from '@/lib/odoo'
import { deleteObject } from '@/lib/storage/supabase-storage'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type { MediaKind, MediaRecord, OdooMediaRaw } from '@/types/components/media'

const MEDIA_FIELDS = [
  'id',
  'res_model',
  'res_id',
  'kind',
  'role',
  'name',
  'sequence',
  'mimetype',
  'file_size',
  'caption',
  'alt_text',
  'company_id',
  'storage_backend',
  'storage_key',
  'checksum',
  'duration'
]

const ALLOWED_MEDIA_MODELS = new Set(['res.partner', 'syailendra.farm', 'syailendra.distillery', 'product.template'])

/** Fields present before addon 18.0.1.6.0; the demo may run against that schema until D. */
const LEGACY_MEDIA_FIELDS = [
  'id',
  'res_model',
  'res_id',
  'kind',
  'role',
  'name',
  'sequence',
  'mimetype',
  'file_size',
  'caption',
  'alt_text',
  'company_id'
]

let objectTierAvailable: boolean | null = null

function isMissingFieldError(error: unknown): boolean {
  return error instanceof Error && /Invalid field/i.test(error.message)
}

/**
 * Read media rows, tolerating an addon that predates the object-storage columns. The first
 * failure is logged once; later calls skip the extended field list entirely.
 */
async function readMediaRows<T>(domain: OdooDomain, fields: string[], options: Record<string, unknown>): Promise<T[]> {
  if (objectTierAvailable === false) {
    return odoo.client.searchRead<T>('syailendra.media', domain, LEGACY_MEDIA_FIELDS, options)
  }
  try {
    const rows = await odoo.client.searchRead<T>('syailendra.media', domain, fields, options)
    objectTierAvailable = true
    return rows
  } catch (error) {
    if (!isMissingFieldError(error)) throw error
    objectTierAvailable = false
    console.warn('[media] syailendra_scm < 18.0.1.6.0: object-storage columns absent, using legacy field set')
    return odoo.client.searchRead<T>('syailendra.media', domain, LEGACY_MEDIA_FIELDS, options)
  }
}

export interface ObjectMediaInput {
  resModel: string
  resId: number
  kind: MediaKind
  role: string
  name: string
  mimetype: string
  size: number
  checksum: string
  storageKey: string
  caption?: string
  altText?: string
  duration?: number
}

export interface StreamableMedia {
  id: number
  kind: MediaKind
  mimetype: string
  name: string
  fileSize: number
  storageKey: string | null
}

function mediaUrl(row: OdooMediaRaw): string {
  if (row.kind === 'video') return `/api/odoo/media/${row.id}/video`
  if (row.kind === 'document') return `/api/odoo/media/${row.id}/document`
  return `/api/odoo/media/${row.id}/image`
}

function mapMedia(row: OdooMediaRaw): MediaRecord {
  return {
    id: row.id,
    resModel: row.res_model,
    resId: row.res_id,
    kind: row.kind,
    role: row.role,
    name: row.name || '',
    sequence: row.sequence,
    mimetype: row.mimetype || '',
    fileSize: row.file_size || 0,
    caption: row.caption || '',
    altText: row.alt_text || '',
    companyId: Array.isArray(row.company_id) ? row.company_id[0] : null,
    storageBackend: row.storage_backend || 'odoo',
    checksum: row.checksum || '',
    duration: row.duration || 0,
    url: mediaUrl(row)
  }
}

export class MediaService {
  static async assertEntity(model: string, id: number, companyId?: number): Promise<void> {
    if (!ALLOWED_MEDIA_MODELS.has(model) || !Number.isSafeInteger(id) || id < 1) throw new Error('MEDIA_ENTITY_INVALID')
    const rows = await odoo.client.searchRead<{ id: number; company_id: [number, string] | false }>(model, [['id', '=', id]], ['id', 'company_id'], {
      limit: 1,
      context: { active_test: false }
    })
    if (!rows[0]) throw new Error('MEDIA_ENTITY_NOT_FOUND')
    const company = Array.isArray(rows[0].company_id) ? rows[0].company_id[0] : null
    if (companyId !== undefined && company !== null && company !== companyId) throw new Error('MEDIA_FORBIDDEN')
  }

  /** True when the deployed addon exposes the object-storage columns. */
  static async supportsObjectStorage(): Promise<boolean> {
    if (objectTierAvailable !== null) return objectTierAvailable
    try {
      await odoo.client.searchRead('syailendra.media', [['id', '=', 0]], ['id', 'storage_key'], { limit: 1 })
      objectTierAvailable = true
    } catch (error) {
      if (!isMissingFieldError(error)) throw error
      objectTierAvailable = false
      console.warn('[media] syailendra_scm < 18.0.1.6.0: object storage disabled, using Odoo filestore')
    }
    return objectTierAvailable
  }

  static async fetchMediaForEntity(model: string, id: number): Promise<MediaRecord[]> {
    if (!ALLOWED_MEDIA_MODELS.has(model) || !Number.isSafeInteger(id) || id < 1) throw new Error('MEDIA_ENTITY_INVALID')
    const rows = await readMediaRows<OdooMediaRaw>(
      [
        ['res_model', '=', model],
        ['res_id', '=', id]
      ],
      MEDIA_FIELDS,
      { limit: 200, order: 'sequence asc, id asc' }
    )
    return rows.map(mapMedia)
  }

  /** Count active media of one kind for an entity; the upload route enforces the quota. */
  static async countMedia(model: string, id: number, kind: MediaKind): Promise<number> {
    return odoo.client.searchCount('syailendra.media', [
      ['res_model', '=', model],
      ['res_id', '=', id],
      ['kind', '=', kind]
    ])
  }

  static async createObjectMedia(input: ObjectMediaInput): Promise<number> {
    const values: Record<string, OdooFieldValue> = {
      res_model: input.resModel,
      res_id: input.resId,
      kind: input.kind,
      role: input.role,
      name: input.name.replace(/[\\/\0-\x1f]/g, '_').slice(0, 255),
      storage_backend: 'supabase',
      storage_key: input.storageKey,
      checksum: input.checksum,
      mimetype: input.mimetype,
      file_size: input.size,
      duration: input.duration ?? 0,
      caption: (input.caption ?? '').slice(0, 255),
      alt_text: (input.altText ?? input.caption ?? '').slice(0, 255)
    }
    if (objectTierAvailable === false) throw new Error('MEDIA_SCHEMA_OUTDATED')
    try {
      const id = await odoo.client.create('syailendra.media', values)
      objectTierAvailable = true
      return id
    } catch (error) {
      if (!isMissingFieldError(error)) throw error
      objectTierAvailable = false
      throw new Error('MEDIA_SCHEMA_OUTDATED')
    }
  }

  /**
   * Delete the object first, then deactivate the row. Neither order self-heals, so the row is
   * kept (inactive) as the audit trail while the bytes are gone from the bucket.
   */
  /**
   * Temporary bridge for an addon older than 18.0.1.6.0: store the bytes in the Odoo
   * filestore exactly like the previous release did. Removed once Fase D ships.
   */
  static async createLegacyMedia(input: {
    resModel: string
    resId: number
    kind: 'image' | 'document'
    role: string
    name: string
    mimetype: string
    bytes: Buffer
    caption?: string
  }): Promise<number> {
    const values: Record<string, OdooFieldValue> = {
      res_model: input.resModel,
      res_id: input.resId,
      kind: input.kind,
      role: input.role,
      name: input.name.replace(/[\\/\0-\x1f]/g, '_').slice(0, 255),
      image: input.kind === 'image' ? input.bytes.toString('base64') : false,
      document: input.kind === 'document' ? input.bytes.toString('base64') : false,
      mimetype: input.mimetype,
      file_size: input.bytes.byteLength,
      caption: (input.caption ?? '').slice(0, 255),
      alt_text: (input.caption ?? '').slice(0, 255)
    }
    return odoo.client.create('syailendra.media', values)
  }

  static async removeMedia(id: number): Promise<boolean> {
    const rows = await readMediaRows<{ id: number; storage_key?: string | false }>([['id', '=', id]], ['id', 'storage_key'], { limit: 1 })
    const row = rows[0]
    if (!row) return false
    if (row.storage_key) await deleteObject(row.storage_key)
    await odoo.client.write('syailendra.media', [id], { active: false })
    return true
  }

  /** Row lookup for the streaming routes: authorization stays with the caller. */
  static async getStreamableMedia(id: number, companyId?: number): Promise<StreamableMedia | null> {
    const rows = await odoo.client.searchRead<{
      id: number
      res_model: string
      res_id: number
      kind: MediaKind
      mimetype: string | false
      name: string | false
      file_size: number
      storage_key: string | false
    }>('syailendra.media', [['id', '=', id]], ['id', 'res_model', 'res_id', 'kind', 'mimetype', 'name', 'file_size', 'storage_key'], { limit: 1 })
    const row = rows[0]
    if (!row) return null
    await this.assertEntity(row.res_model, row.res_id, companyId)
    return {
      id: row.id,
      kind: row.kind,
      mimetype: row.mimetype || 'application/octet-stream',
      name: row.name || 'berkas',
      fileSize: row.file_size || 0,
      storageKey: row.storage_key || null
    }
  }

  static async getDocumentData(id: number, companyId?: number): Promise<{ document: string; mimetype: string; name: string } | null> {
    const rows = await odoo.client.searchRead<{
      id: number
      res_model: string
      res_id: number
      document: string | false
      mimetype: string | false
      name: string | false
    }>(
      'syailendra.media',
      [
        ['id', '=', id],
        ['kind', '=', 'document']
      ],
      ['id', 'res_model', 'res_id', 'document', 'mimetype', 'name'],
      {
        limit: 1
      }
    )
    const row = rows[0]
    if (row) await this.assertEntity(row.res_model, row.res_id, companyId)
    return row?.document ? { document: row.document, mimetype: row.mimetype || 'application/pdf', name: row.name || 'document.pdf' } : null
  }

  static async getMediaImageData(id: number, companyId?: number): Promise<{ image: string; mimetype: string } | null> {
    const rows = await odoo.client.searchRead<{
      id: number
      res_model: string
      res_id: number
      image: string | false
      mimetype: string | false
    }>(
      'syailendra.media',
      [
        ['id', '=', id],
        ['kind', '=', 'image']
      ],
      ['id', 'res_model', 'res_id', 'image', 'mimetype'],
      {
        limit: 1
      }
    )
    const row = rows[0]
    if (row) await this.assertEntity(row.res_model, row.res_id, companyId)
    return row?.image ? { image: row.image, mimetype: row.mimetype || 'image/webp' } : null
  }
}
