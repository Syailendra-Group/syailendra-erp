/** Odoo partner authentication contract and mapped session identity. */
export interface PartnerAccessRecord {
  accessId: number
  partnerId: number
  partnerName: string
  role: 'farmer' | 'distiller'
  companyId: number
  mustChangePin: boolean
}
