---
name: octa-hub-telegram-format
description: "Use when generating reports, cron job briefs, digests, status updates, or monitoring summaries for Telegram. Enforces Bot API 10.3/10.4 rich formatting: italic cron header, full-width edge-to-edge divider lines (---), tight H1 header and subtitle without blank space, compact metadata with trailing hard breaks (Option B), native bullet lists with hanging indents (Option A), full markdown tables, expandable details, media embedding, in-message HTML widgets, ephemeral callbacks, and URL action buttons."
version: 3.2.0
author: Octavyan Putra Ramadhan (octalectzz), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [octa-hub, telegram, report, cron, digest, formatting, rich-messages, bot-api-10.4, widgets, tables, details, infrastructure, monitoring]
    related_skills:
      - always_rich-format_for-telegram
      - telegram-widgets
      - telegram-report-format
---

# Octa Hub Universal Telegram Report & Delivery Format (Bot API 10.3 & 10.4 Standard v3.2.0)

Standardisasi tata letak, tipografi, dan hierarki visual untuk seluruh **laporan berkala, briefing terjadwal (cron job), ringkasan status operasional, log audit, notifikasi broadcast, dan pengiriman media** yang dikirimkan oleh agen AI di lingkungan **Octa Hub** ke platform Telegram (baik Direct Message maupun Supergroup Forum Topics).

---

## 🎯 When to Use

**Mandatory load (owner rule):** load this skill with `skill_view` before EVERY Telegram message, and load the relevant `octa-hub*` skill before acting on any task. Reload any skill marked `[SKILL_PRUNED]` before relying on it — compression strips content, and guessing its rules is a compliance failure.

Gunakan skill ini setiap kali agen menghasilkan:
- **Laporan Otomatis & Terjadwal (Cron Jobs):** Daily AI News Briefing, Morning/Evening Academic Digest, pemantauan produk digital, atau rekap harian.
- **Laporan Infrastruktur & DevOps:** Status kesehatan VPS Dahono, metrik kontainer Docker, penggunaan sumber daya (CPU/RAM/Disk), dan audit keamanan jaringan (Atlas / `octainfra`).
- **Laporan Pipeline & Otomasi:** Status alur kerja n8n, sinkronisasi webhook, kesehatan server MCP, dan audit retry failure (Lyra / `octauto`).
- **Laporan Akademik & Perkuliahan:** Evaluasi silabus, jadwal deadline tugas, catatan praktikum laboratorium, dan kesiapan ujian UTS/UAS (Celine / `octasmart`).
- **Laporan Pertumbuhan & Bisnis:** Metrik konversi funnel Lynk.id, intelijen pasar digital product, retensi pelanggan, dan analisis pricing (Wen Yifan / `octagrowth`).
- **Laporan Media & Konten:** Analisis performa video pendek, watch time, retention curve, dan audit kampanye ContentRewards (Ryu / `octaclip`).
- **Laporan Tanggap Darurat & Insiden:** Laporan mitigasi downtime, pemulihan layanan, dan ringkasan post-mortem.
- **Pengiriman Media Interaktif:** Pengunggahan dokumen PDF, tabel spreadsheet rekapitulasi, infografis arsitektur, voice memo, atau aset video.

---

## 📐 Hierarki Visual & Aturan Tipografi Baku (v3.0.0)

Setiap laporan wajib mengikuti urutan hierarki format yang ketat agar pesan tampil elegan, profesional, padat informasi, dan nyaman dibaca (*scannable*) di antarmuka Telegram mobile maupun desktop:

### 0. Header Pembuka Cronjob & Garis Pemisah Penuh Edge-to-Edge (`---`)
* Untuk laporan yang dieksekusi secara otomatis oleh penjadwal cron (Hermes cron job atau sistem otomasi terjadwal), baris pembuka identitas tugas (`Cronjob Response: [Nama Job] (job_id: [id])`) **wajib dicetak miring (*italic*)** menggunakan tanda bintang tunggal `*...*`:
  ```markdown
  *Cronjob Response: Unified VPS Infrastructure & DevOps Health Report (`job_id: b524753dcbbb`)*

  ---
  ```
  *Single-tap copy:* Kode ID selalu dibungkus single-backtick `` `job_id: [id]` ``.
* **Garis Pemisah Penuh Edge-to-Edge (`---`):**
  - Tepat di bawah baris cron header, **wajib terdapat garis pemisah horizontal penuh `---`**.
  - **Sintaks Wajib:** Karakter `---` **WAJIB DIAPIT OLEH BARIS KOSONG** (`\n\n---\n\n`).
  - **Mekanisme Bot API 10.3:** Ketika `---` diapit baris kosong, Telegram Bot API merendernya secara native sebagai blok `divider` (`{"type": "divider"}`). Garis ini membentang 100% penuh dari batas tepi kiri balon chat hingga batas tepi kanan (*edge-to-edge*), menggantikan garis Unicode statis `━━━━━━━━━━━━━━━━━━━━━━`.
  - **Larangan Menempel Langsung (Setext Heading Trap):** DILARANG KERAS menempelkan `---` langsung di bawah teks tanpa baris kosong (`Teks\n---`), karena spesifikasi CommonMark akan mengubah baris teks di atasnya menjadi **Setext Heading (H2)** berukuran besar yang merusak tata letak.
* **Larangan Keras Heading Prefix & Underscore pada Baris Cron:**
  - **DILARANG MENGGUNAKAN HEADING PREFIX (`#`, `##`, `#####`):** Penggunaan prefix heading apapun pada baris ini otomatis memicu parser Telegram adapter mengonversi baris menjadi teks tebal yang mendominasi layar.
  - **DILARANG MEMBUNGKUS DENGAN UNDERSCORE (`_..._`):** Gunakan asterisk tunggal `*...*` untuk menghasilkan cetak miring murni tanpa membocorkan karakter underscore fisik.
* **Konfigurasi Runtime Mandatori (`cron.wrap_response: false`):**
  - Seluruh profil agen Octa Hub wajib mengaktifkan `cron.wrap_response: false` di `config.yaml` (`hermes -p <profile> config set cron.wrap_response false`) agar scheduler tidak menginjeksi wrapper bawaan yang usang.

* **Zona Waktu Cron Scheduler Hermes Agent (Local Timezone vs UTC):**
  - Penjadwal cron Hermes Agent (`cronjob_manage` / `jobs.json`) mengevaluasi seluruh ekspresi cron (`schedule.expr`, e.g. `0 5 * * *`) terhadap **zona waktu lokal profil** (`timezone: Asia/Jakarta` / UTC+7 / WIB), **BUKAN dalam UTC**.
  - Selalu daftarkan jam target secara langsung dalam waktu lokal WIB yang dituju (contoh: `0 5 * * *` untuk 05:00 WIB pagi).

---

