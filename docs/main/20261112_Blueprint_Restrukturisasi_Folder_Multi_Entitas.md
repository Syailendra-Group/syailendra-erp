---
title: "Blueprint Restrukturisasi Folder Multi-Entitas (SBI, SPBA, SAMMEND, SG)"
date: "2026-11-12"
author: "Kael (octadev)"
project: "ERP-Syailendra-Group"
version: "1.0.0-Fase1-Approved"
status: "Official Blueprint & Migration Mapping"
tags:
  - erp-syailendra
  - architecture-blueprint
  - multi-entity
  - folder-structure
  - clean-architecture
  - feature-sliced-design
  - phase-1-completed
---

# 🏛️ BLUEPRINT RESTRUKTURISASI FOLDER MULTI-ENTITAS
*A Clean Domain-Driven Folder Architecture for Syailendra Group ERP*

Dokumen ini adalah **Single Source of Truth (SSoT)** matriks relokasi seluruh berkas dan layer aplikasi ERP Syailendra Group, memisahkan domain operasional dan tata kelola berdasarkan 4 entitas bisnis resmi (*PT SBI*, *PT SPBA*, *PT SAMMEND*, dan *PT SG*) ditambah fondasi bersama (*Platform Core / Shared*).

---

## 🧭 1. Prinsip Desain & Aturan Penamaan (Naming Conventions)

1. **Entity Prefix Level:**
   - **`sbi/`** — **PT Syailendra Bumi Investama (Holding & Governance):**
     - `sbi/scm/` : Supply Chain Management & Full Traceability
     - `sbi/ftm/` : Finance & Tax Management (Odoo + Accurate)
     - `sbi/hrm/` : Human Resources Management & HRIS (Odoo `hr.*`)
     - `sbi/main/` : Executive Consolidated Overview, Announcements, Calendar
     - `sbi/others/` : Master Data Wilayah Indonesia (38 Prov, 514 Kab, 7288 Kec, 84210 Desa), Roles, Partners, Compliance
   - **`spba/`** — **PT Syailendra Pabrik Bersama (Operations & Manufacturing):**
     - `spba/wms/` : Warehouse Management System, Produksi, Ketel Suling, Karantina QC, Rak/Bin Gudang
   - **`sammend/`** — **PT Syailendra Mahakarya Mendunia (Commercial & Global Distribution):**
     - `sammend/crm/` : B2B Leads, Sales Pipeline, Global Orders, Sample Desk
     - `sammend/dcm/` : Distribution Channel Management (Marketplaces, Desty Omnichannel)
     - `sammend/ai/` : AI Agent Nona Atsirich (Customer Hotline 24 Jam, Meta API WhatsApp/Instagram)
   - **`sg/`** — **PT Syailendra Group (Impact & Sustainability):**
     - `sg/imm/` : Impact Measurement Management, Circular Economy, Beasiswa Kehidupan, Revitalisasi Lahan, SDGs
2. **Platform Core (Non-Entity Primitives):**
   - Tetap berada di layer root atau sub-namespace `auth/`, `components/`, `lib/`, `utils/`, `providers/`, `stores/` tanpa prefix PT untuk mencegah duplikasi kode reusable.
3. **URL Clean Routing Mandate (Next.js Route Groups):**
   - Menggunakan Route Groups bertanda kurung:
     - `src/app/[locale]/(dashboard)/(sbi)/scm/...` $\rightarrow$ URL: `/scm/...`
     - `src/app/[locale]/(dashboard)/(spba)/wms/...` $\rightarrow$ URL: `/wms/...`
     - `src/app/[locale]/(dashboard)/(sammend)/crm/...` $\rightarrow$ URL: `/crm/...`
     - `src/app/[locale]/(dashboard)/(sg)/imm/...` $\rightarrow$ URL: `/imm/...`

---

## 🗺️ 2. Matriks Relokasi Berkas Eksisting (Old Path $\rightarrow$ New Path)

