---
name: web-security-audit
description: Use when auditing website security, CMS, or defacement.
version: 1.0.0
author: Octa Hub
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [security, web, cms, audit, defacement, seo-spam, hardening]
    category: web
---

# Web & CMS Security Audit

Prosedur terstruktur untuk mengaudit postur keamanan website publik/internal, mengidentifikasi footprint CMS, serta mendeteksi dan meremediasi insiden penyusupan konten (*blackhat SEO keyword / backlink injection* atau *defacement*) secara defensif.

## When to Use
- Pengguna meminta audit keamanan pada domain website atau portal internal perusahaan.
- Terdeteksi indikasi teks aneh, backlink asing, atau cuplikan mesin pencari yang menyimpang dari profil asli domain.
- Dibutuhkan langkah remediasi teknis (*incident response*), pembersihan backdoor, dan *hardening* server web/CMS.

---

## 🔍 Prosedur Audit Bertahap (Step-by-Step)

### 1. Passive Reconnaissance & Origin Inspection
Lakukan inspeksi DNS dan konektivitas untuk memeriksa apakah target berada di balik WAF/reverse proxy atau mengekspos IP origin langsung:
```python
import socket
ips = socket.gethostbyname_ex("target.com")
# Jika IP milik penyedia hosting langsung (misal IDCloudHost, Niagahoster, Biznet),
# server asal rentan terhadap direct attack / bypass WAF.
```

### 2. HTTP Headers & CMS Fingerprinting
Periksa response header dan struktur cookie untuk mengidentifikasi web server dan CMS:
- **Banner Server:** Periksa header `Server` (misal `LiteSpeed`, `Apache`, `nginx`).
- **Joomla Signatures:**
  - Header `Expires: Wed, 17 Aug 2005 00:00:00 GMT` (tanggal rilis perdana Joomla).
  - Cookie sesi MD5 32 karakter (`<hash>=<hash>; path=/; HttpOnly; secure`).
  - Template paths: `/templates/protostar/` (frontend Joomla 3), `/administrator/templates/isis/` (admin Joomla 3).
  - Generator tag: `<meta name="generator" content="Joomla!..." />`.
- **WordPress Signatures:**
  - Header `Link: <.../wp-json/>; rel="https://api.w.org/"`.
  - Path `/wp-content/`, `/wp-includes/`, `/wp-login.php`.

### 3. Deteksi Stealth Defacement & SEO Spam Injection
Penyerang blackhat SEO sering menyembunyikan tautan judi/kasino agar tidak terlihat oleh mata pengunjung biasa namun terindeks penuh oleh web crawler mesin pencari:
- **Teknik CSS Off-Screen Positioning:**
  Cari elemen yang menggunakan styling negatif ekstrem:
  ```html
  <div style="position: absolute; left: -62235px;">
    <h2>Keyword Spam...</h2>
    <a href="https://malicious-link.com">Anchor</a>
  </div>
  ```
- **Teknik CSS Hidden Display:** `display: none;`, `visibility: hidden;`, `opacity: 0;`, `font-size: 0px;`.
- **Inspeksi Cuplikan Mesin Pencari:**
  Gunakan pencarian web untuk memeriksa deskripsi aktual yang diindeks oleh bot mesin pencari.

### 4. Audit Perimeter Akses & Security Headers
Periksa keberadaan header proteksi modern dan pintu masuk publik:
- **Pintu Masuk Terbuka:**
  - Periksa apakah direktori admin (`/administrator/` atau `/wp-admin/`) dapat diakses bebas tanpa proteksi IP/2FA.
  - Periksa apakah registrasi pengguna publik terbuka (`/register` atau `users/register`).
- **Matriks Security Headers:**
  - `Strict-Transport-Security` (HSTS): Mencegah SSL stripping.
  - `X-Frame-Options` / CSP `frame-ancestors`: Mencegah serangan clickjacking/framing.
  - `X-Content-Type-Options: nosniff`: Mencegah MIME-sniffing.
  - `Content-Security-Policy` (CSP): Membatasi eksekusi inline script asing.

---

## 🛠️ Playbook Remediasi (4-Phase Remediation)

### Fase 1: Isolasi & Pembersihan Konten (Immediate Action)
1. **CMS Module / Widget:** Hapus modul *Custom HTML* jahat dari panel administrator atau kosongkan record pada tabel database (contoh Joomla: `SELECT * FROM #__modules WHERE content LIKE '%-62235px%';`).
2. **Template File Integrity:** Periksa berkas `index.php` template aktif dari sisipan kode evaluasi dinamis (`eval`, `base64_decode`, `assert`).

### Fase 2: Audit File Backdoor & Web Shell
1. Cari berkas PHP yang dimodifikasi dalam rentang waktu tertentu di hosting:
   ```bash
   find /path/to/public_html/ -name "*.php" -mtime -30
   ```
2. Periksa direktori unggahan media (`/images/`, `/wp-content/uploads/`, `/cache/`, `/tmp/`). Keberadaan file `.php` pada direktori ini hampir selalu merupakan web shell backdoor.

### Fase 3: Hardening & Pengetatan Perimeter
1. **Tutup Registrasi Publik:** Matikan opsi registrasi publik jika portal hanya diperuntukkan bagi staf internal.
2. **Batasi Akses Direktori Admin:** Lindungi folder `/administrator` atau `/wp-admin` dengan whitelist IP atau HTTP Basic Auth (`.htpasswd`) pada `.htaccess`.
3. **Injeksi Security Headers:** Terapkan header keamanan standar pada konfigurasi `.htaccess` atau vhost server.

### Fase 4: Pemulihan SEO & Proteksi Jangka Panjang
1. **Google Search Console URL Inspection:** Lakukan *Request Indexing* ulang pada URL yang terdampak setelah pembersihan selesai agar Google segera merefresh cache pencarian.
2. **Integrasi Reverse Proxy / WAF:** Pasang Cloudflare untuk menyamarkan IP origin, mengaktifkan proteksi bot, dan memfilter request berbahaya di edge.

---

## ⚠️ Pitfalls & Lessons Learned
- **Jangan Hanya Menghapus Tampilan:** Menghapus teks spam dari database tanpa mencari file backdoor `.php` di filesystem akan menyebabkan website terinfeksi ulang dalam beberapa jam.
- **Waspada EOL CMS:** CMS yang telah mencapai *End-of-Life* (seperti Joomla 3.x) memiliki banyak celah keamanan yang tidak lagi dipatch. Rekomendasikan migrasi ke versi modern atau integrasi headless.
- **Gunakan Tool Pasif:** Dalam melakukan audit, prioritaskan inspeksi pasif (HTTP headers, source DOM, DNS) dan jangan pernah menggunakan teknik eksploitasi aktif pada sistem produksi.