### 1. Header Utama & Subjudul (Teks Besar & Menempel Tanpa Spasi)
* **Header Utama (H1 `#`):** Terletak tepat di bawah garis pemisah penuh `---` yang diselingi satu baris kosong.
* **STANDAR PENAMAAN JUDUL SPESIFIK KONTEN (CONTENT-SPECIFIC TITLING):**
  - Judul setiap laporan **WAJIB deskriptif dan mencerminkan isi aktualnya secara spesifik**, bukan nama proyek/job generik.
  - Untuk lini distribusi & pertumbuhan produk Octa Hub:
    - **Laporan Sesi Penayangan:** `# 📢 Laporan Distribusi Facebook Group — Sesi Pagi / Siang / Malam`
    - **Laporan Kurasi Materi:** `# 🎯 Laporan Produk Terpilih & Kurasi Template Pesan`
    - **Laporan Evaluasi/Audit Database:** `# 🔍 Laporan Audit & Rekonsiliasi Database Grup Facebook`
    - **Laporan Rekap Harian:** `# 📊 Laporan Rekapitulasi Harian Distribusi Facebook`
    - **Laporan Mingguan (Setiap Minggu):** `# 📈 Laporan Kinerja Mingguan Distribusi Facebook`
    - **Laporan Bulanan (Setiap Tgl 1):** `# 🏆 Laporan Konsolidasi Bulanan Distribusi Facebook`
* **ATURAN JEDA BARIS KRITIS (JUDUL & SUBJUDUL JANGAN DIKASI SPACE):**
  - Tepat di bawah judul utama (`# ...`), subjudul ditempatkan **LANGSUNG pada baris berikutnya TANPA baris kosong / tanpa spasi jeda**.
  - Format subjudul: disajikan dalam cetak miring `*Subjudul Penjelas | Waktu WIB*`.
  ```markdown
  # 🌐 Daily AI News Briefing
  *Frontier AI, Autonomous Systems & Enterprise Intelligence | Pukul 05:00 WIB*
  ```

---

### 2. Baris Metadata: Opsi B (Compact Hard-Break Ultra-Rapat)
* **ATURAN JEDA BARIS (SUBJUDUL DENGAN METADATA KASIH SPACE):**
  - Antara subjudul dan baris metadata **WAJIB diberi satu baris kosong (spasi jeda `\n\n`)**.
* **BARIS METADATA TANPA LABEL METADATA:**
  - **DILARANG KERAS** menulis label `Metadata:` atau `📋 Metadata:`. Baris metadata langsung dimulai dengan butir-butir atribut.
* **FORMAT OPSI B (COMPACT HARD-BREAK / SUPER RAPAT):**
  - Khusus seksi metadata, setiap baris **WAJIB diakhiri dengan dua spasi (`  \n`)** sebelum berganti baris.
  - Sintaks ini diparsing oleh Telegram Bot API 10.3 menjadi **satu blok `paragraph` tunggal** dengan jeda baris rapat (*line-height ~1.2x*).
  - Tampilan visual menjadi sangat padat, ringkas, rapi, dan tidak memboroskan ruang vertikal layar ponsel.
  - Setiap butir metadata diawali tanda `- ` di awal baris baru (penyesuaian standar preferensi owner agar tampilan lebih rapi dan konsisten dengan list Markdown).
  - Nilai individual (seperti semester, runner, scope) dibungkus backtick individual `` `...` `` untuk mendukung *single-tap copy*.
  - Tanggal menggunakan tag dinamis `<tg-time unix="..." format="wDT">`.
  - Status/target dibungkus highlight `==...==`.
  ```markdown
  - Semester: `5 (Teknik Informatika)`  
  - Tanggal: <tg-time unix="1792386000" format="wDT">19 Okt 2026, 05:00 WIB</tg-time>  
  - Runner: `octasmart`  
  - Target: ==UTS Persiapan==  
  ```
  *(Perhatikan: Terdapat 2 spasi kosong di ujung setiap baris sebelum enter).*

* **ATURAN KRITIS BATAS KARAKTER `<tg-time>` (MAKSIMAL 31 KARAKTER):**
  - **Batas Keras Telegram Bot API:** Teks fallback di antara `<tg-time>` dan `</tg-time>` **DILARANG MELEBIHI 31 KARAKTER** (`len(fallback_text) <= 31`).
  - **Pemicu Error & Degradasi Format:** Jika teks fallback melebihi 31 karakter (misalnya 32 atau 33 karakter akibat penulisan bulan lengkap `Rabu, 21 Oktober 2026, 05:00 WIB`), Telegram API langsung menolak pengiriman dengan status `400 Bad Request: RICH_MESSAGE_DATE_TOO_LONG`.
  - **Dampak Fatal Fallback:** Penolakan ini memicu adapter Telegram Hermes beralih ke jalur darurat legacy MarkdownV2 multi-chunk. Akibatnya, elemen `<details>`, `<summary>`, `<tg-time>`, dan tabel Markdown **gagal dirender sebagai rich message** dan rusak menjadi teks biasa (*plain text*).
  - **Format Aman Mandatori:** Selalu gunakan singkatan bulan 3 huruf (contoh: `Jan`, `Feb`, `Mar`, `Apr`, `Mei`, `Jun`, `Jul`, `Agu`, `Sep`, `Okt`, `Nov`, `Des`) atau hilangkan nama hari jika panjang teks mendekati batas:
    - *Benar (28 karakter):* `<tg-time unix="..." format="wDT">Rabu, 21 Okt 2026, 05:00 WIB</tg-time>`
    - *Benar (21 karakter):* `<tg-time unix="..." format="wDT">21 Okt 2026, 05:00 WIB</tg-time>`
    - *SALAH (32 karakter - PASTI DITOLAK):* `<tg-time unix="..." format="wDT">Rabu, 21 Oktober 2026, 05:00 WIB</tg-time>`
* **Pembatas Bawah Metadata:** Di bawah baris metadata terakhir, diselingi satu baris kosong (`\n\n`) lalu diikuti garis pemisah penuh `---`.

---

### 2.1. Daftar Butir Non-Metadata & Badan Laporan: Opsi A (Native List `- `)
* **ATURAN OPSI A UNTUK SELURUH DAFTAR BODY LAPORAN:**
  - Untuk seluruh daftar butir di luar seksi metadata (seperti daftar tugas, parameter teknis, poin berita, item checklist, indikator performa), **WAJIB menggunakan tanda strip `- ` di awal baris**.
  - Telegram Bot API membedahnya menjadi blok **`list` native** dengan label bullet `\u2022`.
  - **Keunggulan Mutlak (Hanging Indent):** Jika sebuah kalimat daftar cukup panjang dan membungkus (*wrap*) ke baris kedua, baris berikutnya akan **otomatis menjorok rapi secara sejajar (*hanging indent*)**, tidak jatuh di bawah simbol bullet!
