# Verifikasi State Live (Read-Only) Sebelum Menjawab Status

Dipakai pada langkah 4 prosedur rekonsiliasi status: membuktikan klaim laporan terhadap sistem yang benar-benar berjalan, tanpa menulis apa pun.

## Prinsip

- **Laporan = potret waktu.** Angka di laporan hanya sah untuk environment saat laporan ditulis. Setelah migrasi host, restore dump, atau ganti database, probe ulang.
- **Read-only mutlak.** Hanya autentikasi + `search_count` / `search_read` / `fields_get`. Tidak ada create/write/unlink, tidak ada restart service.
- **Kredensial tidak pernah dicetak.** Script membaca `.env.local` sendiri di host target; output hanya agregat. Jangan menyalin nilai env ke perintah, log, atau balasan.
- **Selisih adalah temuan.** Laporkan `laporan: X` vs `live: Y` berdampingan. Jangan pilih salah satu diam-diam.

## Eksekusi Remote: tulis file, jangan nested heredoc

Heredoc bertingkat di dalam argumen `ssh '...'` mudah rusak dan gagal dengan `exit 127`. Alur yang benar:

1. `write_file` script probe ke scratch lokal.
2. `scp -q <local> <host>:/tmp/<name>.py`.
3. `ssh <host> 'cd <repo> && timeout 90 python3 /tmp/<name>.py'`.
4. Hapus script setelah selesai bila berisi path internal.

**Alternatif yang terverifikasi untuk rangkaian perintah shell pendek:** satu `ssh <host> '<cmd1 && cmd2 && ...>'` dengan isi di-quote per-segmen (`shlex`-style: `'` → `'"'"'`) menjalankan beberapa probe sekaligus. Jangan menulis `r'''...'''` mentah dengan backslash-newline di dalam Python — sintaks Python-nya pecah sebelum SSH dijalankan. Jangan pula menumpuk `ssh '... docker exec ... "..." ...'` lebih dari dua level: kutipnya bertabrakan dan shell lokal yang meng-expand `$`/`"`. Rangkaian panjang atau berisi kutip di dalam payload → kembali ke jalur write_file + scp di atas.

## Host & Precedence

- **Alias SSH: baca dari config, dan jangan menyimpulkan host mati dari satu nama.** `grep -E "^Host " <ssh_config>` lebih murah daripada menebak. Kegagalan `Could not resolve hostname` berarti alias salah tulis/typo (mis. `ddistlers-vps` vs `ddistillers-vps`), bukan host tidak ada.
- **Container DB/Odoo tidak selalu di host yang diingat.** `Error response from daemon: No such container: odoo-db` di satu host hanya membuktikan container itu tidak ada DI host itu. Sapu dulu: `for h in <hosts>; do ssh ... $h 'docker ps --format "{{.Names}}|{{.Status}}"'; done`, lalu probe di host yang benar-benar memuat `odoo`/`odoo-db`.
- **Versi manifest di kedua sisi adalah dua alasan berbeda.** `__manifest__.py` di repo (working tree) hanya rencana; sumber kebenaran deploy adalah salinan addon yang ter-mount di host Odoo (mis. `/home/deploy/stack/odoo/addons/<module>/__manifest__.py` + folder `migrations/`) DAN `ir_module_module.latest_version` di DB. Ketiganya bisa berbeda dan perbedaannya sendiri adalah temuan.
- **Tabel tidak ada bukan berarti model salah nama.** `relation "<table>" does not exist` saat mengira addon sudah ter-upgrade berarti upgrade belum dijalankan; verifikasi dengan `SELECT table_name FROM information_schema.tables WHERE table_name LIKE '<prefix>%'` dan `SELECT latest_version FROM ir_module_module WHERE name='<module>'` sebelum melaporkan fitur "belum ada" vs "tidak ter-deploy".

## Disiplin Output

- Cetak `json.dumps(..., indent=1)` untuk hasil penuh, atau dict agregat ringkas bila field banyak.
- Saat memotong output, sadari arah potongannya: `tail -N` membuang bagian atas JSON (temuan tingkat atas seperti nama DB, jumlah record) tanpa peringatan. Untuk JSON, pakai `head -N` atau cetak subset key eksplisit.
- Satu probe = satu pertanyaan. Probe kedua untuk memperdalam temuan lebih baik daripada satu probe raksasa yang terpotong.
- `grep -o "^[A-Z_]*=" .env.local` boleh untuk *nama* variabel; nilainya tidak.

## Probe Odoo (JSON-RPC)

Pola minimal: baca env → `common.authenticate` → `execute_kw`.

- **Endpoint adalah `<BASE>/jsonrpc`, bukan `/jsonrpc/2.0`.** Path salah menghasilkan 404 yang gejalanya identik dengan kegagalan kredensial/jaringan; verifikasi path dari client aplikasinya sendiri (`grep -rn "jsonrpc" src/lib/odoo/`) sebelum mencurigai password atau jaringan.
- **`fields`/`order`/`limit`/`offset` wajib di dalam dict kwargs terakhir** — `execute_kw(db, uid, pwd, model, method, [domain], {"fields": [...], "order": "..."})` — bukan sebagai argumen posisi tambahan setelah `args`; signature yang salah gagal dengan TypeError yang tampak seperti bug skrip, bukan bug RPC.