### A. Layer Types (`src/types/`)
| Berkas Lama (Old Path) | Target Baru (New Path) | Domain & Keterangan |
| :--- | :--- | :--- |
| `src/types/scm/farmer.ts` | `src/types/sbi/scm/farmer.ts` | SCM Petani & Lahan |
| `src/types/scm/distiller.ts` | `src/types/sbi/scm/distiller.ts` | SCM Unit Penyulingan |
| `src/types/scm/material.ts` | `src/types/sbi/scm/material.ts` | SCM Katalog Material |
| `src/types/scm/supplier.ts` | `src/types/sbi/scm/supplier.ts` | SCM Master Supplier |
| `src/types/scm/supplier-category.ts` | `src/types/sbi/scm/supplier-category.ts` | SCM Kategori Supplier |
| `src/types/scm/harvest.ts` | `src/types/sbi/scm/harvest.ts` | SCM Sesi Panen |
| `src/types/hris/employee.ts` | `src/types/sbi/hrm/employee.ts` | HRM Data Karyawan |
| `src/types/hris/department.ts` | `src/types/sbi/hrm/department.ts` | HRM Departemen & Divisi |
| `src/types/others/country.ts` | `src/types/sbi/others/country.ts` | Regional Negara |
| `src/types/others/province.ts` | `src/types/sbi/others/province.ts` | Regional Provinsi |
| `src/types/others/regency.ts` | `src/types/sbi/others/regency.ts` | Regional Kabupaten/Kota |
| `src/types/others/district.ts` | `src/types/sbi/others/district.ts` | Regional Kecamatan |
| `src/types/others/village.ts` | `src/types/sbi/others/village.ts` | Regional Kelurahan/Desa |
| *Core Types (Tetap):* | `src/types/{auth, components, data, layout, index.ts}` | Primitives Bersama |

---

### B. Layer Schemas (`src/schemas/`)
| Berkas Lama (Old Path) | Target Baru (New Path) | Domain & Keterangan |
| :--- | :--- | :--- |
| `src/schemas/scm/farmer-schema.ts` | `src/schemas/sbi/scm/farmer-schema.ts` | Zod Skema Farmer |
| `src/schemas/scm/distiller-schema.ts` | `src/schemas/sbi/scm/distiller-schema.ts` | Zod Skema Distiller |
| `src/schemas/scm/material-schema.ts` | `src/schemas/sbi/scm/material-schema.ts` | Zod Skema Material |
| `src/schemas/scm/supplier-schema.ts` | `src/schemas/sbi/scm/supplier-schema.ts` | Zod Skema Supplier |
| `src/schemas/scm/supplier-category-schema.ts` | `src/schemas/sbi/scm/supplier-category-schema.ts` | Zod Skema Kategori |
| `src/schemas/scm/harvest-schema.ts` | `src/schemas/sbi/scm/harvest-schema.ts` | Zod Skema Panen |
| `src/schemas/hris/employee-schema.ts` | `src/schemas/sbi/hrm/employee-schema.ts` | Zod Skema Employee |
| `src/schemas/hris/department-schema.ts` | `src/schemas/sbi/hrm/department-schema.ts` | Zod Skema Department |
| `src/schemas/others/country-schema.ts` | `src/schemas/sbi/others/country-schema.ts` | Zod Skema Country |
| `src/schemas/others/province-schema.ts` | `src/schemas/sbi/others/province-schema.ts` | Zod Skema Province |
| `src/schemas/others/regency-schema.ts` | `src/schemas/sbi/others/regency-schema.ts` | Zod Skema Regency |
| `src/schemas/others/district-schema.ts` | `src/schemas/sbi/others/district-schema.ts` | Zod Skema District |
| `src/schemas/others/village-schema.ts` | `src/schemas/sbi/others/village-schema.ts` | Zod Skema Village |
| *Core Schemas (Tetap):* | `src/schemas/auth/auth-schema.ts` | Zod Login & Turnstile |

