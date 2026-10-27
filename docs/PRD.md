# PRD.md — Product Requirements Document: ERP Syailendra Group
**Version:** 1.0.0 (MVP)  
**Author:** Octa & Kael

---

## 🎯 1. Objective
Membangun platform enterprise resource planning (ERP) terintegrasi berbasis web untuk Syailendra Group yang mengelola komoditas bernilai tambah (kopi spesialti, hasil perkebunan) dengan fokus tertinggi pada **Ketertelusuran Rantai Pasok (*Farm-to-Table Traceability*)**, monitoring stok real-time, absensi karyawan, dan CRM prospek B2B.

---

## 📦 2. Scope of Modules
1. **Module 1: Inventory & Multi-Warehouse**
   - Monitoring saldo stok internal (`stock.quant`).
   - Manajemen surat jalan penerimaan (*Receipts*) dan pengiriman (*Delivery*).
2. **Module 2: Upstream & Downstream Traceability**
   - Registrasi Lot/Batch panen (`stock.lot`).
   - QR Code kemasan dengan tampilan terpisah: Publik (Konsumen) vs Internal (Staf).
3. **Module 3: Daily HR Operations**
   - Absensi mandiri mobile-friendly (`hr.attendance`).
   - Formulir input laporan kerja harian karyawan.
4. **Module 4: B2B CRM (Colabo Style)**
   - Pipeline penjualan visual kanban drag-and-drop.
5. **Module 5: Role & User Management**
   - Manajemen hak akses checklist matriks via web interface.
