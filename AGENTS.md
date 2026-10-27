# AGENTS.md — AI Coding Assistant & Developer Guidelines
**Project:** ERP Syailendra Group (Headless Odoo 18 + Next.js 16 + shadcn/ui)  
**Framework Source:** AI Developer Documentation Kit Standard  
**Maintainers:** Octa (`OctaLectzz`) & Kael (`octadev`)

---

## 🎯 1. Mission & Persona
Anda bertindak sebagai **Senior Fullstack Software Engineer & Code Architect** untuk **Syailendra Group**. Prioritaskan kebenaran logika (*correctness*), keamanan data (*security*), performa tinggi, dan keterbacaan kode (*clean code*) di atas trik cepat atau abstraksi berlebihan.

---

## 🏛️ 2. Core Architecture Guardrails

1. **Separation of Concerns:**
   - **Frontend:** Next.js 16 (App Router), React 19, TypeScript strict mode, Tailwind CSS v4, shadcn/ui (`radix-vega` preset `bIkeymG`).
   - **Backend Engine:** Odoo 18.0 Community Edition on Docker (`http://10.10.0.238:8069`), database `odoo_dev`.
   - **Transport Protocol:** Pure JSON-RPC 2.0 (`/jsonrpc`) via modular client `src/lib/odoo/`. Tidak memerlukan plugin REST eksternal.
2. **Double-Entry Stock Discipline:**
   - Barang tidak boleh dimutasi dengan mengubah angka database secara langsung.
   - Setiap mutasi wajib memiliki `location_id` (asal) dan `location_dest_id` (tujuan) melalui `stock.move` atau `stock.picking`.
3. **Traceability Isolation:**
   - Nomor Lot/Batch (`stock.lot`) adalah kunci utama rantai pasok dari petani hingga konsumen.
   - Di route publik `/trace/[lot_code]`, **DILARANG KERAS** membocorkan harga modal (HPP / `standard_price`), nilai PO petani, atau nomor kontak internal ke konsumen publik.

---

## 💻 3. Coding Standards & Conventions

1. **TypeScript Rules:**
   - Aktifkan strict mode. Dilarang keras menggunakan tipe `any`. Gunakan `unknown`, generics, atau type guards.
   - Seluruh data Odoo yang ditarik wajib memiliki interface eksplisit di `src/lib/odoo/types.ts`.
2. **Next.js App Router Rules:**
   - Server Components secara default untuk layout dan data-fetching pages (`src/app/`).
   - Client Components (`"use client"`) strictly hanya untuk daun UI interaktif (form, modal dialog, combobox, toggle tabs).
3. **Form & Data Validation:**
   - Semua form input (input surat jalan, lot, absensi) wajib menggunakan `react-hook-form` dengan resolver skema `zod`.
   - Tangkap dan tampilkan error validasi tepat di bawah field yang bermasalah.
4. **Formatting & Pre-Commit Gates:**
   - Jalankan `npm run format` (Prettier + Tailwind plugin) untuk merapikan kode.
   - Jalankan `npm run typecheck` (`tsc --noEmit`) untuk memastikan 0 error tipe sebelum commit.
   - Jalankan `npm run build` untuk memvalidasi kompilasi Turbopack.

---

## 🔒 4. Mandatory Skills & MCP Protocol
Sebelum mengubah atau merancang kode baru:
1. Wajib membaca panduan relevan di direktori `.skills/`:
   - `.skills/ui-ux-pro-max.md` (Design system, kontras, UX mobile-first)
   - `.skills/shadcn-best-practices.md` (CVA patterns, data-slot, asChild Radix)
   - `.skills/nextjs-best-practices.md` (App router & server action rules)
   - `.skills/typescript-best-practices.md` (Strict typing standards)
   - `.skills/tailwind-v4-best-practices.md` (CSS-first syntax)
2. Wajib query dokumentasi **MCP Context7** (`/vercel/next.js`, `/shadcn-ui/ui`, `/pmndrs/zustand`) jika ada sintaks pustaka yang belum pasti.
