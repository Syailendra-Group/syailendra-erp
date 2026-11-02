export interface ProvinceRecord {
  id: number
  name: string
  code: string
  country_id: [number, string]
  active?: boolean
}
