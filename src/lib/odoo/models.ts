/**
 * models.ts — Domain Services for Syailendra Group Modules
 * (Inventory, Traceability, Attendance, CRM)
 */

import { odooClient, OdooClient } from "./client";
import {
  CrmLead,
  CrmStage,
  HrAttendance,
  HrEmployee,
  ProductProduct,
  StockLot,
  StockMoveLine,
  StockPicking,
  StockPickingType,
  StockQuant,
} from "./types";

export class InventoryService {
  constructor(private client: OdooClient = odooClient) {}

  /**
   * Get all warehouse operation types (Kanban Cards)
   */
  async getOperationTypes(): Promise<StockPickingType[]> {
    return this.client.searchRead<StockPickingType>(
      "stock.picking.type",
      [],
      ["name", "code", "count_picking_ready", "count_picking_waiting", "count_picking_late"]
    );
  }

  /**
   * Get current physical stock quants on internal locations
   */
  async getStockQuants(
    options: { limit?: number; productId?: number } = {}
  ): Promise<StockQuant[]> {
    const domain: any[] = [["location_id.usage", "=", "internal"]];
    if (options.productId) {
      domain.push(["product_id", "=", options.productId]);
    }
    return this.client.searchRead<StockQuant>(
      "stock.quant",
      domain,
      ["product_id", "location_id", "lot_id", "quantity", "reserved_quantity"],
      { limit: options.limit || 50, order: "quantity desc" }
    );
  }

  /**
   * Get warehouse transfers (Receipts, Delivery, Internal)
   */
  async getTransfers(
    options: {
      typeCode?: "incoming" | "outgoing" | "internal";
      state?: string;
      limit?: number;
    } = {}
  ): Promise<StockPicking[]> {
    const domain: any[] = [];
    if (options.typeCode) {
      domain.push(["picking_type_code", "=", options.typeCode]);
    }
    if (options.state) {
      domain.push(["state", "=", options.state]);
    }
    return this.client.searchRead<StockPicking>(
      "stock.picking",
      domain,
      [
        "name",
        "partner_id",
        "picking_type_id",
        "location_id",
        "location_dest_id",
        "scheduled_date",
        "date_done",
        "state",
        "origin",
      ],
      { limit: options.limit || 40, order: "id desc" }
    );
  }

  /**
   * Validate a warehouse transfer directly (Done state)
   */
  async validateTransfer(pickingId: number): Promise<boolean> {
    const res = await this.client.executeKw<boolean | Record<string, any>>(
      "stock.picking",
      "button_validate",
      [pickingId]
    );
    return res === true;
  }
}

export class TraceabilityService {
  constructor(private client: OdooClient = odooClient) {}

  /**
   * Retrieve lot details by exact lot number (Public & Internal)
   */
  async getLotByNumber(lotNumber: string): Promise<StockLot | null> {
    const res = await this.client.searchRead<StockLot>(
      "stock.lot",
      [["name", "=", lotNumber]],
      ["name", "product_id", "ref", "note", "create_date"],
      { limit: 1 }
    );
    return res[0] || null;
  }

  /**
   * Retrieve complete lifecycle movements for a lot (Farm ➔ Warehouse ➔ Customer)
   */
  async getLotMovements(lotId: number): Promise<StockMoveLine[]> {
    return this.client.searchRead<StockMoveLine>(
      "stock.move.line",
      [
        ["lot_id", "=", lotId],
        ["state", "=", "done"],
      ],
      ["picking_id", "product_id", "location_id", "location_dest_id", "quantity", "date", "state"],
      { order: "date asc" }
    );
  }
}

export class AttendanceService {
  constructor(private client: OdooClient = odooClient) {}

  /**
   * Find employee profile by user ID or email
   */
  async getEmployeeByUserId(userId: number): Promise<HrEmployee | null> {
    const res = await this.client.searchRead<HrEmployee>(
      "hr.employee",
      [["user_id", "=", userId]],
      ["name", "work_email", "job_title", "department_id"],
      { limit: 1 }
    );
    return res[0] || null;
  }

  /**
   * Record employee clock-in
   */
  async checkIn(employeeId: number): Promise<number> {
    const nowIso = new Date().toISOString().replace("T", " ").substring(0, 19);
    return this.client.create<number>("hr.attendance", {
      employee_id: employeeId,
      check_in: nowIso,
    });
  }

  /**
   * Record employee clock-out
   */
  async checkOut(attendanceId: number): Promise<boolean> {
    const nowIso = new Date().toISOString().replace("T", " ").substring(0, 19);
    return this.client.write("hr.attendance", [attendanceId], {
      check_out: nowIso,
    });
  }

  /**
   * Get attendance log history
   */
  async getAttendanceHistory(employeeId?: number, limit = 30): Promise<HrAttendance[]> {
    const domain: any[] = [];
    if (employeeId) {
      domain.push(["employee_id", "=", employeeId]);
    }
    return this.client.searchRead<HrAttendance>(
      "hr.attendance",
      domain,
      ["employee_id", "check_in", "check_out", "worked_hours"],
      { limit, order: "check_in desc" }
    );
  }
}

export class CrmService {
  constructor(private client: OdooClient = odooClient) {}

  /**
   * Get all active sales stages
   */
  async getStages(): Promise<CrmStage[]> {
    return this.client.searchRead<CrmStage>("crm.stage", [], ["name", "sequence", "is_won"], {
      order: "sequence asc",
    });
  }

  /**
   * Get pipeline leads for Colabo-style kanban
   */
  async getLeads(limit = 100): Promise<CrmLead[]> {
    return this.client.searchRead<CrmLead>(
      "crm.lead",
      [],
      [
        "name",
        "partner_id",
        "contact_name",
        "email_from",
        "phone",
        "expected_revenue",
        "probability",
        "stage_id",
        "priority",
        "description",
        "create_date",
      ],
      { limit, order: "id desc" }
    );
  }

  /**
   * Move lead to another stage
   */
  async updateStage(leadId: number, stageId: number): Promise<boolean> {
    return this.client.write("crm.lead", [leadId], { stage_id: stageId });
  }
}
