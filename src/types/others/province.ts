export interface ProvinceRecord {
  id: number
  name: string
  code: string
  alias?: string | false
  description?: string | false
  country_id: [number, string]
}