---

### C. Layer Services (`src/services/odoo/`)
| Berkas Lama (Old Path) | Target Baru (New Path) | Domain & Keterangan |
| :--- | :--- | :--- |
| `src/services/odoo/scm/farmer.service.ts` | `src/services/odoo/sbi/scm/farmer.service.ts` | Odoo RPC Farmer |
| `src/services/odoo/scm/distiller.service.ts` | `src/services/odoo/sbi/scm/distiller.service.ts` | Odoo RPC Distiller |
| `src/services/odoo/scm/material.service.ts` | `src/services/odoo/sbi/scm/material.service.ts` | Odoo RPC Material |
| `src/services/odoo/scm/supplier.service.ts` | `src/services/odoo/sbi/scm/supplier.service.ts` | Odoo RPC Supplier |
| `src/services/odoo/scm/supplier-category.service.ts` | `src/services/odoo/sbi/scm/supplier-category.service.ts` | Odoo RPC Kategori |
| `src/services/odoo/scm/public-trace.service.ts` | `src/services/odoo/sbi/scm/public-trace.service.ts` | Odoo RPC Public Trace |
| `src/services/odoo/hris/employee.service.ts` | `src/services/odoo/sbi/hrm/employee.service.ts` | Odoo RPC Employee |
| `src/services/odoo/hris/department.service.ts` | `src/services/odoo/sbi/hrm/department.service.ts` | Odoo RPC Department |
| `src/services/odoo/others/country.service.ts` | `src/services/odoo/sbi/others/country.service.ts` | Odoo RPC Country |
| `src/services/odoo/others/province.service.ts` | `src/services/odoo/sbi/others/province.service.ts` | Odoo RPC Province |
| `src/services/odoo/others/regency.service.ts` | `src/services/odoo/sbi/others/regency.service.ts` | Odoo RPC Regency |
| `src/services/odoo/others/district.service.ts` | `src/services/odoo/sbi/others/district.service.ts` | Odoo RPC District |
| `src/services/odoo/others/village.service.ts` | `src/services/odoo/sbi/others/village.service.ts` | Odoo RPC Village |
| *Core Services (Tetap):* | `src/services/odoo/{auth, client.ts}` | Autentikasi & RPC Base |

---

### D. Layer Actions (`src/actions/`)
| Berkas Lama (Old Path) | Target Baru (New Path) | Domain & Keterangan |
| :--- | :--- | :--- |
| `src/actions/scm/farmer.action.ts` | `src/actions/sbi/scm/farmer.action.ts` | Server Action Farmer |
| `src/actions/scm/distiller.action.ts` | `src/actions/sbi/scm/distiller.action.ts` | Server Action Distiller |
| `src/actions/scm/material.action.ts` | `src/actions/sbi/scm/material.action.ts` | Server Action Material |
| `src/actions/scm/supplier.action.ts` | `src/actions/sbi/scm/supplier.action.ts` | Server Action Supplier |
| `src/actions/scm/supplier-category.action.ts` | `src/actions/sbi/scm/supplier-category.action.ts` | Server Action Kategori |
| `src/actions/hris/employee.action.ts` | `src/actions/sbi/hrm/employee.action.ts` | Server Action Employee |
| `src/actions/hris/department.action.ts` | `src/actions/sbi/hrm/department.action.ts` | Server Action Department |
| `src/actions/others/country.action.ts` | `src/actions/sbi/others/country.action.ts` | Server Action Country |
| `src/actions/others/province.action.ts` | `src/actions/sbi/others/province.action.ts` | Server Action Province |
| `src/actions/others/regency.action.ts` | `src/actions/sbi/others/regency.action.ts` | Server Action Regency |
| `src/actions/others/district.action.ts` | `src/actions/sbi/others/district.action.ts` | Server Action District |
| `src/actions/others/village.action.ts` | `src/actions/sbi/others/village.action.ts` | Server Action Village |
| *Core Actions (Tetap):* | `src/actions/auth/auth.action.ts` | Login Action |

