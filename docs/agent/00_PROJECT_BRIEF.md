# 00 — Project Brief

## Product

**Syailendra ERP** is a headless enterprise management system for Syailendra Group
(essential oils and natural commodities, brand **DDistillers**). A Next.js frontend
talks to an Odoo 18 Community backend over JSON-RPC 2.0.

- Repository: `erp-syailendra-group` (`Syailendra-Group/erp-syailendra-group`)
- Frontend: Next.js 16 App Router, TypeScript strict, shadcn/ui, Tailwind CSS v4
- Backend: Odoo 18.0 CE, PostgreSQL, custom addons `syailendra_scm` and `syailendra_region`
- Public site: traceability page `/trace/<lot_code>` reached by scanning QR labels

## Business drivers

| Driver | Detail |
| :--- | :--- |
| Replace fragmented tools | One system for master data, operations, and traceability |
| Single source of truth | Master data lives in Odoo, not in spreadsheets |
| Export readiness | ISO 22000, GMP, HACCP, COSMOS, Organic, EUDR expectations |
| Traceability | Backward (product to farm) and forward (harvest to customer) in one click |
| Fraud and adulteration control | QC gates, quarantine states, batch genealogy |

## Corporate structure

| Layer | Entity | Role |
| :--- | :--- | :--- |
| Holding | PT Syailendra Bumi Investama (SBI) | Strategy, finance and tax, HR, upstream traceability |
| Operating | PT Syailendra Pabrik Bersama (SPBA) | Distillation, warehouse, inventory |
| Operating | PT Syailendra Mahakarya Mendunia (SAMMEND) | Commercial (CRM), omnichannel, AI assistant |
| Holding | Syailendra Group (SG) | Sustainability and impact measurement, administration |
| Brand | DDistillers, Syailendra Nature, Syailendra Farm | Product and market brands |
| Community | Koperasi Emas Hijau | Farmer and distiller aggregation |

Entity order in every UI and query follows governance sequence:
`SG (1) → SBI (2) → SPBA (3) → SAMMEND (4)`.

## Product pillars

Pillar partitioning is functional, never per legal entity, because pillars can be
reallocated between entities:

| Code | Pillar | Primary entity | Route root |
| :--- | :--- | :--- | :--- |
| `ftm` | Finance and Tax Management | SBI | `/ftm` |
| `hrm` | Human Resource Management (HRIS) | SBI | `/hris`, `/hr`, `/employees` |
| `scm` | Supply Chain Management and Traceability | SBI | `/scm` |
| `wms` | Warehouse and Production | SPBA | `/wms`, `/inventory` |
| `crm` | Customer Relationship Management | SAMMEND | `/crm` |
| `dcm` | Distribution Channel Management | SAMMEND | `/dcm` |
| `ai` | AI Assistant (Nona Atsirich) | SAMMEND | `/ai` |
| `imm` | Impact Measurement Management | SG | `/imm` |
| `others` | Administration, regional master data, website | SG | `/others`, `/admin` |
| `mitra` | Partner portal (farmer and distiller capture) | SBI | `/mitra` |

## Users

Superadmin and executives, warehouse officers, QC and agronomists, sales
representatives, field operations staff, partner suppliers (portal), and the public
(QR scan).

## Non-negotiable rules

- Code, comments, commits, and technical documentation are written in English.
- No hardcoded UI text: all strings come from `next-intl` dictionaries, symmetric
  between Indonesian and English.
- No hardcoded credentials: configuration lives in `.env.local`; `.env.example`
  carries names only.
- Files stay below 300 lines; features are decomposed instead of grown.
- Every mutation validates input, and every claim of completion must be backed by
  executed verification.
