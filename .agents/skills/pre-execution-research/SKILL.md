---
name: pre-execution-research
description: "Use when receiving any task, prompt, or user instruction. Execute mandatory research-first protocol: search web, scan skills, inspect files, and explore Obsidian vault before action."
version: 1.1.0
author: "Octa Hub / JARVIS One"
license: MIT
metadata:
  hermes:
    tags:
      - octa-hub
      - research
      - protocol
      - context-first
      - workflow
      - evidence-discipline
    related_skills:
      - grounded-citations
      - always_rich-format_for-telegram
      - collab-protocol
      - octa-hub:docs
---

# Protokol Riset & Analisis Pra-Eksekusi (Research-First & Context-Deep Protocol)

## 📌 Prinsip Utama
Setiap kali menerima pesan, pertanyaan, tugas, atau perintah dari pemilik sistem (**Octa / OctaLectzz**), agen di seluruh profil ekosistem **Octa Hub** **DILARANG LANGSUNG MENGEKSEKUSI** aksi secara terburu-buru, spekulatif, atau berdasarkan asumsi dangkal.

Agen wajib menerapkan disiplin **Context-First & Evidence-Based Architecture**: mengumpulkan bukti faktual, menelusuri konteks historis, dan merumuskan analisis komprehensif sebelum mengeksekusi perubahan atau memberikan rekomendasi teknis.

---

## 🧭 5 Pilar Riset & Analisis Wajib

Sebelum menjalankan perintah apa pun, agen wajib menempuh 5 langkah investigasi terpadu:

```
[Inbound Prompt / Perintah dari Octa]
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Web & Internet Reconnaissance (Gateway 9Router)          │
│    - Cari dokumentasi resmi, standar industri terkini, API  │
│    - Validasi versi library, dependensi, dan rilis stabil   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Discovery & Pemuatan Skills Terkait                      │
│    - Telusuri `skills_list` untuk modul keahlian yang relevan│
│    - Muat SOP baku dengan `skill_view(name)`                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Inspeksi Berkas & Kode Sistem                            │
│    - Temukan file terkait via `search_files`                │
│    - Pelajari isi kode / konfigurasi riil via `read_file`   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Eksplorasi Single Source of Truth (Obsidian Vault)       │
│    - Bedah catatan di `/opt/data/obsidian-vault/`           │
│    - Pelajari konteks historis, keputusan, & preferensi     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Analisis Strategis & Perancangan Solusi Berfase          │
│    - Identifikasi dependensi, risiko, dan dampak sistemik   │
│    - Siapkan rencana terstruktur sebelum mengeksekusi aksi  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
     [Eksekusi / Jawaban Terverifikasi dengan Akurasi Maksimal]
```

---

### 1. Web & Internet Reconnaissance (Gateway 9Router)
* **Kewajiban:** Manfaatkan gateway 9Router (`router.octalectzz.my.id`) melalui tools native `web_search` dan `web_extract`.
* **Objektif:**
  - Menemukan dokumentasi resmi vendor / framework.
  - Memverifikasi arsitektur modern, parameter konfigurasi, dan best-practice industri.
  - Membandingkan alternatif solusi jika terdapat trade-off teknis.
* **Standar:** Dilarang mengarang (*zero hallucination*). Jika ragu mengenai syntax, perilaku API, atau kapabilitas runtime, cari buktinya di internet.
* **Fallback & Anti-Stale Gate:** Jika tool native `web_search` mengalami kegagalan (misal: unconfigured/unregistered provider), **DILARANG KERAS** jatuh kembali ke memori parametrik bawaan LLM (yang terhenti di akhir 2024). Wajib gunakan fallback pemanggilan API langsung ke 9Router (`/v1/search`) via Python/`urllib.request` sesuai panduan di skill `9router-web-search`.

### 2. Discovery & Pemuatan Skills & MCPs (`skills_list`, `skill_view`, & Skills CLI)
* **Kewajiban:**
  - Pindai katalog internal via `skills_list` dan muat SOP baku dengan `skill_view(name)`.
  - **Muat Skill dengan Nama Datar:** Panggil `skill_view(name=...)` memakai nama skill datar seperti yang tercantum di `skills_list` (mis. `9router-web-search`), bukan jalur direktori bersarang (mis. `octa-hub/9router/9router-web-search`). Bentuk jalur mengembalikan `Skill not found` dan memaksa putaran pemuatan ulang yang sia-sia.
  - **Ekspansi Skill Eksternal (Skills CLI & skills.sh):** Ketika memasuki domain baru (seperti HRIS, Payroll, Akuntansi, SCM, CRM, dsb.), gunakan skill `find-skills` atau jalankan `npx skills find <domain>` dan `npx skills add <owner/repo>@<skill> -g -y` untuk menginstal modul keahlian teruji dari ekosistem open-agent.
  - **Audit & Penyelarasan MCP:** Periksa kapabilitas server MCP aktif dan status koneksi tool gateway (`manage_connections`) untuk memvalidasi ketersediaan tools native.
