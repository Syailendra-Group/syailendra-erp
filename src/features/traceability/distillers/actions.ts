'use server'

import { revalidatePath } from 'next/cache'

import { odoo } from '@/lib/odoo'
import { distillerFormSchema } from '@/schemas/distiller'

import type { DistillerFormValues } from '@/schemas/distiller'

export interface DistillerRecord {
  id: number
  ref: string
  name: string
  boiler_capacity_kg: number
  method: string
  boiler_material: string
  ownership: string
  operator_name: string
  phone?: string | false
  city: string
  street: string
  partner_latitude?: number
  partner_longitude?: number
  sanitation_status: string
  comment?: string | false
  active: boolean
}

export async function getDistillersAction(): Promise<{ distillers: DistillerRecord[] }> {
  try {
    const records = await odoo.client.searchRead<Record<string, unknown>>(
      'res.partner',
      [['ref', 'like', 'DST%']],
      ['id', 'ref', 'name', 'street', 'city', 'partner_latitude', 'partner_longitude', 'phone', 'comment', 'active'],
      { order: 'ref asc' }
    )

    const distillers: DistillerRecord[] = records.map((r) => {
      const comment = (r.comment as string) || ''
      const capacity = 500
      let method = 'steam'
      let material = 'sus316'
      let ownership = 'internal'
      const operator = 'Tim Suling Agro'
      const sanitation = 'passed'

      if (comment.includes('Hydro')) method = 'hydro'
      else if (comment.includes('Water-Steam')) method = 'water_steam'
      else if (comment.includes('Cold')) method = 'cold_pressed'

      if (comment.includes('Mitra')) ownership = 'partner'
      if (comment.includes('304')) material = 'sus304'
      else if (comment.includes('Copper')) material = 'copper'

      return {
        id: r.id as number,
        ref: (r.ref as string) || `DST-JTG-${r.id}`,
        name: (r.name as string) || 'Unit Suling',
        boiler_capacity_kg: capacity,
        method,
        boiler_material: material,
        ownership,
        operator_name: operator,
        phone: (r.phone as string) || false,
        city: (r.city as string) || 'Temanggung',
        street: (r.street as string) || '-',
        partner_latitude: Number(r.partner_latitude) || 0,
        partner_longitude: Number(r.partner_longitude) || 0,
        sanitation_status: sanitation,
        comment: comment || false,
        active: Boolean(r.active)
      }
    })

    return { distillers }
  } catch (err) {
    console.error('Failed to fetch distillers from Odoo 18:', err)
    return { distillers: [] }
  }
}

export async function saveDistillerAction(values: DistillerFormValues): Promise<{ success: boolean; error?: string }> {
  const parsed = distillerFormSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid parameters' }
  }

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
  } = parsed.data

  try {
    const combinedNotes = [
      `Kapasitas: ${boiler_capacity_kg} Kg`,
      `Metode: ${method.toUpperCase()}`,
      `Material: ${boiler_material.toUpperCase()}`,
      `Kepemilikan: ${ownership.toUpperCase()}`,
      `Operator: ${operator_name}`,
      `Sanitasi: ${sanitation_status.toUpperCase()}`,
      comment ? comment.trim() : ''
    ]
      .filter(Boolean)
      .join(' | ')

    const payload: Record<string, unknown> = {
      ref,
      name,
      street,
      city,
      partner_latitude: partner_latitude || 0,
      partner_longitude: partner_longitude || 0,
      phone: phone || false,
      comment: combinedNotes,
      autopost_bills: 'ask'
    }

    if (id) {
      await odoo.client.write('res.partner', [id], payload)
    } else {
      payload.is_company = true
      payload.active = true
      await odoo.client.create('res.partner', payload)
    }

    revalidatePath('/traceability/distillers')
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save distiller unit'
    return { success: false, error: msg }
  }
}

export async function toggleDistillerStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await odoo.client.write('res.partner', [id], { active })
    revalidatePath('/traceability/distillers')
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update distiller status'
    return { success: false, error: msg }
  }
}