---

### E. Layer Hooks (`src/hooks/`)
| Berkas Lama (Old Path) | Target Baru (New Path) | Domain & Keterangan |
| :--- | :--- | :--- |
| `src/hooks/scm/use-farmers.ts` | `src/hooks/sbi/scm/use-farmers.ts` | Hook TanStack Farmer |
| `src/hooks/scm/use-distillers.ts` | `src/hooks/sbi/scm/use-distillers.ts` | Hook TanStack Distiller |
| `src/hooks/scm/use-materials.ts` | `src/hooks/sbi/scm/use-materials.ts` | Hook TanStack Material |
| `src/hooks/scm/use-suppliers.ts` | `src/hooks/sbi/scm/use-suppliers.ts` | Hook TanStack Supplier |
| `src/hooks/scm/use-supplier-categories.ts` | `src/hooks/sbi/scm/use-supplier-categories.ts` | Hook TanStack Kategori |
| `src/hooks/hris/use-employees.ts` | `src/hooks/sbi/hrm/use-employees.ts` | Hook TanStack Employee |
| `src/hooks/hris/use-departments.ts` | `src/hooks/sbi/hrm/use-departments.ts` | Hook TanStack Department |
| `src/hooks/others/use-countries.ts` | `src/hooks/sbi/others/use-countries.ts` | Hook TanStack Country |
| `src/hooks/others/use-provinces.ts` | `src/hooks/sbi/others/use-provinces.ts` | Hook TanStack Province |
| `src/hooks/others/use-regencies.ts` | `src/hooks/sbi/others/use-regencies.ts` | Hook TanStack Regency |
| `src/hooks/others/use-districts.ts` | `src/hooks/sbi/others/use-districts.ts` | Hook TanStack District |
| `src/hooks/others/use-villages.ts` | `src/hooks/sbi/others/use-villages.ts` | Hook TanStack Village |
| *Core Hooks (Tetap):* | `src/hooks/{auth, shared, use-data-table-url-state.ts, use-mobile.ts}` | Shared Hooks |

---

### F. Layer Contexts (`src/contexts/`)
| Berkas Lama (Old Path) | Target Baru (New Path) | Domain & Keterangan |
| :--- | :--- | :--- |
| `src/contexts/scm/*` | `src/contexts/sbi/scm/*` | Context Farmer, Distiller, Material, Supplier, Kategori |
| `src/contexts/hris/*` | `src/contexts/sbi/hrm/*` | Context Employee, Department |
| `src/contexts/others/*` | `src/contexts/sbi/others/*` | Context Country, Province, Regency, District, Village |
| `src/contexts/main/*` | `src/contexts/sbi/main/*` | Context Global Search |

---

### G. Layer Features (`src/features/`)
| Berkas Lama (Old Path) | Target Baru (New Path) | Entitas & Pilar |
| :--- | :--- | :--- |
| `src/features/scm/*` | `src/features/sbi/scm/*` | **PT SBI (SCM)** |
| `src/features/hris/*` | `src/features/sbi/hrm/*` | **PT SBI (HRM)** |
| `src/features/ftm/*` | `src/features/sbi/ftm/*` | **PT SBI (FTM)** |
| `src/features/main/*` | `src/features/sbi/main/*` | **PT SBI (Main)** |
| `src/features/others/*` | `src/features/sbi/others/*` | **PT SBI (Others)** |
| `src/features/wms/*` | `src/features/spba/wms/*` | **PT SPBA (WMS)** |
| `src/features/crm/*` | `src/features/sammend/crm/*` | **PT SAMMEND (CRM)** |
| `src/features/dcm/*` | `src/features/sammend/dcm/*` | **PT SAMMEND (DCM)** |
| `src/features/ai/*` | `src/features/sammend/ai/*` | **PT SAMMEND (AI)** |
| `src/features/imm/*` | `src/features/sg/imm/*` | **PT SG (IMM)** |
| *Core Features (Tetap):* | `src/features/auth/login/*` | Authentication Login Feature |

