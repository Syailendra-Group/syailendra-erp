# SECURITY.md — Protection Protocols & Data Governance

**Project:** ERP Syailendra Group (Headless Odoo 18 + Next.js 16)  
**Standard:** AI Developer Documentation Kit Standard

---

## 🔒 1. Secrets & Environment Isolation

1. **Never Commit Secrets:**
   - Kredensial Odoo (`ODOO_PASSWORD`, `ODOO_API_KEY`) hanya boleh berada di `.env.local` di server host VPS, berizin `chmod 600`.
   - `.env.local` wajib tercantum di `.gitignore`.
2. **Reverse Proxy & Header Security:**
   - Akses publik Odoo dilindungi oleh Caddy reverse proxy dengan TLS/HTTPS otomatis.
   - Sesi internal dienkripsi menggunakan cookie `HttpOnly; Secure; SameSite=Lax`.

---

## 🛡️ 2. Input Validation & Injection Prevention

1. **Zod Runtime Validation:**
   - Semua input user pada form transfer, mutasi, absensi, dan lead sales wajib melalui validasi Zod.
   - Dilarang mengirim payload mentah langsung ke Odoo RPC tanpa sanitasi.
2. **Double-Entry Constraint:**
   - Mencegah manipulasi stok buatan: seluruh penambahan/pengurangan stok harus melewati model transfer resmi (`stock.move` / `stock.picking`).

---

## 👁️ 3. Data Masking pada Public Route

1. **Aturan Route `/trace/[lot_code]`:**
   - Rute publik ini bebas diakses konsumen tanpa login.
   - **Data yang Boleh Ditampilkan:** Nama petani/kelompok tani, lokasi kebun, ketinggian, varietas, tanggal panen, sertifikasi mutu, tips penyeduhan.
   - **Data yang DILARANG Ditampilkan:**
     - Biaya pokok produksi / HPP (`standard_price`).
     - Total nilai transaksi Purchase Order (PO).
     - Margin keuntungan perusahaan.
     - Nomor HP pribadi petani.