* **Objektif:**
  - Mematuhi SOP yang telah dirumuskan untuk domain terkait (misal: format Telegram, arsitektur n8n, deployment Docker, coding rules, dll.).
  - Menggunakan alur kerja teruji (*proven workflows*) dan wawasan domain spesialis daripada mereka-reka langkah kerja sendiri.

### 3. Inspeksi Berkas & Kode Sistem Aktif (`search_files` & `read_file`)
* **Kewajiban:** Jangan pernah mengubah atau menambahkan konfigurasi tanpa membedah struktur file yang ada.
* **Objektif:**
  - Menemukan lokasi file yang tepat menggunakan `search_files`.
  - Membaca dan menganalisis kode yang berjalan saat ini menggunakan `read_file` (periksa baris, imports, dependensi).
  - Memastikan kompatibilitas perubahan agar tidak merusak fungsi yang sudah stabil.

### 4. Eksplorasi Obsidian Vault (`/opt/data/obsidian-vault/`)
* **Kewajiban:** Vault Obsidian adalah Single Source of Truth (SSOT) ekosistem Octa Hub.
* **Objektif:**
  - Membedah catatan proyek, panduan arsitektur, catatan harian, dan ringkasan rapat di folder terkait.
  - Menghormati keputusan arsitektur sebelumnya (*architectural history*) dan preferensi pemilik yang sudah terdokumentasi.
  - Menjaga konsistensi data di seluruh domain (Commerce, Syailendra, Akademik, Infrastruktur).

### 5. Analisis Strategis & Rencana Eksekusi Berfase
* **Kewajiban:** Evaluasi seluruh temuan dari pilar 1–4.
* **Objektif:**
  - Membedakan dengan tegas antara **Fakta Terverifikasi**, **Asumsi**, **Hipotesis**, dan **Rekomendasi**.
  - Merumuskan rencana terstruktur (tahap demi tahap dengan *stop-gates* jika melibatkan operasi signifikan).
  - Melakukan tindakan verifikasi (*verification check*) terhadap hasil eksekusi sebelum menyatakan pekerjaan selesai.

---

### 6. Prosedur Khusus: Rekonsiliasi Status Progres & Kelanjutan Proyek (Resume & Handoff Prompts)
Ketika pengguna menanyakan status progres ("kemarin sampai mana?", "progres kita sekarang apa?", atau "apa yang akan kita lakukan selanjutnya?"), agen dilarang menjawab dengan kesimpulan umum atau spekulatif. Wajib jalankan 4 langkah rekonsiliasi:

1. **Pindai Kesepakatan Sesi Terakhir (`session_search`):**
   - Jalankan `session_search(limit=..., sort='newest')` untuk menemukan sesi paling mutakhir.
   - Baca pesan-pesan terakhir user untuk menangkap arahan terakhir, stop-gate yang telah disetujui, dan kesepakatan langkah lanjutan.
   - **Setelah kompaksi konteks, ID sesi di ringkasan biasanya adalah sesi yang sedang berjalan** — membacanya hanya mengembalikan pesan pasca-kompaksi. Cari dengan kata kunci (mode discovery) dan telusuri `parent_session_id` untuk riwayat sebelum kompaksi; jangan menyimpulkan rencana/kesepakatan hilang hanya karena bacaan langsung kosong.
