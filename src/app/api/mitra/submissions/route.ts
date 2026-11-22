import { promises as fsp } from 'node:fs'
import { NextRequest, NextResponse } from 'next/server'

import { getPartnerSession } from '@/lib/auth/partner-session'
import { odooClient } from '@/lib/odoo/client'
import { ingestUploadedMedia, MAX_REQUEST_BYTES, parseMultipart, StorageNotConfiguredError, UploadError } from '@/lib/storage/media-ingest'

import type { OdooObjectValue } from '@/lib/odoo/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Partner photos are evidence for a submission, so only images are accepted here. */
const PARTNER_PHOTO_KINDS = ['image'] as const

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getPartnerSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const declaredLength = Number(req.headers.get('content-length') ?? 0)
  if (declaredLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ success: false, error: 'MEDIA_FILE_TOO_LARGE' }, { status: 413 })
  }

  let tempPath: string | null = null
  try {
    const upload = await parseMultipart(req)
    tempPath = upload.tempPath
    const kind = String(upload.fields.kind || '')
    const payloadRaw = String(upload.fields.payload || '{}')
    const latRaw = upload.fields.lat
    const lonRaw = upload.fields.lon

    if (!kind) {
      return NextResponse.json({ success: false, error: 'MISSING_KIND' }, { status: 400 })
    }

    let payload: OdooObjectValue = {}
    try {
      payload = JSON.parse(payloadRaw) as OdooObjectValue
    } catch {
      return NextResponse.json({ success: false, error: 'INVALID_PAYLOAD' }, { status: 400 })
    }

    if (latRaw != null) {
      const lat = Number(latRaw)
      if (!Number.isNaN(lat)) payload.lat = lat
    }
    if (lonRaw != null) {
      const lon = Number(lonRaw)
      if (!Number.isNaN(lon)) payload.lon = lon
    }

    // The photo is attached to the partner the portal session belongs to; no public URL is
    // written into the payload, only the media id our own session-gated route can serve.
    const media = await ingestUploadedMedia({
      upload,
      model: 'res.partner',
      id: session.partnerId,
      role: 'facility',
      name: upload.fields.photoName || 'bukti.jpg',
      caption: kind,
      companyId: session.companyId,
      allowedKinds: [...PARTNER_PHOTO_KINDS]
    })
    payload.photo_media_id = media.id
    payload.photo_name = upload.fields.photoName || 'bukti.jpg'
    payload.photo_size = upload.size

    const recordId: number = await odooClient.create('syailendra.partner.submission', {
      access_id: session.accessId,
      kind,
      payload,
      state: 'draft'
    })

    await odooClient.executeKw<boolean>('syailendra.partner.submission', 'action_submit', [[recordId], session.accessId], {})

    return NextResponse.json({ success: true, id: recordId, media_id: media.id })
  } catch (error: unknown) {
    if (error instanceof UploadError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }
    if (error instanceof StorageNotConfiguredError) {
      return NextResponse.json({ success: false, error: 'STORAGE_NOT_CONFIGURED' }, { status: 503 })
    }
    const message = error instanceof Error ? error.message : String(error)
    // Odoo raises UserError/ValidationError dengan format "CODE: pesan"
    const codeMatch = message.match(/^(E_[A-Z_]+):/)
    return NextResponse.json({ success: false, error: message, code: codeMatch ? codeMatch[1] : null }, { status: 400 })
  } finally {
    if (tempPath) await fsp.rm(tempPath, { force: true })
  }
}
