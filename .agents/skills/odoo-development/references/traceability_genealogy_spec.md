# Traceability & Batch Genealogy Architecture: Odoo 18 CE & Headless Next.js

## 1. 7-Layer Lineage DAG (Directed Acyclic Graph)

| Tier | Entity Name | Format | Odoo 18 Model | Key Attributes |
| :--- | :--- | :--- | :--- | :--- |
| **L1** | Farmer Master | `FMR-[WIL]-[SEQ]` | `res.partner` | `name`, `vat` (NIK), `partner_latitude`, `partner_longitude`, `street` (Village) |
| **L2** | Harvest Lot | `HAR-[WIL]-[YYYY]-[SEQ]` | `stock.lot` | `product_id` (raw biomass), `lot_properties` (`farmer_ids`, harvest date, wet weight) |
| **L3** | Distillation Run | `DSTB-[YYYY]-[MM]-[SEQ]` | `mrp.production` / `stock.lot` | Boiler (`mrp.workcenter`), temp, pressure, duration, oil yield (%), crude oil lot |
| **L4** | Raw Material Drum | `RM-[MAT]-[YYYY]-[SEQ]` | `stock.lot` | Released oil lot, `lot_properties` (GC-MS active %, specific gravity, RI, COA link) |
| **L5** | Production Blending | `PROD-[YYYY]-[SEQ]` | `mrp.production` | Formula (`mrp.bom`), consumed RM lots (`stock.move.line`), blending tank, IPC test |
| **L6** | Finish Good Pack | `FG-[PROD]-[YYYY]-[SEQ]` | `stock.lot` | Finished packaged goods, SKU (1ml sample, 5ml sample, retail bottle, bulk drum) |
| **L7** | Shipment Manifest | `SHIP-[YYYY]-[MM]-[SEQ]` | `stock.picking` | `carrier_tracking_ref` (FedEx AWB), PEB/NPE, customer invoice, destination |

---

## 2. Odoo 18 Community Edition Quarantine & QC Lockout Recipe

Because `quality_control` is Enterprise-only, enforce zero-cost strict gating via **Stock Location Routing**:

```
[ Inbound Receipt (PO) ]
          │
          ▼ Destination: WH/Input/Quarantine
[ WH/Input/Quarantine (Quarantine Zone) ] ── (LOCKED: mrp.production cannot reserve here)
          │
          ├── If QC FAILED (Red) ──► Internal Transfer to WH/Reject (Vendor Return Claim)
          │
          └── If QC PASSED (Green) ──► Internal Transfer to WH/Stock/Approved
                                                   │
                                                   ▼ Source for Production
                                      [ WH/Stock/Approved ] ──► mrp.production
```

### JSON-RPC QC Approval Server Action Recipe

```typescript
// Move lot from Quarantine to Approved location
export async function approveLotQC(lotId: number, odooClient: OdooClient) {
  // 1. Fetch lot details and current quant location
  const [lot] = await odooClient.searchRead<StockLot>('stock.lot', [['id', '=', lotId]], ['name', 'product_id']);
  
  // 2. Fetch location IDs
  const [quarantineLoc] = await odooClient.searchRead('stock.location', [['name', '=', 'Quarantine']], ['id']);
  const [approvedLoc] = await odooClient.searchRead('stock.location', [['name', '=', 'Approved']], ['id']);

  // 3. Create immediate internal picking
  const pickingId = await odooClient.create('stock.picking', {
    picking_type_id: INTERNAL_TRANSFER_TYPE_ID,
    location_id: quarantineLoc.id,
    location_dest_id: approvedLoc.id,
    origin: `QC Release: Lot ${lot.name}`
  });

  // 4. Create move and move line with lot_id
  await odooClient.create('stock.move', {
    name: `Transfer QC Approved Lot ${lot.name}`,
    picking_id: pickingId,
    product_id: lot.product_id[0],
    product_uom_qty: lotQty,
    product_uom: lotUomId,
    location_id: quarantineLoc.id,
    location_dest_id: approvedLoc.id
  });

  // 5. Validate picking
  await odooClient.executeKw('stock.picking', 'button_validate', [[pickingId]]);
}
```

---

## 3. Public Consumer QR Projection (Zero-Leakage Security)

When building `/src/app/[locale]/(public)/trace/[lot_code]/page.tsx`:
- **Allowed Public Projection:**
  - Crop region, elevation, botanical name (INCI), distillation method, harvest date, sensoric notes, main GC-MS active compound percentages, public COA view URL.
- **Strictly Stripped Internal Attributes:**
  - `standard_price`, `cost_price`, supplier purchase prices, internal blending ratios, margin calculations, customer commercial prices, farmer personal NIK/identity.

---

## 4. Dual Metadata Extraction Pattern (`extractLotMetadata`)

In Odoo 18, `fields.Properties` (`lot_properties`) strips unregistered keys over JSON-RPC. Always mirror JSON metadata to `stock_lot.note` and extract with dual fallback:

```typescript
export function extractLotMetadata(lot: StockLot): Record<string, unknown> {
  if (lot.lot_properties && typeof lot.lot_properties === 'object' && !Array.isArray(lot.lot_properties) && Object.keys(lot.lot_properties).length > 0) {
    return lot.lot_properties
  }
  if (typeof lot.note === 'string') {
    const trimmed = lot.note.trim()
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        return JSON.parse(trimmed) as Record<string, unknown>
      } catch {
        // fallback to empty
      }
    }
  }
  return {}
}
```

