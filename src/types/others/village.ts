export interface VillageRecord {
  id: number
  name: string
  code?: string | false
  alias?: string | false
  description?: string | false
  district_id: [number, string]
  city_id?: [number, string]
  zip_code?: string | false
  latitude?: number
  longitude?: number
  active: boolean
}