* **ATURAN PEMISAH HORIZONTAL / INLINE (`|`):**
  - Jika sebuah kalimat, subjudul miring, baris metrik, atau sel tabel membutuhkan karakter pemisah mendatar, **WAJIB menggunakan garis tegak `|`** (atau koma `,`).
  - **DILARANG KERAS menggunakan simbol bullet `•` sebagai pemisah inline** di tengah kalimat atau antar frasa!
  - *Benar:* `*Senin, 19 Oktober 2026 | Pukul 05:00 WIB*`
  - *Salah:* `*Senin, 19 Oktober 2026 • Pukul 05:00 WIB*` (Pelanggaran!)
* **ATURAN MUTLAK DAFTAR DI DALAM KUTIPAN / BLOCKQUOTE (`>` & `<blockquote>` / `<blockquote expandable>`):**
  - Di dalam elemen kutipan / blockquote, **DILARANG KERAS menggunakan simbol bullet `• `**.
  - Setiap rincian poin, rekomendasi tindakan, atau butir catatan di dalam quote **WAJIB menggunakan penanda list standar Markdown `- `**.
  - *Alasan Teknis:* Karakter `• ` (Unicode U+2022) di dalam blockquote Telegram diperlakukan sebagai teks biasa (*softbreak*). Akibatnya, baris kedua dan seterusnya akan **melebur menyambung ke kalimat sebelumnya** di baris yang sama. Penanda `- ` diparsing sebagai entitas native `list` / `list_item` yang menjamin setiap butir selalu dimulai pada baris baru dengan *hanging indent* yang rapi.
  - *Benar (Markdown):*
    ```markdown
    > 💡 **Kesimpulan & Rekomendasi Tindakan**:
    > - Poin tindakan prioritas pertama...
    > - Poin tindakan prioritas kedua...
    ```
  - *Benar (HTML/Bot API Tag):*
    ```html
    <blockquote>💡 <b>Ringkasan Tugas (AI):</b>
    - Poin ringkasan pertama
    - Poin ringkasan kedua</blockquote>
    ```
  - *Salah:*
    ```markdown
    > 💡 **Kesimpulan**:
    > • Poin satu
    > • Poin dua (Menyambung sebaris di Telegram!)
    ```

---

### 3. Sub-judul / Kategori Modul (H2 `##` atau H3 `###`)
* Gunakan heading level 2 (`##`) untuk pembagian modul/seksi utama laporan.
* Gunakan heading level 3 (`###`) untuk sub-item bernomor (misalnya butir berita, daftar insiden, atau bab evaluasi).
* Ukuran teks subheader lebih tegas dari body text, tetapi proporsional di bawah H1.

---

### 4. Daftar Data, Metrik & Perbandingan (Tabel Markdown & Checklist)
* **Tabel Markdown Pipa Mandatori:**
  Seluruh data terstruktur multi-parameter disajikan menggunakan tabel pipa Markdown murni:
  ```markdown
  | Sesi | Mata Kuliah | Waktu (WIB) | Ruang | Dosen Pengampu | Akses |
  | :---: | :--- | :---: | :---: | :--- | :---: |
  | 1 | Pembelajaran Mesin (`ML (240624)`) | 08:00 – 10:30 WIB | `@lab.rpl` | Dr. Sri Huning Anwariningsih | Classroom |
  ```
* **Larangan Memangkas Kolom:** Dilarang memangkas kolom penting demi menghemat ruang horizontal, karena Telegram mobile mendukung geser horizontal (*horizontal scroll*) secara native pada tabel Markdown.
* **Standar Format Checklist Penugasan & Task Lists (Opsi A):**
  - Belum selesai/diserahkan: `- [ ] **[Judul Tugas]** — `Belum Diserahkan` ⏳ *(Tenggat: [Waktu])*`
  - Selesai/sudah diserahkan: `- [x] **[Judul Tugas]** — `Sudah Diserahkan` ✅`
  - Gunakan emoji jam pasir `⏳` dan bungkus status dengan backtick monospace `` `Belum Diserahkan` ``. Dilarang menggunakan emoji kotak `⬜` atau jam pasir mati `⌛`.

---

### 5. Deskripsi Panjang & Bukti Teknis (Accordion Buka/Tutup - `<details>`)
* Setiap ulasan mendalam, penjelasan latar belakang, rincian instruksi tugas, atau log eksekusi **wajib dibungkus dalam blok lipat interaktif**:
  ```html
  <details><summary>▶️ Rincian Analisis Teknis (Tap untuk Buka/Tutup)</summary>

  - **Latar Belakang:** Penjelasan komprehensif mengenai konteks pekerjaan...
  - **Spesifikasi Teknis:** Metrik mendalam dan parameter arsitektur...
  - **Tautan Dokumen:** 👉 [**📘 Unduh Modul Terkait ↗️**](https://...)

  </details>
  ```
* *Catatan:* Butir-butir di dalam accordion menggunakan tanda `- ` (Opsi A) dan diselingi baris kosong antar-paragraf agar rendering blok list tetap rapi di perangkat mobile.

---

### 6. Kesimpulan & Rekomendasi Tindakan (Blockquote Mandatori `> 💡 ...`)
* Setiap laporan terstruktur, briefing berkala, status monitoring, atau pengiriman terjadwal **WAJIB diakhiri dengan blok kesimpulan bergaris menggunakan format blockquote**:
  
  **Opsi 1: Format Narasi Tunggal (1-2 Paragraf Padat):**
  ```markdown
  > 💡 **Kesimpulan & Rekomendasi Tindakan**:
  > Sintesis padat 2–4 kalimat yang merangkum evaluasi operasional atau prioritas harian secara holistik, mengevaluasi ada/tidaknya anomali kritis, dan memberikan langkah tindakan konkret.
  ```

  **Opsi 2: Format Multi-Poin / Butir Rekomendasi (Wajib Gunakan `- `, Dilarang `• `):**
  ```markdown
  > 💡 **Kesimpulan & Rekomendasi Tindakan**:
  > - **Prioritas Utama:** Sintesis tindakan mendesak atau fokus harian utama.
  > - **Mitigasi Teknis:** Tindakan preventif atau perbaikan sistem.
  > - **Tindak Lanjut:** Langkah koordinasi atau eksekusi berikutnya.
  ```
* **PENTING (LARANGAN `• ` DI DALAM KUTIPAN):** Jika kesimpulan atau blok kutipan memuat daftar butir poin, **DILARANG KERAS menggunakan simbol `• `**. Setiap poin **WAJIB diawali tanda strip `- `** agar Telegram merendernya pada baris baru dengan *hanging indent* native dan tidak menyatu/melebur ke kalimat sebelumnya.

---

### 7. Garis Pemisah Antar-Seksi Penuh (`---`)
* Pisahkan blok informasi utama menggunakan garis pemisah penuh:
  ```markdown
  ---
  ```
  *(Pastikan selalu diapit baris kosong `\n\n---\n\n` agar diparsing sebagai native Telegram divider).*

---

