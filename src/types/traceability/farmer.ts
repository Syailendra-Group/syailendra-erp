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
  // Extended regional fields from syailendra_region
  city_id?: [number, string] | false
  district_id?: [number, string] | false
  subdistrict_id?: [number, string] | false
  address_detail?: string | false
}
