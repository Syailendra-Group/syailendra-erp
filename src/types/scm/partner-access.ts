/** Odoo partner authentication contract and mapped session identity. */
export interface PartnerAccessRecord {
  accessId: number
  partnerId: number
  partnerName: string
  role: 'farmer' | 'distiller'
  companyId: number
  mustChangePin: boolean
}

/**
 * PartnerAccessSummary — ringkasan status PIN partner untuk daftar supplier.
 * Tidak pernah menyimpan plaintext PIN.
 */
export interface PartnerAccessSummary {
  partnerId: number
  partnerRef: string | null
  partnerName: string
  hasAccess: boolean
  pinStatus: SupplierPinStatus
  lastLoginAt?: string | null
  loginFailCount?: number
}

export type SupplierPinStatus = 'no-access' | 'active' | 'must-change' | 'locked'

/**
 * PinIssueResult — hasil generate/set PIN baru via RPC.
 * Plaintext PIN hanya dikembalikan sekali di sini dan hanya ditampilkan sekali di UI.
 */
export interface PinIssueResult {
  ok: true
  pin: string
  accessId: number
  partnerId: number
  mustChangePin: boolean
}

export interface PinIssueFail {
  ok: false
  reason: 'unauthorized' | 'service_unavailable' | 'partner_not_found' | 'already_locked'
  message?: string
}

export type PinIssueResponse = PinIssueResult | PinIssueFail

/**
 * PinSetResult — hasil set PIN manual.
 */
export interface PinSetResult {
  ok: true
  accessId: number
}

export interface PinSetFail {
  ok: false
  reason: 'unauthorized' | 'invalid_pin' | 'weak_pin' | 'locked' | 'service_unavailable' | 'partner_not_found'
  message?: string
}

export type PinSetResponse = PinSetResult | PinSetFail
