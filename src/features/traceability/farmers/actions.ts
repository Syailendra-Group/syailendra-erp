'use server'

import { revalidatePath } from 'next/cache'

import { odoo } from '@/lib/odoo'
import { farmerFormSchema } from '@/schemas/farmer'

import type { OdooFieldValue } from '@/lib/odoo/types'
import type { FarmerFormValues } from '@/schemas/farmer'

export interface FarmerRecord {
  id: number
  ref: string
  name: string
  vat?: string | false
  street: string
  city: string
  partner_latitude: number
  partner_longitude: number
  phone?: string | false
  email?: string | false
  comment?: string | false
  commodity?: string
  farming_method?: string
  land_area_m2?: number
  active: boolean
}

export async function getFarmersAction(): Promise<{ farmers: FarmerRecord[] }> {
  try {
    const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>(
      'res.partner',
      [['ref', 'like', 'FMR%']],
      ['id', 'ref', 'name', 'vat', 'street', 'city', 'partner_latitude', 'partner_longitude', 'phone', 'email', 'comment', 'active'],
      { order: 'ref asc' }
    )

    const farmers: FarmerRecord[] = records.map((r) => {
      const comment = (r.comment as string) || ''
      let commodity = 'gaharu'
      if (comment.toLowerCase().includes('nilam')) commodity = 'nilam'
      else if (comment.toLowerCase().includes('serai')) commodity = 'serai'
      else if (comment.toLowerCase().includes('kopi')) commodity = 'kopi'
      else if (comment.toLowerCase().includes('cengkeh')) commodity = 'cengkeh'

      let land_area_m2 = 2500
      const landMatch = comment.match(/Luas Lahan:\s*(\d+)/i)
      if (landMatch && landMatch[1]) {
        land_area_m2 = parseInt(landMatch[1], 10)
      }

      return {
        id: r.id as number,
        ref: (r.ref as string) || `FMR-JTG-${r.id}`,
        name: (r.name as string) || 'Petani Mitra',
        vat: (r.vat as string) || false,
        street: (r.street as string) || '-',
        city: (r.city as string) || '-',
        partner_latitude: Number(r.partner_latitude) || 0,
        partner_longitude: Number(r.partner_longitude) || 0,
        phone: (r.phone as string) || false,
        email: (r.email as string) || false,
        comment: comment || false,
        commodity,
        farming_method: comment.toLowerCase().includes('organik') ? 'organic' : 'conventional',
        land_area_m2,
        active: Boolean(r.active)
      }
    })

    return { farmers }
  } catch (err) {
    console.error('Failed to fetch farmers from Odoo 18:', err)
    return { farmers: [] }
  }
}

export async function getFarmerByIdAction(id: number): Promise<FarmerRecord | null> {
  try {
    const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>(
      'res.partner',
      [['id', '=', id]],
      ['id', 'ref', 'name', 'vat', 'street', 'city', 'partner_latitude', 'partner_longitude', 'phone', 'email', 'comment', 'active']
    )
    const r = records[0]
    if (!r) return null

    const comment = (r.comment as string) || ''
    let commodity = 'gaharu'
    if (comment.toLowerCase().includes('nilam')) commodity = 'nilam'
    else if (comment.toLowerCase().includes('serai')) commodity = 'serai'
    else if (comment.toLowerCase().includes('kopi')) commodity = 'kopi'
    else if (comment.toLowerCase().includes('cengkeh')) commodity = 'cengkeh'

    let land_area_m2 = 2500
    const landMatch = comment.match(/Luas Lahan:\s*(\d+)/i)
    if (landMatch && landMatch[1]) {
      land_area_m2 = parseInt(landMatch[1], 10)
    }

    return {
      id: r.id as number,
      ref: (r.ref as string) || `FMR-JTG-${r.id}`,
      name: (r.name as string) || 'Petani Mitra',
      vat: (r.vat as string) || false,
      street: (r.street as string) || '-',
      city: (r.city as string) || '-',
      partner_latitude: Number(r.partner_latitude) || 0,
      partner_longitude: Number(r.partner_longitude) || 0,
      phone: (r.phone as string) || false,
      email: (r.email as string) || false,
      comment: comment || false,
      commodity,
      farming_method: comment.toLowerCase().includes('organik') ? 'organic' : 'conventional',
      land_area_m2,
      active: Boolean(r.active)
    }
  } catch (err) {
    console.error('Failed to fetch farmer by ID:', err)
    return null
  }
}

export async function saveFarmerAction(values: FarmerFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  const parsed = farmerFormSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid parameters' }
  }

  const { id, ref, name, vat, street, city, partner_latitude, partner_longitude, phone, email, commodity, farming_method, land_area_m2, comment } =
    parsed.data

  try {
    const combinedNotes = [
      comment ? comment.trim() : '',
      `Komoditas: ${commodity.toUpperCase()}`,
      `Metode: ${farming_method.toUpperCase()}`,
      land_area_m2 ? `Luas Lahan: ${land_area_m2} m²` : ''
    ]
      .filter(Boolean)
      .join(' | ')

    const payload: Record<string, OdooFieldValue> = {
      ref,
      name,
      vat: vat || false,
      street,
      city,
      partner_latitude,
      partner_longitude,
      phone: phone || false,
      email: email || false,
      comment: combinedNotes,
      autopost_bills: 'ask'
    }

    let savedId = id
    if (id) {
      await odoo.client.write('res.partner', [id], payload)
    } else {
      payload.is_company = false
      payload.active = true
      savedId = await odoo.client.create('res.partner', payload)
    }

    revalidatePath('/traceability/farmers')
    return { success: true, id: savedId }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save farmer to Odoo'
    return { success: false, error: msg }
  }
}

export async function toggleFarmerStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await odoo.client.write('res.partner', [id], { active })
    revalidatePath('/traceability/farmers')
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update farmer status'
    return { success: false, error: msg }
  }
}