### 8. 🖼️ Integrasi Media dalam Pesan (Media Engine Guidelines)

Laporan dan respons yang menyertakan aset visual, dokumen lampiran, suara, atau video wajib mengikuti panduan integrasi media berikut:

#### A. Mekanisme Runtime Hermes Agent (`MEDIA:`)
Hermes Agent mendukung pengiriman berkas media secara native melalui teks respons:
- **Foto / Tangkapan Layar:** Cantumkan `MEDIA:/path/ke/gambar.png` di baris tersendiri (format: `.png`, `.jpg`, `.jpeg`, `.webp`). Pesan teks yang menyertai otomatis dijadikan caption media.
- **Dokumen / Berkas Ekspor:** Cantumkan `MEDIA:/path/ke/laporan.pdf` (atau `.xlsx`, `.docx`, `.zip`). Ditampilkan sebagai dokumen terlampir native yang dapat diunduh.
- **Pesan Suara (Voice Bubble):**
  Tambahkan baris `[[audio_as_voice]]` tepat di atas baris `MEDIA:`:
  ```markdown
  [[audio_as_voice]]
  MEDIA:/opt/data/voice/briefing_harian.mp3
  ```
  Telegram otomatis merendernya sebagai **gelembung suara native (*voice bubble*)**, bukan file audio biasa.
- **Video:** Cantumkan `MEDIA:/path/ke/video.mp4` untuk memutar video secara inline di obrolan.

#### B. Mekanisme Skrip Backend Python (Telegram Bot API Resmi)
Jika laporan dikirimkan oleh skrip deterministik Python:
- **Foto dengan Caption:** Gunakan endpoint `https://api.telegram.org/bot<token>/sendPhoto` dengan multipart/form-data (`photo: open(path, 'rb')`) dan sertakan `caption` berformat HTML atau Markdown.
- **Dokumen Spreadsheet/PDF:** Gunakan endpoint `sendDocument` untuk mengirimkan ringkasan berkas ekspor Google Sheets atau PDF materi kuliah.

#### C. Sematan Video & Gambar Markdown Native (sendRichMessage `![alt](url)` Rules)
Ketika menggunakan sintaks Markdown media `![Alt Text / Caption](https://domain.com/video.mp4)` pada Telegram Bot API 10.3 (`sendRichMessage`):
- **Syarat Mutlak Direct Binary Streaming:** Crawler Telegram memvalidasi URL media secara langsung saat pesan diterima. Server penyimpanan **WAJIB** mengembalikan header biner HTTP:
  - `HTTP/1.1 200 OK` atau `206 Partial Content`
  - `Content-Type: video/mp4` (atau `image/png`, `image/jpeg`)
  - `Accept-Ranges: bytes` (wajib untuk video player agar streaming byte-range dapat di-buffer)
  - `Content-Length: <ukuran_byte>`
- **Pitfall Google Drive / Web Viewer Interstitials:**
  - Tautan web viewer Google Drive (`drive.google.com/file/d/.../view` atau tautan export `uc?export=download`), Dropbox, atau Box **BUKAN** direct binary stream. Tautan tersebut menyertakan proteksi web (HTTP 303 Redirect, handshake cookie, halaman konfirmasi antivirus untuk file besar, dan header `attachment`).
  - Menyematkan tautan web viewer ke dalam `![alt](url)` **PASTI GAGAL** di Telegram Bot API dengan kode error `HTTP 400 Bad Request: rich message must be non-empty` atau `RICH_MESSAGE_PHOTO_NO_MEDIA_FOUND`.
- **Solusi S3-Compatible Object Storage:** Selalu sajikan aset media video/gambar via Object Storage publik yang mendukung direct ingress (contoh: Dahono S3 `https://s3.dahono.com/<bucket>/...`, Cloudflare R2, atau Supabase Storage) dengan hak akses `public-read`.
- **Struktur Payload HTTP POST `sendRichMessage`:**
  Saat memanggil endpoint `sendRichMessage` secara langsung via HTTP, struktur body JSON **WAJIB** membungkus markdown di dalam objek `rich_message`:
  ```json
  {
    "chat_id": "-1004349640522",
    "message_thread_id": 253,
    "rich_message": {
      "markdown": "# Judul\\n\\n![Alt](https://s3.dahono.com/.../video.mp4)"
    },
    "reply_markup": { ... }
  }
  ```
  *(Catatan: Mengirim `{"chat_id": ..., "text": text}` ke endpoint `sendRichMessage` akan memicu error `rich message must be non-empty` karena parameter `rich_message` tidak ditemukan).*

#### D. Publikasi Aset ke Object Storage & Pengiriman ke Grup Mitra
Urutan baku ketika laporan harus membawa video/gambar yang bisa dipratinjau:
1. **Unggah lebih dulu, embed kemudian.** Pakai helper storage (`/opt/data/tools/asset_manager.py upload <file> --prefix <path>`) — kredensial ada di `/opt/data/credentials/assets_storage.env` (mode `0600`), jangan pernah dicetak atau ditempel ke perintah.
2. **Buktikan kelayakan URL sebelum menyematkannya** dengan satu permintaan byte-range: `curl -s -o /dev/null -D - -H "Range: bytes=0-1023" <url>` harus mengembalikan `206`, `Content-Type` yang benar, `Accept-Ranges: bytes`, dan `Content-Range: bytes 0-1023/<total>`. Satu `200` tanpa `Accept-Ranges` berarti player tidak akan ter-buffer.
3. **Sediakan thumbnail sendiri** (`ffmpeg -ss <detik> -frames:v 1 -vf scale=720:1280 -q:v 3`) dan sematkan sebagai `![Cover](<url>)` di dalam rich message — satu blok `photo` muncul di bubble tanpa perlu kirim foto terpisah.
4. **Kirim laporan rich + berkas native sebagai dua pesan** ke grup mitra: `send_rich_message(chat_id, content, thread_id=None, token=...)` dari `/opt/data/tools/topic_manager.py` (tombol aksi via `reply_markup.inline_keyboard`), lalu `sendVideo` multipart dengan `thumbnail`, `supports_streaming=true`, `width`/`height`/`duration` dan caption HTML agar video diputar inline.
5. **Verifikasi dari respons API, bukan dari asumsi**: cek `message_id`, dan untuk rich message periksa `rich_message.blocks` benar-benar memuat `table`/`details`/`photo`/`blockquote`. Blok yang hilang = render gagal, ulangi dengan penanda rich yang valid.
6. **Format & keamanan grup mitra:** supergroup non-forum (`is_forum` kosong) dikirim **tanpa** `message_thread_id`; forum dikirim dengan `message_thread_id` topiknya. Sebelum kirim, `getChat` + `getChatMember` untuk memastikan bot benar-benar admin/anggota. Arsipkan receipt (`message_id`, `file_id`, URL objek) ke log produksi proyek, bukan ke memori global.