---

### H. Layer Messages (`src/messages/{id,en}/`)
| Direktori Lama (Old Path) | Target Baru (New Path) | Keterangan |
| :--- | :--- | :--- |
| `messages/{id,en}/scm/*` | `messages/{id,en}/sbi/scm/*` | Kamus Bilingual SCM |
| `messages/{id,en}/hris/*` | `messages/{id,en}/sbi/hrm/*` | Kamus Bilingual HRM |
| `messages/{id,en}/ftm/*` | `messages/{id,en}/sbi/ftm/*` | Kamus Bilingual FTM |
| `messages/{id,en}/main/*` | `messages/{id,en}/sbi/main/*` | Kamus Bilingual Main |
| `messages/{id,en}/others/*` | `messages/{id,en}/sbi/others/*` | Kamus Bilingual Others |
| `messages/{id,en}/wms/*` | `messages/{id,en}/spba/wms/*` | Kamus Bilingual WMS |
| `messages/{id,en}/crm/*` | `messages/{id,en}/sammend/crm/*` | Kamus Bilingual CRM |
| `messages/{id,en}/dcm/*` | `messages/{id,en}/sammend/dcm/*` | Kamus Bilingual DCM |
| `messages/{id,en}/ai/*` | `messages/{id,en}/sammend/ai/*` | Kamus Bilingual AI |
| `messages/{id,en}/imm/*` | `messages/{id,en}/sg/imm/*` | Kamus Bilingual IMM |
| *Core Messages (Tetap):* | `messages/{id,en}/{common, auth}` | Kamus Global & Login |

---

### I. Layer App Router (`src/app/[locale]/(dashboard)/`)
| Direktori Rute Eksisting | Target Route Group Baru | URL Publik (Browser) |
| :--- | :--- | :--- |
| `(dashboard)/scm/*` | `(dashboard)/(sbi)/scm/*` | `/scm/...` *(Tetap Bersih)* |
| `(dashboard)/ftm/*` | `(dashboard)/(sbi)/ftm/*` | `/ftm/...` |
| `(dashboard)/hris/*` | `(dashboard)/(sbi)/hrm/*` | `/hris` atau `/hrm` |
| `(dashboard)/overview/*` | `(dashboard)/(sbi)/overview/*` | `/overview` |
| `(dashboard)/others/*` | `(dashboard)/(sbi)/others/*` | `/others/...` |
| `(dashboard)/wms/*` | `(dashboard)/(spba)/wms/*` | `/wms/...` |
| `(dashboard)/crm/*` | `(dashboard)/(sammend)/crm/*` | `/crm/...` |
| `(dashboard)/dcm/*` | `(dashboard)/(sammend)/dcm/*` | `/dcm/...` |
| `(dashboard)/ai/*` | `(dashboard)/(sammend)/ai/*` | `/ai/...` |
| `(dashboard)/imm/*` | `(dashboard)/(sg)/imm/*` | `/imm/...` |

---

## 🔒 3. Temuan Pra-Audit Mutu (Quality Gate Findings) untuk Fase 5

Dari proses audit awal terhadap 110+ berkas sebelum pergerakan berkas, kami menemukan 2 berkas yang melebihi batas Rule 6 (< 300 baris):
1. `src/features/others/villages/form/index.tsx`: **315 baris**
2. `src/features/others/provinces/form.tsx`: **308 baris**

*Solusi Perbaikan:* Pada Fase 3 & Fase 5, formulir ini akan didekomposisi modular menjadi sub-komponen terpisah di dalam direktori `form/` masing-masing, sehingga seluruh berkas mematuhi batas < 300 baris secara mutlak.
