# TASK_INSTRUCTION.md — Step-by-Step Engineering Checklist

**Project:** ERP Syailendra Group  
**Standard:** AI Developer Documentation Kit Standard

---

## 📋 Standard Task Workflow

### Fase 1: Discovery & Context Loading

- [x] Baca dokumen PRD, ARCHITECTURE, dan DESIGN di folder `docs/`.
- [x] Periksa `.skills/` untuk memastikan konvensi Next.js, shadcn, dan Tailwind v4 dipatuhi.
- [x] Query MCP Context7 jika menggunakan pustaka eksternal baru.

### Fase 2: Implementation Checklist (Sprint 1: App Shell Layout)

- [ ] Buat Route Group `(dashboard)` di `src/app/(dashboard)/layout.tsx`.
- [ ] Buat Navbar Header dengan Tab Navigasi:
  - `[ 📦 Inventory ]`
  - `[ 🎯 CRM ]`
  - `[ ⏰ Absensi ]`
  - `[ ⚙️ Settings ]`
- [ ] Buat Sidebar Adaptif yang berganti item menu sesuai tab navbar yang dipilih.
- [ ] Hubungkan Logo dan Nama Perusahaan dari `res.company` Odoo 18.

### Fase 3: Quality Gates & Verification

- [ ] Jalankan `npm run format`.
- [ ] Jalankan `npm run typecheck` (Pastikan 0 error).
- [ ] Jalankan `npm run build` (Pastikan Turbopack sukses).
- [ ] Commit perubahan dengan deskriptif pesan Git.