> 📎 Resep lengkap (struktur key, verifikasi HTTP, skrip multipart, contoh blok rich) ada di `references/media-publishing-to-group.md`.

---

### 9. Navigasi, Action Buttons (Dual-Delivery) & Keamanan
* **Single-Tap Copy:** Seluruh perintah, command, path direktori file, hash commit, atau nama container wajib dibungkus single-backtick `` `/status` ``, `` `/opt/data/...` ``.
* **Sensor Kredensial:** Setiap token, password, atau kode verifikasi/OTP wajib disensor menggunakan spoiler Telegram: `||token_rahasia||`.
* **Zero Bare Links:** Dilarang keras mencantumkan URL mentah (`https://...`).
* **Standar Mandatori Dual-Delivery (Opsi A) untuk Akses Navigasi URL:**
  Wajib menerapkan strategi redundansi ganda di setiap laporan yang memuat URL tujuan (preferensi mutlak owner):
  1. **Native Inline Keyboard Button (Bawah Bubble Chat):** Wajib disematkan tombol melayang interaktif di bawah gelembung chat melalui properti `reply_markup` pada payload Telegram Bot API (`sendRichMessage` / `sendMessage`). Tidak boleh hanya mengandalkan tautan teks di dalam balon obrolan.
  2. **In-Bubble Action Button Link (Di Badan Pesan):** Di bawah kesimpulan, cantumkan tautan pointer tebal:
     `👉 [**<Emoji> <Label Tombol Deskriptif> ↗️**](https://...)`

* **Fitur Tombol Salin Teks Otomatis (Telegram CopyTextButton - Bot API 7.8+):**
  - **Kemampuan:** Telegram Bot API mendukung tombol salin langsung pada `inline_keyboard` menggunakan objek `copy_text`:
    `{"text": "📋 Salin Caption (1-Tap Copy)", "copy_text": {"text": "Teks yang disalin ke clipboard..."}}`
    Saat ditekan, teks di dalam `copy_text.text` otomatis disalin ke clipboard pengguna tanpa membuka URL eksternal.
  - **Batas Keras Panjang Karakter (Mandatori):** Properti `copy_text.text` **WAJIB berukuran 1 hingga 256 karakter**.
  - **Pitfall HTTP 400 BUTTON_COPY_TEXT_INVALID:** Jika teks melebihi 256 karakter (meskipun hanya 257 karakter), Telegram Bot API akan menolak seluruh payload dengan error `HTTP 400 Bad Request: BUTTON_COPY_TEXT_INVALID`.
  - **Strategi Implementasi Aman:**
    - Periksa panjang string sebelum menyematkan: gunakan tombol `copy_text` hanya jika `text.length <= 256`.
    - Jika teks naskah/caption melebihi 256 karakter, sajikan teks di dalam blok kode monospace (```` ```text ... ``` ````) pada badan pesan (misal di dalam `<blockquote expandable>`) karena aplikasi Telegram mendukung *single-tap to copy* pada blok kode tanpa batas 256 karakter.

* **Pitfall & Panduan Implementasi Tombol Melayang (Inline Keyboard) pada Cron Job:**
  - **Keterbatasan Hermes Auto-Delivery:** Jalur pengiriman otomatis scheduler Hermes (`deliver: telegram:<chat_id>:<topic_id>`) mengeksekusi pengiriman respons agen secara plain markdown ke `sendRichMessage` tanpa menyertakan objek `reply_markup`. Akibatnya, tautan di badan pesan (`👉 [**...**](url)`) TIDAK otomatis menjadi tombol melayang (*inline keyboard button*) di bawah bubble obrolan jika hanya mengandalkan auto-delivery scheduler.
  - **Pola Implementasi Mandatori untuk Tombol Melayang pada Cron:**
    1. **Skrip Runner Python (Pola Mandatori/Deterministik):** Gunakan skrip runner Python (misalnya di `/opt/data/profiles/<profile>/scripts/`) yang menyusun pesan dan menembak langsung ke Telegram Bot API (`sendRichMessage`) menggunakan fungsi `send_rich_message(chat_id, content, thread_id, reply_markup)` dari `/opt/data/tools/topic_manager.py`.
    2. **Payload `reply_markup`:** Sertakan struktur JSON inline keyboard eksplisit:
       `"reply_markup": {"inline_keyboard": [[{"text": "🌐 Label Tombol", "url": "https://..."}]]}`.
    3. **Konfigurasi Cron Job Hermes:** Setel opsi pengiriman job ke `deliver: local` (bukan `deliver: telegram:...`). Hal ini mencegah pesan ganda (*duplicate delivery*) karena skrip Python telah mengirimkan laporan lengkap bersama tombol melayang secara langsung ke Telegram.
    4. **Jika Menggunakan Agen LLM:** Jika job memerlukan penalaran dinamis agen, agen wajib memanggil skrip/tool pengirim Telegram di akhir langkah eksekusinya dan mengeluarkan respons hening (`[SILENT]`), bukan mengandalkan teks akhir scheduler untuk membuat tombol melayang.

* **Fitur & Standar Baru Telegram Bot API 10.4:**
  - **9.1. Balasan Ephemeral via Callback Tombol (`ephemeral_message_parameters`):**
    - Pada interaksi inline button di supergroup atau channel, bot dapat merespons penekan tombol dengan pesan rahasia yang HANYA terlihat oleh pengguna yang menekan tombol.
    - Cukup sertakan `ephemeral_message_parameters: {"callback_query_id": query_id}` pada payload `sendMessage` atau `sendRichMessage`.
    - Parameter `chat_id` dan `receiver_user_id` otomatis opsional.
    - Menghilangkan *chat pollution* di forum topics Octa Hub (`-1004349640522`), terutama saat verifikasi token, status pribadi, atau dialog konfirmasi.
  - **9.2. In-Message HTML Widgets (`sendWidget` & `telegram-widgets`):**
    - Untuk Command Center dan dashboard interaktif di obrolan pribadi (1-on-1 private chat), gunakan endpoint `sendWidget`.
    - Mendukung komponen HTML5, CSS kustom, dan logika JavaScript reaktif berbasis QuickJS lokal (`window.TelegramWidget`).
    - Update state in-place tanpa mengirim balon obrolan baru via `editMessageWidgetData` (per-pesan) atau `editSharedWidgetData` (shared).
    - Panduan dan SOP lengkap diatur pada skill `telegram-widgets`.
  - **9.3. Kutipan Rich Message Presisi (`quote_rich_texts`):**
    - Saat mengutip bagian dari pesan berformat kaya, gunakan properti `reply_parameters.quote_rich_texts` untuk mengutip blok entitas teks kaya (tabel, teks tebal, spoiler, math) secara terstruktur.

---

## 📑 Katalog Template Laporan Siap Pakai (Standar v3.0.0)

Berikut adalah template baku yang wajib diacu oleh masing-masing peran agen di Octa Hub:

### Template 1: Cron Job & Daily AI News Briefing (Universal / Central)

