# PRD.md — Product Requirements Document

> **Product Name:** ERP Syailendra Group (Headless Enterprise Management System)  
> **Version:** 1.0.0 (Production Blueprint)  
> **Author:** Octa (`OctaLectzz`) & Kael (`octadev`)  
> **Target Audience:** Internal Operations (Warehouse, QC, Field Staff, Sales, Management) & Retail Consumers (Public Traceability)

---

## 🎯 1. Executive Summary & Vision

**Syailendra Group** is an agribusiness and specialty commodity enterprise managing high-value agricultural supply chains (specialty Arabica coffee from Mount Sindoro, organic spices, and premium natural commodities).

The goal of this system is to replace fragmented spreadsheets and legacy Odoo web templates with a unified, high-performance web platform built on **Next.js 16 + shadcn/ui** while leveraging **Odoo 18.0 Community Edition** as the core calculations, inventory, and bookkeeping engine.

The system delivers real-time stock control, complete transparency from farmer to cup, seamless daily field workforce tracking, and a modern, high-velocity B2B sales pipeline.

---

## 👥 2. User Personas & Roles

| Persona / Role               | Primary Responsibilities                                                             | Core System Needs                                                                                                                        |
| :--------------------------- | :----------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **Super Admin / Executive**  | Strategic oversight, global analytics, company settings, user permissions.           | Executive dashboard, dynamic branding configuration, full-access permission matrix.                                                      |
| **Warehouse Officer**        | Goods receipt from farmers, internal movements, dispatching orders to cafes/clients. | Fast barcode/lot scanning, double-entry move logging, one-click delivery validation.                                                     |
| **QC & Agronomist**          | Inspecting harvest quality, cupping scores, moisture content, defect levels.         | Lot metadata entry, traceability inspection, certification attachment.                                                                   |
| **Sales Representative**     | B2B wholesale client management, coffee supply deals, hotel/roastery accounts.       | Fast visual Kanban pipeline (Colabo CRM style), interaction logs, revenue forecasting.                                                   |
| **Field Staff / Operations** | Daily agricultural maintenance, processing cherry harvest, warehouse sorting.        | Mobile-friendly clock-in/out attendance, simple daily work report submission.                                                            |
| **End Consumer (Public)**    | Purchasing packaged retail products in cafes or e-commerce.                          | Instant QR code scan on product packaging displaying authentic harvest stories, farmer profiles, and quality verification without login. |

---

## 📦 3. Core Functional Modules

### 3.1. Module 1: Inventory & Multi-Warehouse Operations (`/inventory`, `/transfers`)

- **Real-Time Stock Ledger (`stock.quant`):**
  - Live tracking of physical stock across internal warehouse locations (`WH/Stock`, `WH/Shelf 1`, `WH/Input`).
  - Separation of metrics: _Total Physical On-Hand_, _Reserved Stock_, and _Free-to-Use Available Stock_.
  - Low stock warning badges with threshold alerts.
- **Warehouse Movements (`stock.move`, `stock.move.line`):**
  - Real-time audit trail of every unit movement based on double-entry inventory rules.
  - Export capabilities to `.xlsx` and `.csv` formats.
- **Transfer Documents (`stock.picking`):**
  - Tabbed workflow filtering: _Receipts (Incoming from Farmers)_, _Deliveries (Outgoing to Customers)_, and _Internal Transfers_.
  - Status progression: `Draft` ➔ `Confirmed` ➔ `Assigned (Ready)` ➔ `Done` ➔ `Cancelled`.
  - One-click transfer validation (`button_validate`) with confirmation dialogs and toast alerts.

### 3.2. Module 2: Agricultural Lot Traceability & Dual-View QR Code (`/traceability`, `/trace/[lot_code]`)

- **Lot & Batch Management (`stock.lot`):**
  - Automated batch generation upon harvest intake (e.g. `LOT-SYA-SINDORO-2026-001`).
  - Binding of agronomical attributes: harvest date, farmer/cooperative partner, varietal (e.g. Kartika/Typica), processing method (Full Wash, Natural, Honey), elevation, moisture content, and cupping score.
- **Upstream & Downstream Lineage:**
  - Upstream query: trace a finished retail bag back to the raw cherry delivery, drying bed, and farmer.
  - Downstream query: inspect which client orders received units from a specific harvest batch.
- **Dual-View QR Code Routing (`/trace/[lot_code]`):**
  - **Public Consumer View (Unauthenticated):**
    - High-impact storytelling landing page: farmer profile photo, farm elevation map, sustainability credentials, flavor notes, brewing advice.
    - Zero cost price (HPP), PO numbers, or vendor margins exposed.
  - **Internal Staff View (Authenticated):**
    - Complete operational audit log: incoming PO document, lab QC certificates, warehouse storage duration, operator machine records, raw material batch references.

### 3.3. Module 3: Workforce Attendance & Daily Activity Reporting (`/attendance`, `/reports`)

- **Mobile Clock-In / Clock-Out (`hr.attendance`):**
  - Digital interactive clock with one-tap attendance logging.
  - Automatic timestamp generation with optional browser geolocation coordinates to verify presence on-site.
  - Personal monthly attendance summary with worked hours calculations.
- **Daily Work Report Submission:**
  - Mandatory afternoon submission form for field operations, warehouse staff, and sales reps.
  - Capturing: accomplished tasks, operational bottlenecks, weather conditions, equipment health, and image attachments.
  - Supervisor review and approval dashboard.

### 3.4. Module 4: High-Velocity Commercial CRM (Colabo Style) (`/crm`)

- **Visual Deal Pipeline (`crm.lead`):**
  - Fluid drag-and-drop Kanban board inspired by Colabo CRM (`@dnd-kit/core`).
  - Pipeline stages: _New Lead_ ➔ _Qualified_ ➔ _Proposal Sent_ ➔ _Contract Negotiating_ ➔ _Won / Lost_.
  - Quick-view deal metrics: Expected revenue, closing probability, client contact card, priority star ratings.
  - Activity logging: call notes, meeting schedules, wholesale quotation links.

### 3.5. Module 5: Dynamic Enterprise Settings & RBAC (`/settings`)

- **Dynamic Company Profile (`res.company`):**
  - Live synchronization of company branding: logo, business legal name, tagline, email, phone/WhatsApp, physical address, and report footer directly from Odoo backend.
  - Zero code modifications or deployments required when company identity details update.
- **Role-Based Access Control (RBAC) Matrix:**
  - Multi-tab navbar (`Inventory`, `CRM`, `Attendance`, `Settings`) and adaptive sidebar menus automatically filter out unauthorized options based on the authenticated user's `res.groups` memberships.

---

## 📊 4. Non-Functional Requirements (NFR)

1. **Performance:**
   - First Contentful Paint (FCP) < 1.0s.
   - Page transitions < 200ms using Server Components and cached client routes.
2. **Reliability & Data Consistency:**
   - Strict transactional atomicity via Odoo ORM. No orphaned inventory move lines.
3. **Responsive Design:**
   - Mobile-first optimization across 375px (smartphones), 768px (warehouse tablets), and 1440px+ (desktop workstations).
4. **Security:**
   - HTTPS mandatory via Caddy reverse proxy. Strict role separation between public QR scanners and authenticated staff.