2. **Audit Laporan Eksekusi SSOT (`search_files` + `read_file`):**
   - Cari berkas laporan terbaru di `/opt/data/obsidian-vault/Projects/<Project>/Docs/` (dengan parameter `order='modified'`).
   - **Laporan eksekusi terbaru sering berada di namespace profil, bukan di `Docs/` proyek.** Sebelum menyimpulkan "tidak ada laporan baru", urutkan juga `/opt/data/obsidian-vault/Profiles/<profile>/` beserta subfolder `Testing/` dan `Runbooks/` dengan `order='modified'`. Namespace profil memuat checkpoint dan laporan fase milik agen; `Docs/` proyek kerap hanya berisi plan/blueprint, sehingga urutan di sana berhenti lebih awal daripada posisi kerja sebenarnya.
   - **Discovery yang dikata-kunci dengan frasa pemilik sendiri kerap hanya mengembalikan sesi yang sedang berjalan setelah kompaksi.** Itu bukan bukti tidak ada sesi sebelumnya: pakai kata kunci domain/fase (nama modul, kode fase) alih-alih kalimat pemilik, dan jadikan Vault sebagai anchor posisi, bukan riwayat sesi.
   - Baca laporan hasil eksekusi terakhir (`Laporan_Hasil_*.md` atau `Laporan_*.md`) untuk mengekstrak data faktual yang telah selesai 100% dan teruji live.
   - **Frontmatter `status:`/`revision:` dokumen Plan bukan bukti posisi terakhir** — ia berhenti di revisi terakhir penulisnya sementara eksekusi bisa berjalan beberapa sesi lebih jauh. Urutkan `Docs/` dengan `order='modified'` dan baca laporan eksekusi paling baru; jangan membuka rencana yang statusnya paling "menunggu gate" lalu menyimpulkan itu titik berhenti.
   - **Anchor tercepat adalah ekor sesi terbaru:** `session_search(session_id=..., around_message_id=<id pesan terakhir>, window=...)`. Laporan terakhir yang benar-benar dikirim ke pemilik memuat daftar gate yang masih terbuka; `messages_after: 0` menandakan ujung sesi, jadi tidak ada kerja lanjutan yang terlewat.
   - **`skill_view` mengembalikan SELURUH isi skill, tapi `session_search` memotong.** Hasil discovery dibatasi ~`original_content_chars` per pesan; laporan eksekusi panjang terpotong persis di bagian "Outstanding/next steps" yang sedang dicari. Naikkan `window` (mis. 20) bila perlu, dan kalau hasil tool melebihi batas keluaran, hasil itu **tetap tersimpan** ke berkas spillover — baca berkasnya, jangan mengulang pencarian yang sama atau menyimpulkan bahwa laporan itu tidak memuat daftar gate.
3. **Verifikasi Status Repositori (Git) — bukan hanya `git log`:**
   - Periksa hash commit terakhir, branch target, dan deskripsi commit.
   - Jalankan `git status --short --branch` untuk melihat `ahead N`/`behind`, berkas `M`, dan direktori `??`. Laporan berstatus "Ready for Final Commit & Push" tidak membuktikan sudah di-push.
   - **Bandingkan baseline dokumen rencana dengan `HEAD`.** Rencana selalu mencatat commit awalnya; jika `git log --format='%h %ad %s' --date=format:'%m-%d %H:%M'` menunjukkan commit setelah baseline itu (mis. sub-fase yang dianggap "berikutnya" sudah bercommit), maka rencana tersebut **sudah dieksekusi melewatinya** — baca laporan eksekusi terbaru di `Docs/`, bukan menjalankan ulang sub-fase pertama. Working tree dengan belasan berkas `M`/`??` menandakan pekerjaan berhenti di tengah, bukan belum dimulai.
   - Periksa artefak kerja terakhir (`.scratch/`, `scripts/output/`, log build) dan urutkan berdasarkan mtime: berkas terbaru menunjukkan langkah yang sedang berjalan saat sesi terputus, termasuk harness/tooling yang belum masuk repo.
   - **Berkas `M` dengan mtime SETELAH commit terakhir bukan sisa pekerjaanmu.** Bandingkan `stat -c '%y %n' <file>` dengan waktu `git log -1`; bila lebih baru, itu edit pasca-commit (umumnya edit manual pemilik). Tampilkan diff-nya dan tanyakan pemilik: commit, pertahankan, atau kembalikan — jangan diam-diam meng-commit atau me-revert perubahan yang bukan buatanmu.
   - Bandingkan mtime build yang dilayani (`.next/BUILD_ID`) dengan waktu commit/edit terakhir: build lebih tua berarti perubahan terakhir belum tampil di demo, dan itu harus disebut sebagai temuan, bukan diasumsikan sudah live.
   - **"Kode ada di working tree" ≠ "fitur live".** Mtime berkas fitur lebih baru dari `BUILD_ID` membuktikan build tersaji memuat kode lama, tapi tidak membuktikan rute baru tidak dilayani. Buktikan dengan artefak build + probe HTTP pada rute baru (`curl -o /dev/null -w '%{http_code}'`): `404` pada rute yang seharusnya ada berarti fitur **belum dirilis**, bukan rusak — laporkan sebagai "tertulis, belum ter-build/ter-rilis".
   - **Sebut rute yang dilayani per path, jangan per status HTTP saja.** Endpoint aplikasi menjawab `307` untuk SETIAP path tak terautentikasi (termasuk path yang tidak ada), sehingga `307` membuktikan guard, bukan keberadaan rute; kombinasi `404` (rute belum ada) + `307` (rute ada tapi ter-guard) adalah dua bukti berbeda yang tidak boleh saling menggantikan.
