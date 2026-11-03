export interface CountryRecord {
  id: number
  name: string
  code: string
  currency_id?: [number, string] | false
  phone_code?: number | false
  active?: boolean
  description?: string | false
}
