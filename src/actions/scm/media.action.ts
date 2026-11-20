'use server'

import { requireSession } from '@/lib/auth/guard'
import { getSession } from '@/lib/auth/session'
import { odoo } from '@/lib/odoo'
import { MediaService } from '@/services/odoo/scm/media.service'

import type { MediaRecord } from '@/types/components/media'

const ENTITY_MODELS = new Set(['res.partner', 'syailendra.farm', 'syailendra.distillery', 'product.template'])

async function assertEntityAccess(model: string, id: number): Promise<void> {
  if (!ENTITY_MODELS.has(model) || !Number.isSafeInteger(id) || id < 1) throw new Error('MEDIA_ENTITY_INVALID')
  const session = await getSession()
  if (!session) throw new Error('UNAUTHORIZED')
  const rows = await odoo.client.searchRead<{ id: number; company_id: [number, string] | false }>(model, [['id', '=', id]], ['id', 'company_id'], {
    limit: 1,
    context: { active_test: false }
  })
  if (!rows[0]) throw new Error('MEDIA_ENTITY_NOT_FOUND')
  const company = Array.isArray(rows[0].company_id) ? rows[0].company_id[0] : null
  if (company !== null && company !== session.companyId) throw new Error('MEDIA_FORBIDDEN')
}

export async function getEntityMediaAction(model: string, id: number): Promise<MediaRecord[]> {
  await requireSession()
  await assertEntityAccess(model, id)
  return MediaService.fetchMediaForEntity(model, id)
}

export async function deleteEntityMediaAction(mediaId: number): Promise<{ success: boolean; error?: string }> {
  await requireSession()
  try {
    const rows = await odoo.client.searchRead<{ id: number; res_model: string; res_id: number }>(
      'syailendra.media',
      [['id', '=', mediaId]],
      ['id', 'res_model', 'res_id'],
      { limit: 1 }
    )
    const media = rows[0]
    if (!media) throw new Error('MEDIA_NOT_FOUND')
    await assertEntityAccess(media.res_model, media.res_id)
    await MediaService.removeMedia(mediaId)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'MEDIA_DELETE_FAILED' }
  }
}