4. **Verifikasi State Live, Bukan Laporan (WAJIB setelah migrasi/redeploy):**
   - Laporan berlabel "Completed & Verified" adalah potret environment saat laporan ditulis. Migrasi host, restore dump, atau pergantian database membatalkan klaimnya.
   - Probe sistem target secara read-only, lalu bandingkan angka di laporan dengan angka live. Setiap selisih dilaporkan eksplisit sebagai temuan dengan kedua angka, bukan diratakan atau didiamkan.
   - **Hitung field TERISI, bukan hanya keberadaan model/tabel/kolom.** Addon ter-upgrade dan halaman ter-render tidak membuktikan backfill dijalankan; `count(field IS NOT NULL)` sering jauh di bawah total record, sehingga fitur yang "sudah rilis" masih kosong secara fungsional. Inilah pembeda utama antara progres kode dan progres data.
   - **Rekonsiliasi katalog master terhadap jumlah seed resmi, lalu cetak barisnya.** Selisih hitung biasanya record uji dari smoke test UI yang bocor ke master produksi; laporkan sebagai temuan kebersihan data beserta jumlah pemakainya, bukan sebagai bagian katalog yang sah.
   - **Validasi ulang setiap gate/skrip yang mengantre sebelum menawarkannya sebagai langkah berikutnya.** Kolom yang di-drop oleh upgrade addon berikutnya membuat skrip backfill-nya gugur, dan backfill yang sudah dijalankan membuat angka dry-run lama kedaluwarsa — sebutkan statusnya (masih berlaku / perlu dry-run ulang / gugur), jangan menyalin antrian dari plan lama.
   - Resep probe read-only (Odoo via JSON-RPC **dan psql**, eksekusi remote, disiplin output): `references/live-state-verification.md`.
   - **Working tree yang memuat workstream yang tidak tercatat di SSOT adalah temuan, bukan detail.** Rilis berhenti di tengah adalah kondisi paling umum saat kerja multi-wave diparkir, dan di situlah pekerjaan orang lain menumpuk: dependensi baru di `package.json`, rute login kedua, direktori `src/lib/<vendor>/`, atau kontainer layanan baru di host — semuanya tanpa satu baris pun di Vault. Deteksi dengan membandingkan mtime berkas "/baru" terhadap waktu commit terakhir (`find src addons -newermt '<commit time>'`) lalu menanyakan **siapa pemiliknya**: `git log -1 --format=%ad -- <path>`, apakah path-nya tercantum di plan aktif, dan apakah ada kontainer/layanan pendukungnya di host (`docker ps` di host yang benar). Tanpa itu, `git add` per-wave untuk fitur yang disetujui akan menyapu workstream asing ke dalam commit — dan menandai scope-nya secara eksplisit adalah satu-satunya cara mencegahnya.
   - **Sebut jumlah proses yang mungkin melayani port yang sama.** Probe HTTP saja tidak menentukan proses mana yang menjawab: dua `next-server` (salah satunya cwd `/app` di dalam kontainer, satu lagi cwd proyek) bisa hidup bersamaan sementara `ss -lptn 'sport = :3000'` menunjukkan hanya `docker-proxy`. Sebelum menjanjikan restart pada wave berikutnya, petakan PID → `readlink /proc/<pid>/cwd` → `BUILD_ID`, dan laporkan proses mana yang akan dibunuh.
