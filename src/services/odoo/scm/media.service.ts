import { odoo } from '@/lib/odoo'

import type { OdooFieldValue } from '@/lib/odoo/types'
import type { MediaRecord, OdooMediaRaw } from '@/types/components/media'

const MEDIA_FIELDS = ['id', 'res_model', 'res_id', 'kind', 'role', 'name', 'sequence', 'mimetype', 'file_size', 'caption', 'alt_text', 'company_id']
const ALLOWED_MEDIA_MODELS = new Set(['res.partner', 'syailendra.farm', 'syailendra.distillery', 'product.template'])

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
    url: row.kind === 'image' ? `/api/odoo/media/${row.id}/image` : `/api/odoo/media/${row.id}/document`
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

  static async fetchMediaForEntity(model: string, id: number): Promise<MediaRecord[]> {
    if (!ALLOWED_MEDIA_MODELS.has(model) || !Number.isSafeInteger(id) || id < 1) throw new Error('MEDIA_ENTITY_INVALID')
    const rows = await odoo.client.searchRead<OdooMediaRaw>(
      'syailendra.media',
      [
        ['res_model', '=', model],
        ['res_id', '=', id]
      ],
      MEDIA_FIELDS,
      {
        limit: 20,
        order: 'sequence asc, id asc',
        context: { active_test: false }
      }
    )
    return rows.map(mapMedia)
  }

  static async createMedia(model: string, id: number, kind: 'image' | 'document', role: string, file: File, caption = ''): Promise<number> {
    await this.assertEntity(model, id)
    if (file.size > (kind === 'image' ? 5 : 10) * 1024 * 1024) throw new Error('MEDIA_FILE_TOO_LARGE')
    const rows = await odoo.client.searchRead<OdooMediaRaw>(
      'syailendra.media',
      [
        ['res_model', '=', model],
        ['res_id', '=', id],
        ['kind', '=', kind]
      ],
      ['id'],
      { limit: 10, order: 'id asc' }
    )
    if (rows.length >= 10) throw new Error('MEDIA_LIMIT_REACHED')
    const bytes = Buffer.from(await file.arrayBuffer())
    const detectedMime =
      bytes[0] === 0x89 && bytes[1] === 0x50
        ? 'image/png'
        : bytes[0] === 0xff && bytes[1] === 0xd8
          ? 'image/jpeg'
          : bytes.length >= 12 && bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP'
            ? 'image/webp'
            : bytes.subarray(0, 5).toString() === '%PDF-'
              ? 'application/pdf'
              : null
    if (!detectedMime) throw new Error('MEDIA_TYPE_INVALID')
    const values: Record<string, OdooFieldValue> = {
      res_model: model,
      res_id: id,
      kind,
      role,
      name: file.name.replace(/[\\/\0-\x1f]/g, '_').slice(0, 255),
      sequence: (rows.length + 1) * 10,
      image: kind === 'image' ? bytes.toString('base64') : false,
      document: kind === 'document' ? bytes.toString('base64') : false,
      mimetype: detectedMime,
      file_size: bytes.byteLength,
      caption: caption.slice(0, 255),
      alt_text: caption.slice(0, 255)
    }
    return odoo.client.create('syailendra.media', values)
  }

  static async removeMedia(id: number): Promise<boolean> {
    return odoo.client.unlink('syailendra.media', [id])
  }

  static async getDocumentData(id: number, companyId?: number): Promise<{ document: string; mimetype: string; name: string } | null> {
    const rows = await odoo.client.searchRead<{
      id: number
      res_model: string
      res_id: number
      kind: string
      document: string | false
      mimetype: string | false
      name: string | false
    }>(
      'syailendra.media',
      [
        ['id', '=', id],
        ['kind', '=', 'document']
      ],
      ['id', 'res_model', 'res_id', 'kind', 'document', 'mimetype', 'name'],
      { limit: 1 }
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
      kind: string
      image: string | false
      mimetype: string | false
    }>(
      'syailendra.media',
      [
        ['id', '=', id],
        ['kind', '=', 'image']
      ],
      ['id', 'res_model', 'res_id', 'kind', 'image', 'mimetype'],
      { limit: 1 }
    )
    const row = rows[0]
    if (row) await this.assertEntity(row.res_model, row.res_id, companyId)
    return row?.image ? { image: row.image, mimetype: row.mimetype || 'image/webp' } : null
  }
}
