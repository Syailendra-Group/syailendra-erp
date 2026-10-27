/**
 * index.ts — Unified Export Gateway for Syailendra Group Odoo Services
 */

import { odooClient, OdooClient } from "./client";
import { AttendanceService, CrmService, InventoryService, TraceabilityService } from "./models";

export * from "./types";
export * from "./client";
export * from "./models";

export const odoo = {
  client: odooClient,
  inventory: new InventoryService(odooClient),
  traceability: new TraceabilityService(odooClient),
  attendance: new AttendanceService(odooClient),
  crm: new CrmService(odooClient),
};

export default odoo;