> ⚠️ **Aturan Mutlak Pencegahan Berita Kadaluarsa & Cutoff Hallucination:**
> - Agen WAJIB memverifikasi kebaruan berita menggunakan live web search (`9router` via native `web_search` atau direct fallback API ke `https://router.octalectzz.my.id/v1/search`).
> - DILARANG KERAS memalsukan tahun rilis (contoh: mengubah tanggal artikel akhir 2024 menjadi 2026) saat pencarian web bermasalah. Jika search gagal, gunakan fallback direct API atau laporkan kendala sistem secara transparan.
> - Setiap butir berita wajib diverifikasi timestamp publikasinya (maksimal 24–48 jam terakhir dari waktu eksekusi) sebelum dirangkum ke dalam briefing harian.

```markdown
*Cronjob Response: Daily AI News Briefing (`job_id: 210195584ec1`)*

---

# 🌐 Daily AI News Briefing
*Frontier AI, Autonomous Systems & Enterprise Intelligence | Pukul 05:00 WIB*

- ID: `210195584ec1`  
- Tanggal: <tg-time unix="1792108800" format="wDT">16 Okt 2026, 05:00 WIB</tg-time>  
- Runner: `jarvis`  
- Edisi: ==HARIAN==  

---

### 1. [Judul Berita 1 Lengkap, Informatif & Bernomor]
- **Waktu Rilis:** 15 Oktober 2026, 21:00 WIB
- **Sumber:** [Nama Media / Lab]
- **Domain:** LLM Architecture

<details><summary>▶️ Buka Rincian Berita & Spesifikasi Teknis</summary>

- **Konteks & Ringkasan Peristiwa:** Penjelasan mendalam mengenai latar belakang riset, lab yang merilis, metodologi, dan tujuan fitur/model baru.
- **Spesifikasi & Benchmark Teknis:** Data kuantitatif terukur mengenai metrik performa, skor evaluasi (MMLU, SWE-bench), kapasitas jendela konteks token, dan tarif inferensi API.
- **Signifikansi & Dampak Industri:** Analisis strategis mengapa rilis ini mengubah peta kompetisi dan dampaknya bagi implementasi engineering di ekosistem Octa Hub.
- **Rujukan Sumber:** 👉 [**🌐 Baca Publikasi Resmi di NamaMedia ↗️**](https://example.com/source)

</details>

---

### 2. [Judul Berita 2 Lengkap & Informatif]
- **Waktu Rilis:** 15 Oktober 2026, 18:30 WIB
- **Sumber:** [Nama Riset]
- **Domain:** Autonomous Agents

<details><summary>▶️ Buka Rincian Berita & Spesifikasi Teknis</summary>

- **Konteks & Ringkasan Peristiwa:** Penjelasan mendalam peristiwa dan inovasi.
- **Spesifikasi & Benchmark Teknis:** Metrik dan skor perbandingan benchmark.
- **Signifikansi & Dampak Industri:** Implikasi praktis dan efisiensi alur kerja.
- **Rujukan Sumber:** 👉 [**🌐 Baca Catatan Teknis di NamaLab ↗️**](https://example.com/source)

</details>

---

> 💡 **Key Takeaways & Implikasi Strategis**:
> Sintesis tajam 1-2 kalimat mengenai benang merah tren AI hari ini, pergeseran arsitektur komputasi, dan rekomendasi langkah adaptasi sistem.

👉 [**🌐 Kunjungi Portal Riset AI ↗️**](https://example.com)
```

---

### Template 2: Infrastruktur, VPS & DevOps Health (Atlas / `octainfra`)

```markdown
*Cronjob Response: Unified VPS Infrastructure & DevOps Health Report (`job_id: b524753dcbbb`)*

---

# 🛡️ Laporan Status Infrastruktur VPS Dahono
*Audit Kesehatan Sistem, Kontainer Docker & Keamanan Jaringan | Pukul 05:00 WIB*

- Scope: `Production`  
- Tanggal: <tg-time unix="1792108800" format="wDT">16 Okt 2026, 05:00 WIB</tg-time>  
- Runner: `octainfra`  
- Status: ==HEALTHY==  

---

## 📊 Metrik Sumber Daya Host
| Komponen | Kapasitas | Penggunaan | Status |
| :--- | :---: | :---: | :---: |
| CPU Load (1/5/15m) | 4 vCPU | 0.28, 0.35, 0.40 | Normal |
| RAM Fisik | 8.0 GB | 3.4 GB (42%) | Normal |
| NVMe Storage (`/`) | 100 GB | 38.2 GB (38%) | Aman |
| Swap Memory | 2.0 GB | 120 MB (6%) | Minimal |

---

## 🐳 Status Orkestrasi Kontainer Docker
| Layanan / Kontainer | Port Binding | Uptime | Status Kesehatan |
| :--- | :---: | :---: | :---: |
| `9router` | `20128:20128` | 14 hari | Healthy |
| `n8n-main` | `5678:5678` | 14 hari | Healthy |
| `postgres-n8n` | `5432:5432` | 14 hari | Healthy |
| `hermes-gateway` | `9119:9119` | 4 hari | Running (PID `452782`) |

<details><summary>▶️ Log Pemeriksaan Jaringan & Firewall UFW (Buka/Tutup)</summary>

```text
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)

To                         Action      From
--                         ------      ----
22/tcp (SSH)               ALLOW IN    Anywhere
80/tcp (HTTP)              ALLOW IN    Anywhere
443/tcp (HTTPS)            ALLOW IN    Anywhere
20128/tcp (9Router)        ALLOW IN    10.0.0.0/8 (Internal NAT)
```
- [x] Tidak ada port debugging publik yang terbuka tanpa otorisasi.
- [x] Fail2ban aktif memantau percobaan brute-force SSH.

</details>

---

## 📝 Rekomendasi Tindakan DevOps
- [x] Snapshot backup berkala berjalan sesuai jadwal cron.
- [ ] Jadwalkan rotasi file log gateway yang melebihi batas 50 MB.

---

> 💡 **Kesimpulan & Evaluasi Operasional**:
> Kondisi infrastruktur VPS Dahono dan orkestrasi kontainer berjalan dalam kapasitas prima tanpa anomali beban. Seluruh port publik terlindungi firewall UFW.

👉 [**📊 Buka Dashboard Monitoring Grafana ↗️**](https://dashboard.octalectzz.my.id)
```

---

### Template 3: Alur Kerja n8n & Otomasi AI (Lyra / `octauto`)

