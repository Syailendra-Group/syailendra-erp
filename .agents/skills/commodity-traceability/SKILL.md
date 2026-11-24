---
name: commodity-traceability
description: Trace natural commodity batches, terroir, and compliance.
---

# Commodity & Natural Extracts Traceability

You are an expert software architect and systems engineer for agricultural, essential oil, and natural commodity supply chain traceability systems. This skill guides the end-to-end design, data segregation, batch genealogy modeling, and compliance readiness for natural product supply chains.

## Core Traceability Architecture

### 1. Unified Supplier Master & Relational Facilities Architecture
Do NOT isolate Farmers and Distillers as separate unrelated master models. Natural commodity supply chains require a unified supplier architecture:
- **Supplier Master (`res.partner` where `supplier_rank > 0`):** The primary legal/commercial entity with `supplier_type` classification (`farmer`, `distiller`, `collector`, `cooperative`, `farmer_group`, `sme`, `corporate`).
- **1-to-Many Relational Assets per Supplier:**
  - `syailendra.farm`: Agricultural plots/kebun belonging to the supplier (central/polygon GPS coordinates, elevation mdpl, cultivation system, soil/pesticide history, EUDR compliance).
  - `syailendra.distillery`: Processing/distillation facilities owned by the supplier (boiler count/capacity kg, vessel material, fuel source, distillation method, average yield %).
  - `syailendra.crop`: Botanical species cultivated (Latin/INCI botanical name, plant part distilled, cultivation status).
  - `product.product`: Commodity products supplied (essential oils, carrier oils, hydrosols, dried raw materials, derivatives).

### 2. Standard SCM Navigation & Menu Hierarchy
In natural commodity ERP sidebars, structure the **Mitra & Origin (Hulu)** group with Master Data as a collapsible dropdown positioned **above** the Supplier menu:
```text
Mitra & Origin
  ├── Master Data (Dropdown Collapsible):
  │     ├── Jenis Supplier (/scm/supplier-categories)
  │     ├── Kebun / Lahan (/scm/farms)
  │     ├── Fasilitas Penyulingan (/scm/distilleries)
  │     ├── Tanaman / Komoditas (/scm/crops)
  │     └── Produk Atsiri (/scm/materials)
  └── Supplier (/scm/suppliers)
```

### 3. 6-Layer Batch Lineage (Directed Acyclic Graph / DAG)
Model the transformation of raw natural materials through distinct transactional layers:
```text
[Layer 1: FMR] Farmer & Land Master (Permanent: GPS coordinates, elevation mdpl, soil history)
      │
[Layer 2: HAR] Harvest Session Lot (Transactional: Harvest date, wet weight kg, consolidation)
      │
[Layer 3: DSTB] Distillation / Processing Run (Transactional: Boiler ID, temp, pressure, yield %)
      │
[Layer 4: RM] Raw Material Warehouse Batch (Inbound: Physical QC, GC-MS %, quarantine gate)
      │
[Layer 5: PROD] Production / Blending Run (Transactional: Recipe BOM, IPC checks, master batch)
      │
[Layer 6: FG] Finished Goods Batch (Packaging: SKU size 1ml/5ml/drum, batch label, expiry date)
      │
[Layer 7: SHIP] Logistics & Distribution (Transactional: Customer SO, AWB, Export Manifest)
```

### 2. Data Segregation Wall (Tembok Pemisah Data)
Enforce strict server-side separation between internal ERP records and public consumer-facing scans:
- **Public View (Consumer QR Scan):** Terroir location (village/district level), botanical INCI name, elevation (mdpl), harvest date, distillation method, active GC-MS compounds (%), organoleptic notes, and Certificate of Analysis (CoA).
- **Internal View (Strictly Gated):** Raw material purchase price, farmer personal phone/NIK, COGS (Cost of Goods Sold), profit margins, commercial B2B contracts, and proprietary blending recipes.

### 3. Hard-Gate Inbound Quarantine
- Every batch arriving at the receiving warehouse must automatically enter a `QUARANTINE` status and route to a quarantine location (e.g. `WH/Input/Quarantine`).
- The system must prevent allocation of quarantined stock to production orders or sales deliveries until an authorized QC analyst submits an inspection record and promotes the lot to `RELEASED`.
- Status `HOLD` indicates extended testing (max 48 hours), while `REJECTED` triggers vendor claims and routing to `WH/Reject`.

### 4. Global Regulatory Compliance Standards
- **EUDR (EU Deforestation Regulation):** Record first-mile polygon or central GPS coordinates, harvest date, and verification of non-deforested land.
- **CITES Appendix II (e.g., Agarwood / Gaharu):** Record species identification, cultivation status (wild vs. cultivated), national quota certificate, and export permit numbers.
- **EU Cosmetics & Flavor/Fragrance (IFRA / ISO 22000 / GMP):** Implement two-way "One-Step-Back, One-Step-Forward" traceability enabling mock recall execution in under 30 minutes.

---

## Odoo 18 & Database Modeling Guidelines

1. **Native `stock.lot` with `lot_properties`:**
   - Avoid creating excessive one-off database tables for dynamic chemical or physical parameters.
   - Utilize Odoo 18's native `lot_properties` (JSONB) to store organoleptic properties, GC-MS assay results, refractive index, and specific gravity.
2. **Dedicated Operational Upstream Models:**
   - `syailendra.farm`: Tracks agricultural blocks with precise GPS, elevation, and cultivation history.
   - `syailendra.distillery`: Tracks boiler specs, fuel type, metallurgy, and distillation methodology.
   - `syailendra.crop`: Botanical taxonomy, Latin/INCI naming, and plant parts.
   - `syailendra.harvest`: Consolidates multi-farmer yields into a single harvest lot (`HAR-...`).
   - `syailendra.distillation`: Tracks boiler biomass input, steam/water distillation parameters, fuel type, and calculates crude yield percentage automatically.
   - `syailendra.qc.inspection`: Quality control inspection and CoA certificate authorization (Approved/Hold/Rejected).
   - `syailendra.supplier.evaluation`: Periodic vendor scoring across 5 pillars (quality, delivery, communication, price, consistency) mapping to Grades A/B/C/D.
   - `syailendra.supplier.audit`: On-site farm/distillery audit findings and CAPA (Corrective Action) logs.
3. **Double-Entry Warehouse Routing:**
   - Enforce location transitions: `Partners/Vendors` ➔ `WH/Input/Quarantine` ➔ `WH/Stock/Approved` (or `WH/Stock/Reject`).

---

## Verification & Rapid Mock Recall Workflow

1. **Backward Traceability (Downstream to Upstream):**
   - Given a finished batch (`FG-...`) or Customer AWB, resolve the entire ancestor DAG up to specific farmer plots (`FMR-...`) in < 30 seconds.
2. **Forward Traceability (Upstream to Downstream):**
   - Given a contaminated crop or suspect boiler run, resolve all downstream blended batches, warehouse inventory locations, and delivered customer orders to generate an immediate containment manifest.