5. **Sajikan Format Terstruktur (Dual-Section):**
   - **Bagian 1 — Status Progres Terakhir (Verified):** Capaian faktual yang telah selesai 100%, commit hash, status backend/infrastruktur, dan stabilitas antarmuka.
   - **Bagian 2 — Rencana Langkah Selanjutnya (Roadmap & Action Gate):** Roadmap bertahap yang telah disepakati bersama call-to-action konkret (misal: menunggu pengiriman dokumen spesifikasi, review rencana teknis sebelum eksekusi, dll.) sebelum melakukan perubahan kode apa pun.

### 7. Prosedur Khusus: Audit Ruang Lingkup Sebelum Menjanjikan Perubahan
Saat pengguna bertanya "apa saja yang akan diperbaiki/diubah?" atau meminta rencana perubahan, jawaban wajib berasal dari kondisi kode aktual, bukan dari roadmap atau laporan arsip:
1. **Peta rute & ukuran berkas:** `find src/app -type d` lalu `find <fitur> -name "*.tsx" | xargs wc -l`. Berkas 5–15 baris adalah stub, bukan fitur.
2. **Deteksi data palsu:** `grep -rln "mock\|demo-data" src` dan `grep -rho "demo\.[a-z]*" src | sort -u`. Halaman yang mengimpor mock belum terhubung ke backend.
3. **Deteksi schema terputus:** `grep -rhoE "<prefix>\.[a-z_.]+" src --include=*.ts --include=*.tsx | sort | uniq -c`. Nol referensi ke model backend baru berarti UI masih memakai model lama meski halaman tampak berfungsi.
4. **Akun & kredensial:** periksa service layer untuk sumber kredensial (env vs sesi user). Laporkan bila akun integrasi ternyata admin penuh — grup read-only tidak membatasi apa pun pada jalur itu.
5. **Sajikan tabel bukti:** halaman → status (nyata/stub/mock) → bukti `file:line`. Jangan menyebut sesuatu "akan diperbaiki" tanpa bukti kondisi awalnya.
6. **Audit komponen "reusable" sebelum dipakai ulang:** cari namespace terjemahan yang di-hardcode (mis. `useTranslations('scm.farmers')` di dalam `AddressSection`) dan dependensi implisit (store, cookie, context). Komponen yang mengunci namespace fitur lain akan menampilkan label salah atau gagal render saat dipindah; laporkan sebagai refactor kecil (prop `namespace` dengan default lama) di dalam rencana.
7. **Peta blast-radius rename sebelum menjanjikan rename:** untuk rename entitas (folder/berkas/rute/menu), grep setiap varian nama (kebab, camel, snake, singular/plural) di SEMUA layer arsitektur — `features/`, `services/`, `actions/`, `hooks/`, `schemas/`, `types/`, `contexts/`, `messages/{id,en}/` beserta peta impor `i18n/request.ts`, rute `app/[locale]/`, `sidebar-data.ts`/`nav.json`, dan `revalidatePath` di actions — lalu sajikan tabel berkas-terdampak per layer dalam rencana; rename yang dijanjikan tanpa peta ini menyisakan referensi rusak yang baru ketahuan saat build.
8. **Audit konsumen identifier yang pernah dinormalisasi:** setelah migrasi/rename ref atau prefix (mis. `FMR-*` → `SUP-*`), grep SETIAP konsumen yang masih memfilter prefix lama (`grep -rn "like.*'<PREFIX>%" src`) di seluruh layer. Normalisasi ref dapat mengosongkan sumber data modul lain secara diam-diam — service yang memfilter prefix lama hanya menyisakan beberapa baris (bahkan record non-target), sementara halamannya tetap tampak berfungsi karena memakai data mock. Laporkan setiap konsumen rusak dengan `file:line`, dan verifikasi field diskriminator (m2m kategori, `supplier_type`) benar-benar terisi sebelum dijadikan sumber filter baru.
9. **Verifikasi temuan sub-agent/audit sebelum dimasukkan ke rencana.** Ringkasan sub-agent adalah *self-report*, bukan fakta terverifikasi. Untuk setiap klaim defect/temuan, buka sendiri barisnya (`sed -n 'A,Bp' <file>`) dan kutip `file:line` di rencana; klaim yang tidak dapat direproduksi dibuang, klaim yang terbukti ditandai "terverifikasi ulang", dan kecurigaan arsitektural (mis. arah refactor yang disarankan) wajib diuji terhadap blast-radius nyata — sebuah saran yang lebih kecil pun bisa salah bila mengabaikan konsumen hilir. Sebutkan **cakupan** yang diperiksa (mis. "repo + 2 addon + `ir_ui_view` + `ir_filters`"), bukan klaim nol-dependensi mutlak.
   - **Audit membaca sesuai brief-nya, bukan seluruh berkas.** Setelah memverifikasi baris yang dikutip, sisir sendiri sisa artefak yang sama: temuan defect yang material kerap berada di baris tetangga yang tidak masuk lingkup brief (mis. pemetaan atribut default untuk seluruh populasi, kunci de-duplikasi yang memakai nilai yang bisa berubah, key respons yang tidak seragam). Tandai temuan tambahan itu sebagai milikmu — jangan digabungkan seolah berasal dari audit, karena pembaca akan mengira cakupan audit sudah seluas itu.
