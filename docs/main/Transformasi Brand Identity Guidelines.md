# **🌿 Transformasi Brand Identity Guidelines: Syailendra Group (ERP Edition)**



*Spesifikasi Desain Visual, Token UI Antarmuka ERP \& Standar Multi-Entitas | 11 November 2026*

* Entitas: PT Syailendra Bumi Investama (Syailendra Group)
* Sistem Target: Unified Enterprise ERP (Next.js 16 + Odoo 18 CE)
* Dokumen Sumber: DDistillers Brand Guidelines.pdf \\rightarrow Syailendra Group (ERP Edition)
* Status Verifikasi: PRODUCTION READY (2 HALAMAN A4)



\---



Dokumen Brand Identity Guidelines telah berhasil ditransformasikan secara menyeluruh menjadi standar resmi Syailendra Group khusus untuk kebutuhan arsitektur antarmuka SYAILENDRA ERP (Next.js 16 + Odoo 18 Community Edition), portal korporat, serta dokumen eksekutif holding.

Seluruh elemen logo resmi (SG Monogram, Botanical Crown \& Leaf, serta tagline “Legacy of Nature Harmony”) telah diekstraksi, didekontaminasi secara matematis terhadap latar putih, dan direkayasa menjadi aset beresolusi tinggi untuk varian Primary (Latar Terang #FFFDEE) dan Secondary (Latar Gelap #004E52).



### 🎨 1. Matriks Token Desain \& Palet Warna Resmi ERP

Palet warna mempertahankan harmoni identitas alam dan wibawa korporat, sekaligus menyediakan token semantik yang siap dipetakan ke dalam globals.css / konfigurasi Tailwind CSS ERP:

|**Peran Semantik ERP**|**Nama Warna**|**Kode HEX**|**Nilai RGB**|**Pemetaan Komponen UI**|
|-|-|-|-|-|
|--primary|Tropical Green|#004E52|0, 78, 82|Sidebar navigasi utama, header tabel, tombol aksi primer (CTA).|
|--background|Warm White|#004E52|255, 253, 238|Kanvas dasar dashboard, kartu data formulir, latar modal dialog (eye comfort).|
|--accent|Accent Gold|#E8AE1E|232, 174, 30|Garis aksen seksi, penanda menu aktif, cincin fokus (focus ring), badge pending.|
|--success|Fresh Green|#AFCA0B|175, 202, 11|Status lot panen terverifikasi, koneksi Odoo 18 aktif, badge stok aman.|
|--foreground|Corporate Ink|#AFCA0B|17, 17, 17|Teks utama sel data grid, angka metrik KPI, label formulir wajib (strict required).|



##### 🏷️ Warna Simbolik Mahkota \& Monogram Logo:

* Forest Leaf Green: #0D4F1C (13, 79, 28) — Daun mahkota botani dan aksen heraldik alam.
* Metallic Heritage Gold: #C79935 (199, 153, 53) — Gradasi lengkung monogram 'G' dan urat daun emas.
* Corporate Charcoal Ink: #111111 (17, 17, 17) — Huruf 'S' monogram dan wordmark korporat.



### 🔤 2. Sistem Tipografi \& Hierarki UI Data-Intensif

Memadukan keanggunan serif untuk dokumen eksekutif dengan sans-serif geometris-humanis berdaya baca tinggi pada data grid padat:

|**Elemen Teks \& UI ERP**|**Typeface Resmi**|**Gaya / Weight**|**Ukuran Standar (Print \& Web)**|
|-|-|-|-|
|Judul Utama (H1 / Header Modul)|Libre Baskerville|Bold (700)|18pt – 22pt (24px – 28px)|
|Sub-judul (H2/H3 / Section Card)|Libre Baskerville / Public Sans|Bold / SemiBold|12pt – 14pt (16px – 18px)|
|Body Copy / Deskripsi Form|Public Sans|Regular (400)|10pt (14px, Line Height 1.5)|
|Data Table Cell / Form Input / Filter|Public Sans|Regular / Medium (500)|9pt – 9.5pt (12px – 13px)|
|Micro Text / Status Pill / Table Header|Public Sans|Medium / SemiBold (600)|8pt – 8.5pt (10px – 11px)|



#### 🧠 Alur Pemikiran, Analisis Desain \& Spesifikasi Teknis

* Restrukturisasi Halaman 2 (Zero-Waste Layout):

Pada dokumen asli DDistillers, Halaman 2 menyisakan \~80% ruang kosong (whitespace). Pada edisi Syailendra Group ERP ini, Halaman 2 ditingkatkan menjadi instrumen kerja teknis mencakup:

1. Aturan Clear Space: Ruang bebas minimal sekeliling logo setara tinggi mahkota daun (crown-leaf height).
2. Ergonomi Kanvas \& Rasio Kontras: Penegakan standar aksesibilitas WCAG AA (kontras minimal 4.5:1) pada tabel data dan penggunaan #FFFDEE untuk memitigasi kelelahan mata operator lapangan.
3. Tabel Do's \& Don'ts: Panduan penanganan aset vektor, larangan distorsi aspek rasio (\~1.27:1), dan panduan pemisahan monogram saja (standalone icon) untuk favicon / collapsed sidebar.
4. Arsitektur Multi-Entitas ERP: Penegasan peran holding PT Syailendra Bumi Investama (induk ERP \& HRIS), DDistillers (unit komersial \& farm-to-table traceability), serta Paguyuban Emas Hijau (kemitraan 200+ petani atsiri).
5. Developer CSS Quick-Reference: Blok variabel CSS siap pakai untuk globals.css.
* Konfigurasi CSS Desain Token (globals.css):

:root {

&#x20; /\* Brand Identity \& Primary Shell \*/

&#x20; --color-tropical-green: #004e52;  /\* Primary Brand: Sidebar, Header, CTA \*/

&#x20; --color-warm-white:     #fffdee;  /\* Surface Canvas, Form Card, Modal \*/

&#x20; --color-golden-yellow:  #e8ae1e;  /\* Accent Gold, Section Line, Active Ring \*/

&#x20; --color-fresh-green:    #afca0b;  /\* Verified Traceability, Odoo Online \*/



&#x20; /\* Monogram Crest \& Content \*/

&#x20; --color-heritage-green: #0d4f1c;  /\* Botanical Crown \& Leaf Fill \*/

&#x20; --color-metallic-gold:  #c79935;  /\* Monogram 'G' Gradient \& Leaf Veins \*/

&#x20; --color-corporate-ink:  #111111;  /\* Primary Data Table Value \& Labels \*/

}

* Aset \& Dokumen Tersimpan pada Sistem:
* File PDF Publikasi: /opt/data/Syailendra\_Group\_Brand\_Guidelines.pdf
* SSOT Obsidian Vault: /opt/data/obsidian-vault/Work/Syailendra/Syailendra\_Group\_Brand\_Guidelines.pdf
* Catatan Dokumentasi: /opt/data/obsidian-vault/Work/Syailendra/Syailendra\_Group\_Brand\_Guidelines.md
* Logo Varian Terang (PNG Transparan): /opt/data/assets/branding/syailendra\_logo\_primary\_light.png
* Logo Varian Gelap (PNG Transparan): /opt/data/assets/branding/syailendra\_logo\_secondary\_dark.png
* Monogram Icon (Favicon / Mini Sidebar): /opt/data/assets/branding/syailendra\_logo\_monogram\_only.png



### 🛡️ Ringkasan Do's \& Don'ts Penggunaan Logo pada ERP

* @Gunakan Aset Vektor / PNG Anti-Aliased: Terapkan logo resolusi tinggi pada halaman Login, Sidebar, Header Invoice, dan Dokumen Laporan.
* @Sesuaikan Varian Latar: Gunakan Secondary Logo (teks putih) pada sidebar gelap #004E52, dan Primary Logo pada latar terang #FFFDEE atau #FFFFFF.
* @Monogram Standalone: Izinkan pemotongan wordmark dan hanya menampilkan mahkota monogram SG untuk favicon browser (32x32px) atau collapsed sidebar.
* @Dilarang Distorsi Rasio: Jangan meregangkan atau memipihkan proporsi logo di luar aspek rasio asli (\~1.27:1).
* @Dilarang Modifikasi Warna: Jangan mengganti warna hijau daun, gradasi emas, atau jenis huruf korporat.
* @Dilarang Menghilangkan Tagline: Tagline “Legacy of Nature Harmony” wajib dipertahankan pada dokumen resmi dan antarmuka login.



### 💡 Kesimpulan \& Rekomendasi Arsitektural:

* Kesiapan Implementasi Frontend: Token CSS di atas dapat langsung disalin ke globals.css pada repositori ERP Next.js 16 (erp-syailendra-group) untuk menjaga konsistensi visual antara modul SCM Petani, master wilayah BPS, dan modul HRIS mendatang.
* Single Source of Truth (SSOT): Dokumen PDF dan catatan arsitektur telah terarsip rapi di Obsidian Vault pada direktori Work/Syailendra/.
* Deliverable Siap Unduh: Berkas PDF cetak resmi (publication-grade) 2 halaman A4 terlampir di bawah ini.

