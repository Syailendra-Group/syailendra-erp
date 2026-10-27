# TESTING.md — Quality Assurance & Testing Standards
**Project:** ERP Syailendra Group  
**Standard:** AI Developer Documentation Kit Standard

---

## 🧪 1. Mandatory Pre-Commit Gates
Setiap developer atau AI Agent yang berkontribusi ke repositori ini wajib menjalankan 3 gerbang pengujian lokal sebelum melakukan commit:

```bash
# Gerbang 1: Code Formatting
npm run format

# Gerbang 2: Strict Type Checking (Zero Error Policy)
npm run typecheck

# Gerbang 3: Production Turbopack Compilation
npm run build
```

---

## 🔬 2. Integration Testing Rules
1. **Odoo RPC Integration:**
   - Setiap method service di `src/lib/odoo/models.ts` harus diuji dengan data sampel riil dari database `odoo_dev`.
   - Tangani skenario koneksi Odoo offline dengan graceful UI error banner (tidak boleh melempar unhandled crash / blank screen).
2. **Traceability Verification:**
   - Pengujian lot tracing harus memverifikasi bahwa query lot mengembalikan rantai lengkap dari *Incoming Receipt* hingga *Outgoing Delivery*.
