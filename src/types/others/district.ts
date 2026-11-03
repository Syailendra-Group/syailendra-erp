export interface DistrictRecord {
  id: number
  name: string
  code?: string | false
  alias?: string | false
  description?: string | false
  city_id: [number, string]
  state_id?: [number, string]
  country_id?: [number, string]
  latitude?: number
  longitude?: number
  active: boolean
}
