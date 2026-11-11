export interface ProvinceRecord {
  id: number
  name: string
  code: string
  prefix?: string | false
  alias?: string | false
  description?: string | false
  country_id: [number, string]
  latitude?: number | false
  longitude?: number | false
}
