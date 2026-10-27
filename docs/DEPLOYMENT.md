# DEPLOYMENT.md — Infrastructure & Release Playbook
**Project:** ERP Syailendra Group  
**Standard:** AI Developer Documentation Kit Standard

---

## 🏗️ 1. Infrastructure Architecture
- **Host:** Ubuntu 24.04 (LXC Container VPS Dahono)
- **Container Stack:**
  - `code-server`: VS Code Web IDE (Port 8443 ➔ Caddy HTTPS `code.octalectzz.my.id`)
  - `odoo-web`: Odoo 18.0 Community Edition (Port 8069 ➔ `odoo.octalectzz.my.id`)
  - `odoo-db`: PostgreSQL 15 Alpine (Internal port 5432)
  - `octa-hub`: Docker bridge network terisolasi untuk komunikasi zero-latency.

---

## 🚀 2. Production Deployment Steps
1. **Pull Latest Changes:**
   ```bash
   git pull origin main
   ```
2. **Install & Build:**
   ```bash
   npm ci
   npm run build
   ```
3. **Process Management:**
   - Jalankan runtime menggunakan container standalone atau PM2 dengan alokasi resource maksimum 1.0 GB RAM.
