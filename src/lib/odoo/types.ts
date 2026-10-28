/**
 * types.ts — Strict TypeScript Interfaces for Odoo 18 Models & JSON-RPC 2.0
 * Syailendra Group ERP
 */

export interface OdooConfig {
  baseUrl: string
  db: string
  username: string
  password?: string
  apiKey?: string
}

export interface JsonRpcPayload<T = unknown[]> {
  jsonrpc: '2.0'
  method: 'call'
  params: {
    service: 'common' | 'object'
    method: string
    args: T
  }
  id: number
}

export interface JsonRpcResponse<T = unknown> {
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
      arguments?: unknown[]
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
export interface StockLot {
  id: number
  name: string
  product_id: OdooMany2One
  ref?: string | false
  note?: string | false
  create_date: string
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

// --- 6. CRM & Sales Pipeline (Colabo Style) ---
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