10. **Re-audit laporan audit lama sebelum merencanakan perbaikan.** Temuan audit adalah potret titik waktu: sebelum menyusun rencana perbaikan dari audit sebelumnya, verifikasi ulang SETIAP temuan terhadap kode terkini (`grep`/`sed` per temuan), karena pekerjaan di antara dua audit bisa menutup sebagian besar temuan — dan beberapa temuan adalah false positive by construction (form tanpa tombol submit itu benar bila tombol dimiliki komponen dialog bersama; "X hilang" bisa berarti "X dipindah ke pemilik yang benar"). Sajikan tabel temuan → status hari ini (tertutup / false positive / masih terbuka) → bukti `file:line` terkini, bukan daftar temuan arsip yang disalin mentah.

11. **Pulihkan kesepakatan sebelum merencanakan restrukturisasi.** Sebelum menyusun rencana yang mengubah struktur menu, model data, atau tata letak, cari kesepakatan sebelumnya via `session_search` (kata kunci dari struktur yang diusulkan) dan baca dokumen spesifikasi bisnis proyek (mis. `docs/*.docx` di root repo). Kode yang berjalan bisa mewujudkan konsep yang sudah digantikan keputusan lebih baru — verifikasi model domain terhadap SSOT dan riwayat kesepakatan, bukan terhadap sidebar, route, atau halaman saat ini; rencana yang hanya mengikuti kondisi kode dapat memasukkan entitas yang sudah dilebur menjadi nilai atribut pada entitas lain, dan melewatkan grup/struktur yang sudah disepakati.

### 8. Prosedur Khusus: Turn Plan-Only (Tanpa Perubahan)
Saat pengguna meminta rencana dan menegaskan "jangan membuat perubahan apa pun sampai disetujui", seluruh riset wajib **read-only**:
1. Boleh: `read_file`, `search_files`, `skills_list`, `skill_view`, `web_search`, `tool_search`, dan perintah baca seperti `git status`, `git log`, `git ls-tree`, `find`, `grep`, `wc -l`.
2. Dilarang: perubahan **sistem** — `write_file`/`patch` pada kode, konfigurasi, skema, atau skrip; instalasi skill/MCP/dependency; `git add|commit|push|rebase`; restart layanan; atau perubahan database — termasuk yang terlihat "kecil" atau "membantu". **Pengecualian:** menulis dokumen rencana itu sendiri (markdown di Obsidian Vault, mis. `Docs/<tanggal>_Plan_*.md`) adalah deliverable turn plan-only dan diperbolehkan — dokumen bukan perubahan sistem. Saat keputusan pemilik masuk, PERBARUI dokumen yang sama (naikkan field `revision`), jangan buat berkas baru per revisi atau per sub-fase. Bila pemilik mengalihkan arah rencana (mis. dari fitur baru ke perbaikan), tandai seksi fitur sebagai **diparkir** di dokumen yang sama — jangan menghapus rencana yang sudah disetujui — dan re-audit backlog perbaikan terhadap kode terkini sebelum mengusulkan eksekusi.
3. Jika instruksi yang sama juga meminta "cari dan install skill/MCP", selesaikan konflik ke arah no-change: cari kandidatnya (skills.sh / katalog tool), laporkan nama, sumber, dan perintah instalasinya, lalu tunda instalasi sampai disetujui.
4. Nyatakan eksplisit di awal jawaban bahwa ini plan-only dan tidak ada yang diubah, **sertakan bukti tanpa-perubahan** (`git rev-parse --short HEAD` + hitungan `git status --porcelain` per status + `find src addons -newermt '-<n> minutes'` yang harus kosong), lalu tutup dengan daftar keputusan bernomor yang dibutuhkan sebelum eksekusi (stop-gate).
5. **Instruksi terbaru mengalahkan persetujuan yang lebih lama, meski keduanya datang dalam satu pesan.** Bila pemilik menjawab "ya" pada sebuah gate eksekusi (mis. build/restart/deploy) lalu di pesan yang sama menegaskan "jangan membuat perubahan apa pun untuk saat ini", gate itu TIDAK boleh dijalankan pada turn tersebut. Pindahkan aksinya menjadi langkah pertama fase eksekusi di dokumen rencana, dan sebutkan eksplisit bahwa persetujuan sudah ada tetapi ditunda karena instruksi no-change — jangan diam-diam mengeksekusi atas nama persetujuan lama, dan jangan pula membatalkan persetujuan itu.
6. **Jawaban afirmatif tunggal atas pertanyaan majemuk hanya menutup bagian yang bisa dijawab "ya".** Bila satu nomor keputusan memuat dua pertanyaan (mis. "keluarkan seksi X? dan seksi Y masuk fase 1 atau 2?"), jawaban "ya" tidak memilih fase. Kunci bagian yang jelas, lalu ajukan sisa yang belum terjawab sebagai nomor keputusan baru di turn berikutnya — jangan menebak opsi yang tidak pernah dipilih pemilik.

