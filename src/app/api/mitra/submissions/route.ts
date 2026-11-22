import { promises as fs } from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

import { getPartnerSession } from '@/lib/auth/partner-session'
import { odooClient } from '@/lib/odoo/client'

import type { OdooObjectValue } from '@/lib/odoo/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/submissions')

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getPartnerSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const form = await req.formData()
  const kind = String(form.get('kind') || '')
  const payloadRaw = String(form.get('payload') || '{}')
  const latRaw = form.get('lat')
  const lonRaw = form.get('lon')
  const photo = form.get('photo')

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

  // Simpan foto upload dan referensikan URL publik di payload
  if (photo instanceof File && photo.size > 0) {
    const bytes = await photo.arrayBuffer()
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
    const safeName = String(photo.name).replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileName = `${session.accessId}-${Date.now()}-${safeName}`
    await fs.writeFile(path.join(UPLOAD_DIR, fileName), Buffer.from(bytes))
    payload.photo = `/uploads/submissions/${fileName}`
    payload.photo_name = photo.name
    payload.photo_size = photo.size
  }

  try {
    const recordId: number = await odooClient.create('syailendra.partner.submission', {
      access_id: session.accessId,
      kind,
      payload,
      state: 'draft'
    })

    await odooClient.executeKw<boolean>('syailendra.partner.submission', 'action_submit', [[recordId], session.accessId], {})

    return NextResponse.json({ success: true, id: recordId })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    // Odoo raises UserError/ValidationError dengan format "CODE: pesan"
    const codeMatch = message.match(/^(E_[A-Z_]+):/)
    return NextResponse.json({ success: false, error: message, code: codeMatch ? codeMatch[1] : null }, { status: 400 })
  }
}
