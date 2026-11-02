/**
 * distiller.service.ts — Odoo 18 RPC Service for Distillation Units
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'

import type { OdooFieldValue } from '@/lib/odoo/types'
import type { DistillerFormValues } from '@/schemas/traceability/distiller-schema'
import type { DistillerRecord } from '@/types/traceability/distiller'

function mapPartnerToDistiller(r: Record<string, OdooFieldValue>): DistillerRecord {
  const comment = (r.comment as string) || ''
  let boiler_capacity_kg = 500
  const capMatch = comment.match(/Kapasitas Ketel:\s*(\d+)/i)
  if (capMatch && capMatch[1]) {
    boiler_capacity_kg = parseInt(capMatch[1], 10)
  }

  let method = 'steam'
  if (comment.toLowerCase().includes('hydro')) method = 'hydro'
  else if (comment.toLowerCase().includes('water_steam')) method = 'water_steam'

  let boiler_material = 'ss304'
  if (comment.toLowerCase().includes('ss316')) boiler_material = 'ss316'
  else if (comment.toLowerCase().includes('copper')) boiler_material = 'copper'

  let ownership = 'company_owned'
  if (comment.toLowerCase().includes('mitra')) ownership = 'cooperative'
  else if (comment.toLowerCase().includes('sewa')) ownership = 'leased'

  return {
    id: r.id as number,
    ref: (r.ref as string) || 'DST-JTG-' + r.id,
    name: (r.name as string) || 'Ketel Suling',
    boiler_capacity_kg,
    method,
    boiler_material,
    ownership,
    operator_name: (r.function as string) || 'Operator Suling',
    phone: (r.phone as string) || false,
    city: (r.city as string) || 'Temanggung',
    street: (r.street as string) || 'Kawasan Sentra Suling',
    partner_latitude: Number(r.partner_latitude) || 0,
    partner_longitude: Number(r.partner_longitude) || 0,
    sanitation_status: comment.toLowerCase().includes('inspeksi sanitasi: lolos') ? 'passed' : 'pending',
    comment: comment || false,
    active: Boolean(r.active)
  }
}

export async function fetchDistillers(): Promise<DistillerRecord[]> {
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>(
    'res.partner',
    [['ref', 'like', 'DST%']],
    ['id', 'ref', 'name', 'function', 'phone', 'city', 'street', 'partner_latitude', 'partner_longitude', 'comment', 'active'],
    { order: 'ref asc' }
  )

  return records.map(mapPartnerToDistiller)
}

export async function persistDistiller(values: DistillerFormValues): Promise<number> {
  const {
    id,
    ref,
    name,
    boiler_capacity_kg,
    method,
    boiler_material,
    ownership,
    operator_name,
    phone,
    city,
    street,
    partner_latitude,
    partner_longitude,
    sanitation_status,
    comment
  } = values

  const combinedNotes = [
    comment ? comment.trim() : '',
    'Kapasitas Ketel: ' + boiler_capacity_kg + ' Kg',
    'Metode: ' + method.toUpperCase(),
    'Material: ' + boiler_material.toUpperCase(),
    'Kepemilikan: ' + ownership.toUpperCase(),
    'Inspeksi Sanitasi: ' + (sanitation_status === 'passed' ? 'Lolos' : 'Pending')
  ]
    .filter(Boolean)
    .join(' | ')

  const payload: Record<string, OdooFieldValue> = {
    ref,
    name,
    function: operator_name,
    phone: phone || false,
    city,
    street,
    partner_latitude: partner_latitude || 0,
    partner_longitude: partner_longitude || 0,
    comment: combinedNotes,
    autopost_bills: 'ask'
  }

  if (id) {
    await odoo.client.write('res.partner', [id], payload)
    return id
  }

  payload.is_company = false
  payload.active = true
  return await odoo.client.create('res.partner', payload)
}

export async function updateDistillerActiveState(id: number, active: boolean): Promise<boolean> {
  return odoo.client.write('res.partner', [id], { active })
}