### 9. Prosedur Khusus: Gate Persetujuan Commit & Push (Wajib)
Persetujuan rencana, fase, atau push sebelumnya **tidak** berlaku untuk aksi berikutnya. Sebelum menyentuh riwayat Git:
1. Selesaikan implementasi + quality gate (typecheck, lint, prettier, build) lebih dulu.
2. Sajikan daftar berkas berubah, `git diff --stat`, pesan commit usulan, dan hasil gate — lalu **berhenti dan tunggu persetujuan commit**.
3. Setelah commit, berhenti lagi dan tunggu **persetujuan push terpisah**, kecuali pemilik menyebut commit dan push dalam satu instruksi.
4. Perintah baca (`git status`, `git diff`, `git log`, `git ls-remote`) selalu boleh; `git add|commit|push` tidak.
5. Stage path eksplisit (jangan `git add -A`) agar perubahan eksternal yang belum di-commit tidak ikut terbawa; laporkan terbuka bila ada perubahan yang bukan berasal dari pekerjaan ini.
6. Jika instruksi menyebut "jangan commit dan push dulu", akhiri dengan status working tree + verifikasi read-only, bukan commit.
7. **Stage path per workstream, dan pastikan dulu workstream itu milikmu.** Prasyarat staging: setiap path yang akan di-`git add` sudah diklasifikasikan ke pekerjaan tersetujui, dan berkas yang muncul setelah commit terakhir tapi tidak ada di plan/report aktif dipisahkan atau ditanyakan dulu ke pemilik. Working tree puluhan entri kerap memuat pekerjaan besar pihak lain (integrasi auth/cloud baru, dependensi baru) yang tidak boleh ikut terkirim ke dalam commit fitur.

### 10. Prosedur Khusus: Validasi Angka Rencana terhadap Data Live (Read-Only)
Rencana migrasi, klasifikasi, atau rekonsiliasi apa pun yang memuat **angka** (total baris, distribusi per kategori, target terisi/kosong) wajib divalidasi ke sumber data nyata **sebelum dijanjikan** — dan angkanya **dihitung ulang**, bukan disalin dari ringkasan/kompaksi/laporan sebelumnya.
1. **Jangan warisi angka.** Ringkasan sesi dan laporan arsip bisa memuat hitungan yang salah (mis. klaim "0 kategori yatim" padahal ada 2 yang tak berkategori). Selalu hitung ulang dari SSOT.
2. **Pisahkan logika keputusan menjadi fungsi murni.** Ekstrak pemetaan/kategorisasi ke fungsi tanpa I/O (tanpa Odoo/HTTP/DB) sehingga bisa diuji offline dan dijalankan ulang berkali-kali.
3. **Ekspor baris secara read-only.** `BEGIN TRANSACTION READ ONLY;` lalu agregasi kolom penentu (mis. `string_agg` nama kategori per partner); simpan TSV ke scratch, jangan ke repo.
4. **Jalankan fungsi murni atas data ekspor** dan bandingkan dengan angka di rencana; cetak PASS/FAIL **per target**, bukan hanya total — total yang cocok bisa menyembunyikan distribusi yang salah.
5. **Bila berbeda, perbaiki rencananya lebih dulu**, lalu sebutkan kedua angka (klaim vs aktual) di laporan sebagai temuan eksplisit — jangan diratakan atau didiamkan. Klaim operasional yang **tidak lagi terukur** (mis. laju pertumbuhan disk, laju akumulasi data) ditandai `superseded / tidak terkonfirmasi` **di dalam dokumen rencana**, bukan dihapus diam-diam: dokumen itu dibaca lintas sesi, sehingga klaim basi yang hilang tanpa jejak akan dipakai ulang sebagai fakta.
6. **Gate plan-only tetap berlaku:** ekspor read-only + fungsi lokal bukan perubahan sistem, jadi boleh di turn tanpa-perubahan.
*Alasan:* angka distribusi yang belum diverifikasi menghasilkan migrasi yang salah klasifikasi, dan kesalahannya baru terlihat setelah data ditulis ke produksi.

