/**
 * types.ts — Strict TypeScript Interfaces for Odoo 18 Models & JSON-RPC 2.0
 * Syailendra Group ERP
 */

export type OdooPrimitive = string | number | boolean | null | undefined
export type OdooDomainTuple = [string, string, string | number | boolean | (string | number | boolean)[]]
export type OdooDomain = (OdooDomainTuple | string)[]
export type OdooM2MCommand = [number, number, number[]] | [number, number] | [number, number, Record<string, OdooPrimitive>]
export interface OdooObjectValue {
  [key: string]: OdooFieldValue
}
export type OdooFieldValue = OdooPrimitive | OdooPrimitive[] | OdooObjectValue | OdooObjectValue[] | OdooM2MCommand[]
export type OdooRpcArg = OdooPrimitive | OdooDomain | Record<string, OdooFieldValue> | number[] | string[] | OdooRpcArg[]

export interface OdooConfig {
  baseUrl: string
  db: string
  username: string
  password?: string
  apiKey?: string
}

export interface JsonRpcPayload<T = OdooRpcArg[]> {
  jsonrpc: '2.0'
  method: 'call'
  params: {
    service: 'common' | 'object'
    method: string
    args: T
  }
  id: number
}

export interface JsonRpcResponse<T = OdooFieldValue> {
  jsonrpc: '2.0'
  id: number
  result?: T
  error?: {
    code: number
    message: string
    data?: {
      name?: string
      debug?: string
      message?: string
      arguments?: string[]
    }
  }
}

export type OdooMany2One = [id: number, name: string]

// --- 1. Product & Catalog Models ---
export interface ProductProduct {
  id: number
  name: string
  default_code?: string | false
  barcode?: string | false
  list_price: number
  standard_price: number
  tracking: 'none' | 'lot' | 'serial'
  is_storable: boolean
  qty_available?: number
}

// --- 2. Inventory & Stock Quant Models ---
export interface StockLocation {
  id: number
  name: string
  complete_name: string
  usage: 'supplier' | 'view' | 'internal' | 'customer' | 'inventory' | 'production' | 'transit'
}

export interface StockQuant {
  id: number
  product_id: OdooMany2One
  location_id: OdooMany2One
  lot_id: OdooMany2One | false
  quantity: number
  reserved_quantity: number
  inventory_quantity?: number
}

// --- 3. Warehouse Transfers & Operations ---
export type PickingState = 'draft' | 'waiting' | 'confirmed' | 'assigned' | 'done' | 'cancel'

export interface StockPickingType {
  id: number
  name: string
  code: 'incoming' | 'outgoing' | 'internal'
  count_picking_ready: number
  count_picking_waiting: number
  count_picking_late: number
}

export interface StockPicking {
  id: number
  name: string
  partner_id: OdooMany2One | false
  picking_type_id: OdooMany2One
  location_id: OdooMany2One
  location_dest_id: OdooMany2One
  scheduled_date: string
  date_done?: string | false
  state: PickingState
  origin?: string | false
  move_line_ids?: number[]
}

export interface StockMoveLine {
  id: number
  picking_id: OdooMany2One | false
  product_id: OdooMany2One
  location_id: OdooMany2One
  location_dest_id: OdooMany2One
  lot_id: OdooMany2One | false
  quantity: number
  date: string
  state: PickingState
}

// --- 4. Lot & Traceability Engine ---
export type QcStatus = 'quarantine' | 'green_accepted' | 'yellow_hold' | 'red_rejected'

export type TraceEntityType = 'harvest_lot' | 'distillation_batch' | 'raw_material_batch' | 'production_batch' | 'finish_good_batch' | 'shipment'

export interface StockLot {
  id: number
  name: string
  product_id: OdooMany2One
  ref?: string | false
  note?: string | false
  lot_properties?: Record<string, OdooFieldValue> | null
  create_date: string
}

export interface PublicTraceabilityProjection {
  lot_code: string
  product_name: string
  botanical_name: string
  plant_part: string
  origin_region: string
  elevation_masl: number
  farmer_group: string
  harvest_date: string
  distillation_method: string
  cupping_or_grade_score: number
  active_compounds: Array<{ compound: string; percentage: number }>
  organoleptic: {
    color: string
    clarity: string
    odor: string
  }
  public_coa_url?: string
  safety_classification: string
  production_date: string
  expiration_date: string
  is_authentic: boolean
}

export interface InternalTraceabilityDetail {
  id: number
  lot_code: string
  ref?: string | false
  product_name: string
  product_code?: string | false
  entity_type: TraceEntityType
  qc_status?: QcStatus
  qc_label?: string
  warehouse_location?: string
  on_hand_qty: number
  uom: string
  parent_lots: string[]
  properties: Record<string, OdooFieldValue>
  create_date: string
}

export interface GenealogyNode {
  lot_id: number
  lot_name: string
  entity_type: TraceEntityType | string
  product_name: string
  date?: string
  status?: string
  details?: Record<string, OdooFieldValue>
  parents?: GenealogyNode[]
}

export interface QCReleaseParams {
  lotId: number
  qcStatus: 'green_accepted' | 'yellow_hold' | 'red_rejected'
  coaNumber?: string
  inspectorName: string
  notes?: string
}

export interface TraceabilityKPI {
  totalLotsTracked: number
  harvestLotsCount: number
  distillationBatchesCount: number
  rawMaterialBatchesCount: number
  finishGoodLotsCount: number
  quarantineLotsCount: number
  rejectedLotsCount: number
}

// --- 5. Human Resources & Attendance ---
export interface HrEmployee {
  id: number
  name: string
  work_email?: string | false
  job_title?: string | false
  department_id?: OdooMany2One | false
  user_id?: OdooMany2One | false
}

export interface HrAttendance {
  id: number
  employee_id: OdooMany2One
  check_in: string
  check_out?: string | false
  worked_hours?: number
}

// --- 6. CRM & Sales Pipeline ---
export interface CrmLead {
  id: number
  name: string
  partner_id: OdooMany2One | false
  contact_name?: string | false
  email_from?: string | false
  phone?: string | false
  expected_revenue?: number
  probability?: number
  stage_id: OdooMany2One
  priority?: '0' | '1' | '2' | '3'
  description?: string | false
  create_date: string
}

export interface CrmStage {
  id: number
  name: string
  sequence: number
  is_won: boolean
}
