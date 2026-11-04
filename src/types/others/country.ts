export interface CountryRecord {
  id: number
  name: string
  code: string
  phone_code?: number | false
  active?: boolean
  description?: string | false
}
