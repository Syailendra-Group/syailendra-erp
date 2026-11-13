export interface FarmerRecord {
  id: number
  ref: string
  name: string
  vat?: string | false
  street?: string | false
  city?: string | false
  partner_latitude?: number | false | null
  partner_longitude?: number | false | null
  phone?: string | false
  email?: string | false
  comment?: string | false
  commodity?: string
  farming_method?: string
  land_area_m2?: number
  active: boolean
  legacy_code?: string | false
  // Extended regional fields from syailendra_region
  country_id?: [number, string] | false
  state_id?: [number, string] | false
  city_id?: [number, string] | false
  district_id?: [number, string] | false
  subdistrict_id?: [number, string] | false
  zip_code?: string | false
  address_detail?: string | false
  address_benchmark?: string | false
}