```markdown
*Cronjob Response: Automated Workflow & Integration Health Check (`job_id: 89412a8f01b2`)*

---

# ⚡ Laporan Eksekusi Otomasi & Alur Kerja n8n
*Integritas Webhook, Eksekusi Pipeline & Status Server MCP | Pukul 12:00 WIB*

- Instance: `n8n.octalectzz.my.id`  
- Tanggal: <tg-time unix="1792108800" format="wDT">16 Okt 2026, 12:00 WIB</tg-time>  
- Runner: `octauto`  
- Status: ==OPTIMAL==  

---

## 📈 Rekapitulasi Eksekusi 24 Jam Terakhir
| Nama Alur Kerja (Workflow) | Trigger | Total Runs | Sukses | Gagal | Latensi Rata-rata |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `AI News Feed Crawler` | Cron | 24 | 24 | 0 | 4.2s |
| `Google Sheets Sync` | Webhook | 158 | 158 | 0 | 1.1s |
| `Email Inbound Triage` | IMAP | 42 | 41 | 1 | 2.8s |

<details><summary>▶️ Rincian Insiden & Retry Log Workflow Gagal</summary>

- **Workflow:** `Email Inbound Triage`
- **Penyebab Kegagalan:** Rate-limit sementara dari upstream provider saat parsing payload besar.
- **Mitigasi Otomatis:** Retry loop kedua berhasil mengirimkan data ke Google Sheets pada percobaan t+30s.

```json
{
  "executionId": "89412",
  "status": "success_after_retry",
  "retryCount": 1
}
```

</details>

---

## 🔌 Ketersediaan Server Host MCP
- [x] `context7` (Docs & Libraries): Responsif (< 120ms)
- [x] `deepwiki` (Academic Wiki KB): Responsif (< 180ms)
- [x] `wolfram` (Computational Engine): Aktif

---

> 💡 **Kesimpulan & Rekomendasi Tindakan**:
> Pipeline otomasi n8n beroperasi stabil dengan tingkat keberhasilan 98.6%. Satu kegagalan transient berhasil ditangani mekanisme auto-retry tanpa kebocoran data.

👉 [**⚡ Buka Konsol Otomasi n8n ↗️**](https://n8n.octalectzz.my.id)
```

---

### Template 4: Akademik, Tugas & Rencana Studi (Celine / `octasmart`)

```markdown
*Cronjob Response: Morning Academic Briefing (`job_id: 4b5b89b77055`)*

---

# 🎓 Laporan Manajemen Studi & Kesiapan UTS/UAS
*Senin, 19 Oktober 2026 | Pukul 05:00 WIB*

- Semester: `5 (Teknik Informatika)`  
- Tanggal: <tg-time unix="1792386000" format="wDT">19 Okt 2026, 05:00 WIB</tg-time>  
- Runner: `octasmart`  
- Target: ==UTS Persiapan==  

---

## 📅 Jadwal Perkuliahan Hari Ini
| Sesi | Mata Kuliah | Waktu (WIB) | Ruang | Dosen Pengampu | Akses |
| :---: | :--- | :---: | :---: | :--- | :---: |
| 1 | Pembelajaran Mesin (`ML (240624)`) | 08:00 – 10:30 WIB | `@lab.rpl` | Dr. Sri Huning Anwariningsih, ST., M.Kom | Classroom |
| 2 | Internet of Things (`IOT (240622)`) | 13:01 – 15:30 WIB | `@408` | Diyah Ruswanti, S.Kom., M.Kom. | WhatsApp |

### 📋 Checklist Penugasan Sesi Hari Ini
- [ ] **Pre Test Supervised Learning** — `Belum Diserahkan` ⏳ *(Tenggat: Tanpa Tenggat Waktu)*
- [ ] **Post test Supervised learning** — `Belum Diserahkan` ⏳ *(Tenggat: 15/09/2026, 23:59 WIB)*

---

## 📋 Radar Penugasan Classroom Belum Diserahkan
| Mata Kuliah | Topik / Judul Tugas | Tenggat Waktu | Status |
| :--- | :--- | :---: | :---: |
| DL (240632) | TUGAS PERTEMUAN 06 | 22/10/2026, 23:59 WIB | `Belum Diserahkan` ⏳ |
| ML (240624) | Pre Test Supervised Learning | Tanpa Tenggat Waktu | `Belum Diserahkan` ⏳ |

<details><summary>▶️ Rincian Tugas: DL (240632)</summary>

- **Mata Kuliah:** Deep Learning / Neural Networks (`DL (240632)`)
- **Dosen Pengampu:** Hardika Khusnuliawati, S.Kom., M.Kom.
- **Tenggat Pengumpulan:** 22/10/2026, 23:59 WIB
- **Instruksi Dosen & Deliverables:**
  Kumpulkan berkas PDF jawaban (DL06_NIM_NamaLengkap.pdf) dan tautan Google Colab (Viewer access).
- **Tautan Tugas:** 👉 [**🏛️ Buka Google Classroom Tugas ↗️**](https://classroom.google.com/...)

</details>

---

> 💡 **Kesimpulan & Rekomendasi Tindakan**:
> Fokus akademik hari ini: Ikuti perkuliahan tepat waktu dan prioritaskan penyelesaian **TUGAS PERTEMUAN 06 Deep Learning**. Gunakan `/tugas` untuk pendampingan pengerjaan atau `/jadwal` untuk memantau kalender kuliah.

👉 [**📊 Buka Google Spreadsheet Tracker ↗️**](https://docs.google.com/spreadsheets/d/...)  
👉 [**🏛️ Buka Google Classroom ↗️**](https://classroom.google.com)
```

---

### Template 5: Digital Product & Funnel Growth (Wen Yifan / `octagrowth`)

Katalog judul baku per varian laporan distribusi & pertumbuhan:
- **Laporan Sesi:** `# 📢 Laporan Distribusi Facebook Group — Sesi Pagi / Siang / Malam`
- **Laporan Materi & Curation:** `# 🎯 Laporan Produk Terpilih & Kurasi Template Pesan`
- **Laporan Audit Database:** `# 🔍 Laporan Audit & Rekonsiliasi Database Grup Facebook`
- **Laporan Rekap Harian:** `# 📊 Laporan Rekapitulasi Harian Distribusi Facebook`
- **Laporan Mingguan (Minggu):** `# 📈 Laporan Kinerja Mingguan Distribusi Facebook`
- **Laporan Bulanan (Tgl 1):** `# 🏆 Laporan Konsolidasi Bulanan Distribusi Facebook`