### 11. Prosedur Khusus: Sebelum Merestrukturisasi Master/Reference Data yang Dipakai Bersama
Model referensi yang sudah beredar (kategori mitra, tag, tabel lookup) sering menjadi **sumber taksonomi implisit** bagi kode lain. Sebelum meratakan, memindah, atau mengganti modelnya:
1. **Grep kode yang membaca nama/display-name-nya, bukan hanya field-nya:** cari pemakaian prefix/parsing nama (`grep -rn "startswith\|split('/')\|=like\|like.*'[0-9]"` pada `scripts/`, `src/`, addon). Importer/seed generator sering menurunkan kode bisnis (mis. segmen `SUP-EO-080`) justru dari prefix nama kategori.
2. **Cari pemetaan prefix→arti** (`PREFIX_RULES` dan sejenisnya) dan seeder yang me-lookup baris master lewat prefix; keduanya akan rusak diam-diam bila taksonomi diubah.
3. **Cek efek rerun:** importer yang membuat/menemukan baris berdasarkan `(nama, parent)` akan **membangun ulang hierarki** yang baru saja diratakan, atau membuat duplikat.
4. **Hitung blast-radius relasi:** jumlah baris yang bertumpu pada model tersebut (m2m/m2o) menentukan apakah "scope terkecil" masih benar-benar kecil.
5. **Pilih model baru bila tujuannya konsep berbeda.** Field `Selection` bersifat *code-defined* dan tidak dapat dikelola dari UI; master yang harus bisa ditambah/diubah pengguna wajib berupa model tersendiri. Menimpa model referensi yang sudah terpakai hanya sah bila poin 1–4 terbukti aman.
*Alasan:* usulan yang tampak paling hemat ("cukup ratakan kategorinya") justru dapat merusak alokasi kode, seeder, dan ratusan relasi sekaligus — dan kerusakannya baru terlihat setelah data ditulis.

---

## 🚫 Larangan Keras (*Anti-Patterns*)
1. ❌ **Gegabah / Blind Execution:** Langsung mengeksekusi perintah terminal (`terminal`, `execute_code`, dll.) atau langsung menulis file (`write_file`, `patch`) tanpa memeriksa file asli atau membaca konteksnya.
2. ❌ **Fabrikasi & Spekulasi:** Mengasumsikan status layanan, endpoint API, atau port tanpa verifikasi faktual di sistem.
3. ❌ **Abaikan Dokumentasi:** Mengabaikan skill atau catatan di Obsidian Vault yang sebenarnya sudah mengatur SOP tugas tersebut.
4. ❌ **Over-Confidence:** Menjawab "sudah selesai" atau "berhasil" tanpa menguji output riil dari tool yang dijalankan.
5. ❌ **Spekulasi Status / Amnesia Konteks:** Menjawab pertanyaan "sampai mana progres kita" secara generik tanpa memeriksa `session_search` dan laporan terbaru di Obsidian Vault, menyebabkan agen mengulang pertanyaan yang sudah terjawab atau kehilangan arah roadmap yang sudah disepakati pemilik.
6. ❌ **Laporan-Dianggap-State:** Menyatakan "sudah selesai/terpasang/ter-seed" berdasarkan laporan arsip tanpa probe live. Laporan arsip hanya bukti historis; status hari ini harus diukur dari sistem yang berjalan.
7. ❌ **Laporan Sub-Agent Dianggap Fakta:** Memasukkan temuan agen/delegasi ke rencana atau laporan tanpa membuka sendiri sumbernya. Self-report bisa salah cakupan maupun salah isi — verifikasi dulu, baru kutip.
