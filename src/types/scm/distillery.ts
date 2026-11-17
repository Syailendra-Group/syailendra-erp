export interface DistilleryRecord {
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