```markdown
*Cronjob Response: Laporan Distribusi Facebook Group — Sesi Pagi (`job_id: 6d186517f3a5`)*

---

# 📢 Laporan Distribusi Facebook Group — Sesi Pagi
*Penayangan Komunitas Organik | Produk: AI Developer Documentation Kit | Pukul 07:30 WIB*

- ID: `6d186517f3a5`  
- Tanggal: <tg-time unix="1792108800" format="wDT">16 Okt 2026, 07:30 WIB</tg-time>  
- Runner: `octagrowth`  
- Status: ==PUBLISHED==  

---

## 📊 Ringkasan Penayangan Sesi
| Metrik Distribusi | Sasaran | Realisasi | Persentase |
| :--- | :---: | :---: | :---: |
| Total Grup Target | 24 grup | 24 grup | 100% |
| 🟢 Berhasil Terbit | - | 21 grup | 87.5% |
| 🔴 Dibatasi Admin / Limit | 0 grup | 3 grup | 12.5% |
| 🔗 Tautan di Badan Post | 24 post | 100% di Caption | 100% |

<details><summary>▶️ Rincian Status Per-Grup Facebook (Buka/Tutup)</summary>

| No | Nama Grup Komunitas | Status | Alasan / Catatan | Tautan Postingan |
| :---: | :--- | :---: | :--- | :---: |
| 01 | [Komunitas AI Developer](https://...) | 🟢 Terbit | Tautan di body caption | [Lihat Post ↗️](https://...) |
| 02 | [Laravel Indonesia](https://...) | 🔴 Dibatasi | Izin posting dibatasi admin | [Buka Grup ↗️](https://...) |

</details>

---

> 💡 **Kesimpulan & Rekomendasi Tindakan**:
> - **Evaluasi Penayangan:** Sesi Pagi berhasil menjangkau 21 grup aktif tanpa penolakan frekuensi akun.
> - **Integritas Tautan:** 100% tautan produk tersambung dengan format AutoLink delimiter spasi.
> - **Tindak Lanjut:** Sesi Siang akan melanjutkan distribusi pada kelompok indeks grup berikutnya pukul 12:30 WIB.

👉 [**📊 Buka Master Tracker Google Sheets ↗️**](https://docs.google.com/spreadsheets/d/1LnaY1znVyk8ZSG5RSoqDSplcOp1PwF5pEJ8lP7aKFrg/edit)  
👉 [**🛍️ Kunjungi Etalase Produk Lynk.id ↗️**](https://lynk.id/octalectzz)
```

---

### Template 6: Content Clipping & Kampanye Media (Ryu / `octaclip`)

```markdown
*Cronjob Response: Content Rewards & Clip Performance Audit (`job_id: 9a72df10c441`)*

---

# 🎬 Laporan Performa Kliping & Kampanye Konten
*Metrik Watch Time, Kurva Retensi & Evaluasi ContentRewards | Pukul 21:30 WIB*

- Platform: `TikTok / IG Reels`  
- Tanggal: <tg-time unix="1792108800" format="wDT">16 Okt 2026, 21:30 WIB</tg-time>  
- Runner: `octaclip`  
- Status: ==EVALUATED==  

---

## 📊 Ringkasan Metrik Klip Video
| Judul Klip / Hook | Durasi | Views | Watch Time Avg | Completion (%) | Reward Estimasi |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `Rahasia Arsitektur AI Agent` | 42s | 14.2k | 26s | 62% | $ 28.50 |
| `Kenapa VPS Lokal Lebih Hemat` | 35s | 8.9k | 18s | 51% | $ 16.00 |

<details><summary>▶️ Bedah Kurva Retensi & Optimasi Hook 3 Detik</summary>

- **Hook Retention:** Klip #1 mempertahankan 78% penonton pada detik ke-3 berkat visual cue teks overlay tebal di pembuka.
- **Drop-off Point:** Penurunan retensi terjadi di detik ke-28 saat transisi audio terlalu mendadak.
- **Tindakan Lanjutan:** Terapkan sound effect whoosh pada transisi segmen berikutnya.
- **Tautan Kampanye:** 👉 [**🎬 Buka Kampanye di ContentRewards ↗️**](https://contentrewards.com/...)

</details>

---

> 💡 **Kesimpulan & Rekomendasi Tindakan**:
> Video edukasi arsitektur agen berhasil menembus 14.2k views dengan rasio penyelesaian 62%. Gunakan hook serupa untuk konten clipping sesi berikutnya.

👉 [**🎬 Buka Kampanye di ContentRewards ↗️**](https://contentrewards.com)
```

---

## ⚙️ Mekanisme Inheritansi & Ketersediaan Global

### 1. Ketersediaan Otomatis di Seluruh Profil (Global Inheritance)
Skill ini tersimpan di jalur repositori lokal utama:
```bash
/opt/data/skills/octa-hub/octa-hub-telegram-format/SKILL.md
```
Karena seluruh profil agen di Octa Hub (`default`, `octaclip`, `octagrowth`, `octainfra`, `octasmart`, `octauto`) mendaftarkan `/opt/data/skills` di dalam konfigurasi `skills.external_dirs` atau `skills.paths`:
```yaml
skills:
  - /opt/data/skills
  - /opt/data/profiles/<profile>/skills/<profile>-shortcuts
```
Maka skill ini **secara otomatis diwarisi dan aktif di setiap profil tanpa duplikasi file**.

### 2. Jaminan Provisi Profil Baru (`newprofile` v2.9.0)
Setiap kali profil baru dibentuk menggunakan skill `newprofile`:
- **Stage 7:** Helper `/opt/data/tools/profile_capability_scanner.py configure-profile` otomatis mendaftarkan `/opt/data/skills`, menyetel `rich_messages: true`, dan mengonfigurasi `cron.wrap_response: false` agar tidak memicu Setext Heading usang pada cronjob.
- **Stage 9:** Helper `/opt/data/tools/reload_gateway_skills.py` memicu in-memory hot reload pada gateway multiplexer, memastikan profil baru langsung dapat mengirimkan laporan terstruktur berformat rich messages.

### 3. Pitfall Deteksi `_needs_rich_rendering` & Proteksi Degradasi ke MarkdownV2
- **Mekanisme Pemicu Bawaan:** Adapter Telegram Hermes (`TelegramAdapter`) memverifikasi isi pesan via `_needs_rich_rendering()`. Secara default, hanya 4 konstruksi yang dianggap butuh rich rendering: tabel pipa (`|---|`), checklist GFM (`- [ ]`), tag `<details>`, dan math `$$`.
- **Bahaya Degradasi Format:** Jika sebuah pesan hanya menggunakan tag HTML seperti `<blockquote expandable>` atau garis pemisah `---` tanpa adanya salah satu dari 4 elemen di atas, Hermes menilai pesan sebagai plain text dan mengalihkannya ke formatter `MarkdownV2`. Seluruh tag HTML kemudian di-escape menjadi karakter mentah (contoh: `\<blockquote expandable\>`, `\<b\>`, `\-\-\-`), merusak tampilan obrolan di Telegram.
- **Aturan Eksekusi Mandatori:**
  - Setiap pesan atau laporan terstruktur wajib menyertakan setidaknya **satu jangkar Rich Message pasti**: tabel Markdown (`|---|`), task list (`- [ ]`), atau blok `<details><summary>`.
  - Gunakan `<details><summary>` sebagai komponen lipat standar untuk thinking log, rincian teknis, atau catatan sistem.
  - Pertahankan runtime monkey-patch pada `octa-gateway-sync` untuk memperluas deteksi `_needs_rich_rendering` agar mengenali `<blockquote\b`, `---`, `==`, dan `||`.