```python
uid = rpc("common", "authenticate", [db, user, pwd, {}])
def ex(model, method, *args, **kw):
    return rpc("object", "execute_kw", [db, uid, pwd, model, method, list(args), kw])
```

Fakta yang layak diambil untuk rekonsiliasi status:

| Pertanyaan | Query |
|---|---|
| Modul terpasang | `ir.module.module.search_count(state='installed')` |
| Modul kustom aktif | `ir.module.module.search_read(name='<module>', fields=['latest_version','state'])` |
| Company | `res.company.search_read(fields=['name'])` |
| Master partner | `res.partner.search_count([])` vs `search_count(supplier_rank>0)` vs `search_count(ref=like 'SUP-%')` |
| Kategori partner | `res.partner.category.search_count([])` |
| Model kustom | `ir.model.search_read(model=like '<prefix>.%')` |
| ACL model kustom | `ir.model.access.search_count(model_id.model in [...])` |
| Field baru ada/tidak | `res.partner.fields_get(attributes=['string'])` lalu cek key |

## Probe Odoo via psql (read-only, agregat)

Untuk pertanyaan hitungan (versi modul, field terisi, jumlah record operasional) psql jauh lebih murah daripada RPC berantai. Jalankan di host backend melalui container database:

```bash
ssh -F <ssh_config> <host> 'docker exec <db_container> psql -U <db_user> -d <db> -At \
  -c "SELECT (SELECT count(*) FROM <table> WHERE <pred>) AS a, (SELECT count(*) FROM <table2>) AS b;"'
```

- **Baca alias SSH dari config, jangan dari ingatan:** `grep -E "^Host " <ssh_config>`. Nama host yang salah tebak gagal sebagai "could not resolve hostname" dan tampak seperti host mati.
- **Temukan nama kolom SEBELUM agregasi:** `SELECT column_name FROM information_schema.columns WHERE table_name='<t>' AND column_name LIKE '%lat%';`. Field bawaan dan field addon sering berbeda nama untuk konsep yang sama (`partner_latitude` di `res.partner` vs `latitude` di model kustom), dan menebaknya membakar satu putaran probe per tebakan.
- **Satu statement gagal membatalkan seluruh batch read-only.** Bila `BEGIN TRANSACTION READ ONLY;` dikirim sebagai `-c` pertama, error pada `-c` berikutnya membuat semua `-c` sesudahnya hanya menjawab `current transaction is aborted`. Pisahkan kolom yang belum pasti ke panggilan terpisah, atau mulai dari `information_schema` dulu.
- **Subquery skalar wajib satu kolom.** Untuk daftar baris gunakan `-c` terpisah dengan konkatenasi (`SELECT id||'|'||name FROM ...`), bukan subquery multi-kolom di dalam `SELECT (...)`.
- **`-At`** (unaligned + tuples-only) menjaga output tetap satu baris per hasil sehingga mudah diparse dan tidak terpotong.

Hitungan yang paling menjelaskan posisi proyek:

| Pertanyaan | Bentuk probe |
|---|---|
| Versi addon ter-deploy | `latest_version FROM ir_module_module WHERE name='<module>'` |
| Fitur sudah terisi data? | `count(*) WHERE <fk>_id IS NOT NULL` dibanding total record |
| Antrian review/backfill | `count(*) WHERE <flag> IS TRUE` |
| Modul operasional masih kosong? | `count(*)` per tabel transaksional (panen, produksi, QC, media) |
| Kolom legacy sudah di-drop? | `count(*) FROM information_schema.columns WHERE column_name='<legacy>'` |
| Katalog master tercemar? | `SELECT id,code,name,active FROM <master> ORDER BY id` lalu bandingkan dengan jumlah seed |

## Membaca Hasil yang Mencurigakan

- **`You are not allowed to access 'X'` padahal login admin:** ACL modul kustom biasanya terikat ke group kustom (`ir.model.access.group_id`), bukan `base.group_user`. Bandingkan `res.users.groups_id` user dengan group di ACL; kesimpulannya adalah celah provisioning/onboarding, bukan kerusakan modul.
- **Model ada tapi menu tidak:** `ir.ui.menu.search_count(name ilike '<kw>')` bisa 0 sementara `ir.model` penuh. Menu/action belum dibuat atau memakai nama lain — jangan simpulkan modul gagal install dari ketiadaan menu.
- **Jumlah record lebih kecil dari laporan parity:** curigai dump yang direstore lebih tua dari pekerjaan terakhir, atau seeding dilakukan pada DB lain. Buktikan dengan `create_date`/sampel record sebelum menyarankan import ulang.
