# Publikasi Aset ke Object Storage + Pengiriman ke Grup Mitra

Resep untuk kasus "video/PDF harus bisa dipratinjau di Telegram": master disimpan di object storage publik, laporan dikirim sebagai rich message, berkasnya dikirim native sebagai pesan terpisah. Semua langkah di bawah sudah terbukti live; angka bersifat contoh.

## 1. Tentukan konvensi key dari spesifikasi pemilik storage

Jangan mengarang struktur folder. Cari dulu spesifikasi ingress milik pengelola storage (untuk ekosistem Octa Hub: `Profiles/octainfra/Infrastructure/Media-Assets-Ingress-Specification.md`) dan patuhi endpoint, bucket, gaya addressing, dan prefix yang tercantum.

Konvensi Octa Hub yang berlaku (bucket Dahono S3 `bkt-188d9e49e70f97c9`):

```text
assets/branding/                      # logo, watermark
assets/videos/{reels,shorts,tiktok}/  # keluaran per platform sosial
assets/images/{thumbnails,banners}/
assets/clips/<ID>-<slug>/             # paket per klip (full + cover + preview)
assets/drama/<slug-proyek>/<episode>/ # master serial drama (usulan, menunggu ratifikasi pemilik storage)
```

Jika kebutuhan jatuh di luar daftar tersebut (mis. master serial drama), **pakai prefix baru yang konsisten + tandai menunggu ratifikasi** dan kirim permintaan ratifikasi satu arah (lihat skill `collab-protocol`, pelajaran 17). Siapkan langkah pindah: `asset_manager.py delete <key>` lalu upload ulang.

## 2. Upload

```bash
/opt/hermes/.venv/bin/python /opt/data/tools/asset_manager.py upload \
  /opt/data/assets/videos/<proyek>/<file>.mp4 --prefix assets/drama/<slug>/<episode>
# -> {"success": true, "key": ..., "public_url": ..., "size_bytes": ..., "content_type": "video/mp4", "sha256": ...}
```

- Kredensial: `/opt/data/credentials/assets_storage.env` (mode `0600`) — jangan cetak, jangan tempel ke perintah, jangan masuk log.
- Bandingkan `sha256` hasil upload dengan `sha256sum` lokal; ketidakcocokan berarti objek korup dan harus diunggah ulang.
- `list --prefix <path>` untuk audit isi bucket sebelum/sesudah; listing bucket publik sengaja diblokir, jadi listing hanya lewat helper.

## 3. Verifikasi URL publik sebelum disematkan

```bash
curl -s -o /dev/null -D - -H "Range: bytes=0-1023" "<public_url>" \
  | grep -iE "^HTTP|content-type|content-length|accept-ranges|content-range"
```

Harus menghasilkan: `206 Partial Content`, `Content-Type` sesuai berkas, `Accept-Ranges: bytes`, dan `Content-Range: bytes 0-1023/<total>`. `206` + `Accept-Ranges` inilah yang membuat player Telegram bisa buffering; URL web-viewer (Drive/Dropbox) gagal di sini dan akan memicu `rich message must be non-empty` / `RICH_MESSAGE_PHOTO_NO_MEDIA_FOUND`.

## 4. Thumbnail & cover

```bash
ffmpeg -v error -y -ss 2.5 -i master.mp4 -frames:v 1 -vf "scale=720:1280:flags=lanczos" -q:v 3 cover.jpg
ffmpeg -v error -y -ss <detik-title-card> -i master.mp4 -frames:v 1 -vf "scale=720:1280:flags=lanczos" -q:v 3 titlecard.jpg
```

Cover dipilih dari frame paling representatif (bukan frame paling terang); simpan juga frame title card bila proyek punya.

## 5. Kirim laporan rich + video native

```python
import sys; sys.path.insert(0, "/opt/data/tools")
from topic_manager import send_rich_message

ok, res = send_rich_message(
    chat_id=GROUP,                # supergroup mitra
    content=open("/opt/data/cache/scratch/report.md").read(),
    thread_id=None,               # non-forum: WAJIB None; forum: id topiknya
    token=TOKEN,                  # token bot pengirim dari /opt/data/.env
    reply_markup={"inline_keyboard": [[
        {"text": "🎬 Putar Video (S3)", "url": f"{S3}/EP01_native_v2.mp4"},
        {"text": "🖼️ Buka Cover", "url": f"{S3}/EP01_native_v2_cover.jpg"},
    ]]},
)
assert ok and isinstance(res, dict) and res.get("message_id")
print([b.get("type") for b in res.get("rich_message", {}).get("blocks", [])])
# contoh blok sukses: heading, paragraph, list, divider, table, details, photo, blockquote
```

Berkas native dikirim lewat `sendVideo` multipart (inisiatif `supports_streaming=true`, lampirkan `thumbnail`, isi `width`/`height`/`duration`), caption HTML singkat + satu tautan storage. Video Telegram-hosted menjamin pemutaran inline; objek S3 menjamin pratinjau/unduhan tanpa batas ukuran chat.

## 6. Pemeriksaan sebelum tanda tangan

- `getChat` + `getChatMember` untuk memastikan bot anggota/admin dan `is_forum` grup — salah pilih `message_thread_id` = `Bad Request: message thread not found`.
- Respons API wajib `ok: true` **dan** `message_id`; simpan receipt (`message_id`, `file_id`, URL objek, sha256) ke log produksi proyek dan vault, bukan ke memori global.
- Jika diperlukan preview video **di dalam** rich message, sematkan `![Alt](<url>.mp4)` hanya setelah langkah 3 lulus; kalau ragu, andalkan `sendVideo` terpisah agar tidak kehilangan laporan karena satu sematan gagal.

## 7. Pitfall ringkas

| Gejala | Mekanisme | Tindakan |
| :--- | :--- | :--- |
| `rich message must be non-empty` / `RICH_MESSAGE_PHOTO_NO_MEDIA_FOUND` | Crawler tidak bisa stream URL (web viewer, redirect, `attachment`) | Host di object storage publik, verifikasi `206` + `Accept-Ranges` sebelum embed |
| Video tidak bisa di-scan/seek di klien | Objek dilayani tanpa dukungan byte-range | Cek `Accept-Ranges: bytes`; jangan pakai tautan proxy/export |
| Laporan terkirim tapi tanpa tabel/tombol | Render jatuh ke fallback `sendMessage` | Pastikan ada penanda rich (tabel/`- [ ]`/`<details>`), baca `rich_message.blocks` di respons |
| Objek rapi di bucket tapi tidak terlihat lewat URL publik | Salah prefix/gaya addressing | Ambil `public_url` dari respons helper, bukan menyusun sendiri |
| Kirim ke grup mitra memicu error thread | `message_thread_id` dipakai di supergroup non-forum | `getChat` dulu; non-forum → tanpa `message_thread_id` |
