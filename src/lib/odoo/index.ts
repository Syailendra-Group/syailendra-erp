/**
 * index.ts — Unified Export Gateway for Syailendra Group Odoo Services
 */

import { odooClient } from './client'
import { AttendanceService, CrmService, InventoryService } from './models'
import { TraceabilityService, traceabilityService } from './traceability'

export * from './types'
export * from './client'
export * from './models'
export * from './traceability'

export const odoo = {
  client: odooClient,
  inventory: new InventoryService(odooClient),
  traceability: traceabilityService || new TraceabilityService(odooClient),
  attendance: new AttendanceService(odooClient),
  crm: new CrmService(odooClient)
}

export default odoo
