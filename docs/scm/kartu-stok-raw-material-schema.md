# Kartu Stok & Spesifikasi Raw Material — Skema Format (Internal)

**Status:** Dokumen internal syailendra ERP — rahasia. Berisi hanya skema/format.
**Lokasi:** `docs/scm/kartu-stok-raw-material-schema.md`
**Referensi berkas sumber:** `docs/scm/Format Kartu Stok & Spesifikasi Raw Material.xlsx` (200+ SKU, tidak disertakan isinya di sini).

## 1. Tujuan

Referensi internasional untuk standarisasi format "Kartu Stok & Spesifikasi Raw Material" yang digunakan gudang, QC, dan pengadaan dalam mencatat gerakan stok dan spesifikasi teknis bahan baku/minyak atsiri per SKU. Dokumen ini menjangankan struktur kolom dan aturan validasi saja; tidak mencantumkan nilai asli (harga beli/kg, jumlah stok, nomor lot, dll.) dari berkas sumber.

## 2. Lingkup SKU

- Format berlaku untuk 200+ SKU raw material (bahan baku atsiri, carrier oil, kemasan, dan perlengkapan pendukung).
- Setiap SKU memiliki satu baris kartu stok dan satu spesifikasi teknis.
- Identifikasi utama: kode SKU (unik).

## 3. Skema Kartu Stok (per SKU)

| Kolom | Tipe | Wajib | Keterangan |
|---|---|---|---|
| sku | string | Ya | Kode barang unik, referensi master barang |
| nama_barang | string | Ya | Nama display bahan baku |
| kategori_komoditas | string | Tidak | Kelompok komoditas (mis. minyak atsiri, carrier oil, kemasan) |
| satuan | string | Ya | Satuan stok (konvensi: kg) |
| lokasi_gudang | string | Tidak | Gudang/rak tempat penyimpanan |
| supplier_default | string | Tidak | Referensi mitra pemasok default |
| stok_tersedia | number | Ya | Saldo stok saat ini (satuan) |
| stok_min | number | Tidak | Ambang batas stok minimum |
| stok_max | number | Tidak | Ambang batas stok maksimum |
| harga_beli_satuan | number | Tidak | Harga beli basis per satuan — **nilai rahasia, tidak ditampilkan publik** |
| mata_uang | string | Tidak | Mata uang harga beli (konvensi: IDR) |
| lead_time_hari | integer | Tidak | Lead time pemasokan (hari) |
| moq | number | Tidak | Minimum order quantity (satuan) |
| last_updated | datetime | Ya | Timestamp pembaruan terakhir kartu |

Aturan:
- `sku` harus unik dalam satu gudang.
- `harga_beli_satuan` serta isi asli berkas sumber (termasuk semua kolom numerik) diklasifikasikan rahasia internal dan tidak boleh dicetak ke chat, log, atau artefak kode publik.
- Validasi rentang: `stok_min` ≤ `stok_tersedia` ≤ `stok_max` bila keduanya diisi.

## 4. Skema Spesifikasi Teknis Raw Material (per SKU)

| Kolom | Tipe | Wajib | Keterangan |
|---|---|---|---|
| sku | string | Ya | Rujukan ke kartu stok |
| latin_name | string | Tidak | Nama latin tanaman (bahan baku nabati) |
| plant_part | string | Tidak | Bagian tanaman yang diekstraksi |
| cultivation_status | string | Tidak | cultivated / wildcrafted |
| extraction_method | string | Tidak | Metode ekstraksi (mis. steam distillation) |
| origin_region | string | Tidak | Wilayah asal |
| parameter_kualitas | json | Tidak | Spesifikasi fisika/kimia per komoditas (periode, rentang nilai, uji) |
| coa_required | boolean | Tidak | Sertifikat analisis wajib per batch |
| expired_masa_berlaku_bulan | integer | Tidak | Masa berlaku setelah produksi (bulan) |
| storage_condition | string | Tidak | Kondisi penyimpanan |
| last_updated | datetime | Ya | Timestamp |

## 5. Aturan Konfidensialitas

- Berkas sumber XLSX (termasuk semua angka: harga beli/kg, jumlah, harga total) **tidak disertakan** dalam artefak kode, chat, atau log sistem.
- Dokumen ini hanya berisi deskripsi skema; setiap tampilan yang menampilkan data asli harus dilindungi oleh hak akses role SCM (group_scm_manager / group_scm_user) dan tidak boleh diekspor tanpa persetujuan owner.

## 6. Contoh Penyesuaian (template, tanpa data asli)

```
SKU: [kode]
Nama: [nama barang]
Satuan: kg
Stok tersedia: [nilai internal]
Harga beli/kg: [rahasia — tidak untuk publik]
Spesifikasi: [lihat skema spesifikasi teknis]
```
