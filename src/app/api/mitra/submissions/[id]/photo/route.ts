import { getPartnerSession } from '@/lib/auth/partner-session'
import { respondWithMedia } from '@/lib/storage/media-response'
import { MediaService } from '@/services/odoo/scm/media.service'

import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Serve the photo evidence of one submission to the partner who owns it.
 *
 * The partner session never sees the storage key: the submission row is read with the
 * integration account, its `payload.photo_media_id` is resolved here, and the media row must
 * belong to the same partner as the session. Only images travel this path.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const session = await getPartnerSession()
  if (!session) return new Response('Unauthorized', { status: 401, headers: { 'Cache-Control': 'no-store' } })

  const { id: rawId } = await context.params
  const submissionId = Number(rawId)
  if (!Number.isSafeInteger(submissionId) || submissionId < 1) {
    return new Response('Invalid submission id', { status: 400, headers: { 'Cache-Control': 'no-store' } })
  }

  const mediaId = await MediaService.getSubmissionPhotoMediaId(submissionId, session.partnerId)
  if (!mediaId) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } })

  const media = await MediaService.getStreamableMedia(mediaId, session.companyId)
  if (!media || media.kind !== 'image') {
    return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } })
  }

  return respondWithMedia(media, { range: request.headers.get('range'), companyId: session.companyId })
}
