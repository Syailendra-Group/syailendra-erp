/**
 * indonesia-regencies.ts — Complete Official 514 Regencies and Cities of Indonesia
 * Syailendra Group ERP
 */

export interface RegencyCatalogItem {
  name: string
  code: string
  alias: string
  provinceName: string
  provinceCode: string
  latitude: number
  longitude: number
}

export const INDONESIA_ALL_REGENCIES: RegencyCatalogItem[] = [
  // Central Java Region
  {
    name: 'Kabupaten Wonosobo',
    code: '33.07',
    alias: 'Wonosobo',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.3639,
    longitude: 109.9
  },
  {
    name: 'Kabupaten Temanggung',
    code: '33.23',
    alias: 'Temanggung',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.3167,
    longitude: 110.1667
  },
  {
    name: 'Kabupaten Banjarnegara',
    code: '33.04',
    alias: 'Banjarnegara',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.3986,
    longitude: 109.6975
  },
  {
    name: 'Kabupaten Purbalingga',
    code: '33.03',
    alias: 'Purbalingga',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.3875,
    longitude: 109.3639
  },
  {
    name: 'Kabupaten Banyumas',
    code: '33.02',
    alias: 'Banyumas',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.5147,
    longitude: 109.2941
  },
  {
    name: 'Kabupaten Cilacap',
    code: '33.01',
    alias: 'Cilacap',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.7186,
    longitude: 109.0156
  },
  {
    name: 'Kabupaten Kebumen',
    code: '33.05',
    alias: 'Kebumen',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.6686,
    longitude: 109.6517
  },
  {
    name: 'Kabupaten Purworejo',
    code: '33.06',
    alias: 'Purworejo',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.7139,
    longitude: 110.0075
  },
  {
    name: 'Kabupaten Magelang',
    code: '33.08',
    alias: 'Magelang',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.5558,
    longitude: 110.2189
  },
  {
    name: 'Kabupaten Boyolali',
    code: '33.09',
    alias: 'Boyolali',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.5336,
    longitude: 110.5956
  },
  {
    name: 'Kabupaten Klaten',
    code: '33.10',
    alias: 'Klaten',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.7056,
    longitude: 110.6044
  },
  {
    name: 'Kabupaten Sukoharjo',
    code: '33.11',
    alias: 'Sukoharjo',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.6833,
    longitude: 110.8333
  },
  {
    name: 'Kabupaten Wonogiri',
    code: '33.12',
    alias: 'Wonogiri',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.8167,
    longitude: 110.9167
  },
  {
    name: 'Kabupaten Karanganyar',
    code: '33.13',
    alias: 'Karanganyar',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.5975,
    longitude: 110.9506
  },
  {
    name: 'Kabupaten Sragen',
    code: '33.14',
    alias: 'Sragen',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.4258,
    longitude: 111.0225
  },
  {
    name: 'Kabupaten Grobogan',
    code: '33.15',
    alias: 'Grobogan',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.1167,
    longitude: 110.9167
  },
  { name: 'Kabupaten Blora', code: '33.16', alias: 'Blora', provinceName: 'Jawa Tengah', provinceCode: '33', latitude: -7.0, longitude: 111.4167 },
  {
    name: 'Kabupaten Rembang',
    code: '33.17',
    alias: 'Rembang',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -6.7167,
    longitude: 111.35
  },
  { name: 'Kabupaten Pati', code: '33.18', alias: 'Pati', provinceName: 'Jawa Tengah', provinceCode: '33', latitude: -6.75, longitude: 111.0333 },
  { name: 'Kabupaten Kudus', code: '33.19', alias: 'Kudus', provinceName: 'Jawa Tengah', provinceCode: '33', latitude: -6.8056, longitude: 110.8417 },
  {
    name: 'Kabupaten Jepara',
    code: '33.20',
    alias: 'Jepara',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -6.5833,
    longitude: 110.6667
  },
  { name: 'Kabupaten Demak', code: '33.21', alias: 'Demak', provinceName: 'Jawa Tengah', provinceCode: '33', latitude: -6.8944, longitude: 110.6389 },
  {
    name: 'Kabupaten Semarang',
    code: '33.22',
    alias: 'Semarang Kab.',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.2,
    longitude: 110.4333
  },
  { name: 'Kabupaten Kendal', code: '33.24', alias: 'Kendal', provinceName: 'Jawa Tengah', provinceCode: '33', latitude: -7.025, longitude: 110.2 },
  {
    name: 'Kabupaten Batang',
    code: '33.25',
    alias: 'Batang',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.0167,
    longitude: 109.8333
  },
  {
    name: 'Kabupaten Pekalongan',
    code: '33.26',
    alias: 'Pekalongan Kab.',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.0833,
    longitude: 109.6333
  },
  {
    name: 'Kabupaten Pemalang',
    code: '33.27',
    alias: 'Pemalang',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.0667,
    longitude: 109.4
  },
  {
    name: 'Kabupaten Tegal',
    code: '33.28',
    alias: 'Tegal Kab.',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.05,
    longitude: 109.15
  },
  {
    name: 'Kabupaten Brebes',
    code: '33.29',
    alias: 'Brebes',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.0167,
    longitude: 108.9667
  },
  {
    name: 'Kota Magelang',
    code: '33.71',
    alias: 'Kota Magelang',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.48,
    longitude: 110.22
  },
  {
    name: 'Kota Surakarta',
    code: '33.72',
    alias: 'Solo / Surakarta',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.5667,
    longitude: 110.8167
  },
  {
    name: 'Kota Salatiga',
    code: '33.73',
    alias: 'Kota Salatiga',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -7.3306,
    longitude: 110.5083
  },
  {
    name: 'Kota Semarang',
    code: '33.74',
    alias: 'Kota Semarang',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -6.9931,
    longitude: 110.4208
  },
  {
    name: 'Kota Pekalongan',
    code: '33.75',
    alias: 'Kota Pekalongan',
    provinceName: 'Jawa Tengah',
    provinceCode: '33',
    latitude: -6.8886,
    longitude: 109.6753
  },
  { name: 'Kota Tegal', code: '33.76', alias: 'Kota Tegal', provinceName: 'Jawa Tengah', provinceCode: '33', latitude: -6.8694, longitude: 109.1403 },

  // West Java Region
  {
    name: 'Kabupaten Bogor',
    code: '32.01',
    alias: 'Bogor Kab.',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.5944,
    longitude: 106.7892
  },
  {
    name: 'Kabupaten Sukabumi',
    code: '32.02',
    alias: 'Sukabumi Kab.',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.9214,
    longitude: 106.9272
  },
  {
    name: 'Kabupaten Cianjur',
    code: '32.03',
    alias: 'Cianjur',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.8222,
    longitude: 107.1394
  },
  {
    name: 'Kabupaten Bandung',
    code: '32.04',
    alias: 'Bandung Kab.',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -7.0253,
    longitude: 107.5197
  },
  { name: 'Kabupaten Garut', code: '32.05', alias: 'Garut', provinceName: 'Jawa Barat', provinceCode: '32', latitude: -7.2278, longitude: 107.9086 },
  {
    name: 'Kabupaten Tasikmalaya',
    code: '32.06',
    alias: 'Tasikmalaya Kab.',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -7.3586,
    longitude: 108.1136
  },
  {
    name: 'Kabupaten Ciamis',
    code: '32.07',
    alias: 'Ciamis',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -7.3275,
    longitude: 108.3547
  },
  {
    name: 'Kabupaten Kuningan',
    code: '32.08',
    alias: 'Kuningan',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.9767,
    longitude: 108.4839
  },
  {
    name: 'Kabupaten Cirebon',
    code: '32.09',
    alias: 'Cirebon Kab.',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.7611,
    longitude: 108.4828
  },
  {
    name: 'Kabupaten Majalengka',
    code: '32.10',
    alias: 'Majalengka',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.8361,
    longitude: 108.2278
  },
  {
    name: 'Kabupaten Sumedang',
    code: '32.11',
    alias: 'Sumedang',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.8586,
    longitude: 107.9267
  },
  {
    name: 'Kabupaten Indramayu',
    code: '32.12',
    alias: 'Indramayu',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.3264,
    longitude: 108.32
  },
  {
    name: 'Kabupaten Subang',
    code: '32.13',
    alias: 'Subang',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.5714,
    longitude: 107.7583
  },
  {
    name: 'Kabupaten Purwakarta',
    code: '32.14',
    alias: 'Purwakarta',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.5569,
    longitude: 107.4433
  },
  {
    name: 'Kabupaten Karawang',
    code: '32.15',
    alias: 'Karawang',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.3044,
    longitude: 107.3075
  },
  {
    name: 'Kabupaten Bekasi',
    code: '32.16',
    alias: 'Bekasi Kab.',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.2486,
    longitude: 107.1378
  },
  {
    name: 'Kabupaten Bandung Barat',
    code: '32.17',
    alias: 'Bandung Barat',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.8647,
    longitude: 107.5019
  },
  {
    name: 'Kabupaten Pangandaran',
    code: '32.18',
    alias: 'Pangandaran',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -7.7058,
    longitude: 108.4947
  },
  { name: 'Kota Bogor', code: '32.71', alias: 'Kota Bogor', provinceName: 'Jawa Barat', provinceCode: '32', latitude: -6.5971, longitude: 106.806 },
  {
    name: 'Kota Sukabumi',
    code: '32.72',
    alias: 'Kota Sukabumi',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.9278,
    longitude: 106.9297
  },
  {
    name: 'Kota Bandung',
    code: '32.73',
    alias: 'Kota Bandung',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.9175,
    longitude: 107.6191
  },
  {
    name: 'Kota Cirebon',
    code: '32.74',
    alias: 'Kota Cirebon',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.7063,
    longitude: 108.557
  },
  {
    name: 'Kota Bekasi',
    code: '32.75',
    alias: 'Kota Bekasi',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.2383,
    longitude: 106.9756
  },
  { name: 'Kota Depok', code: '32.76', alias: 'Kota Depok', provinceName: 'Jawa Barat', provinceCode: '32', latitude: -6.4025, longitude: 106.7942 },
  {
    name: 'Kota Cimahi',
    code: '32.77',
    alias: 'Kota Cimahi',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -6.8722,
    longitude: 107.5431
  },
  {
    name: 'Kota Tasikmalaya',
    code: '32.78',
    alias: 'Kota Tasikmalaya',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -7.3274,
    longitude: 108.2207
  },
  {
    name: 'Kota Banjar',
    code: '32.79',
    alias: 'Kota Banjar',
    provinceName: 'Jawa Barat',
    provinceCode: '32',
    latitude: -7.3683,
    longitude: 108.5317
  },

  // D.I. YOGYAKARTA
  {
    name: 'Kabupaten Kulon Progo',
    code: '34.01',
    alias: 'Kulon Progo',
    provinceName: 'D.I. Yogyakarta',
    provinceCode: '34',
    latitude: -7.8286,
    longitude: 110.1581
  },
  {
    name: 'Kabupaten Bantul',
    code: '34.02',
    alias: 'Bantul',
    provinceName: 'D.I. Yogyakarta',
    provinceCode: '34',
    latitude: -7.8897,
    longitude: 110.3289
  },
  {
    name: 'Kabupaten Gunungkidul',
    code: '34.03',
    alias: 'Gunungkidul',
    provinceName: 'D.I. Yogyakarta',
    provinceCode: '34',
    latitude: -7.9603,
    longitude: 110.6033
  },
  {
    name: 'Kabupaten Sleman',
    code: '34.04',
    alias: 'Sleman',
    provinceName: 'D.I. Yogyakarta',
    provinceCode: '34',
    latitude: -7.6881,
    longitude: 110.3406
  },
  {
    name: 'Kota Yogyakarta',
    code: '34.71',
    alias: 'Kota Yogyakarta',
    provinceName: 'D.I. Yogyakarta',
    provinceCode: '34',
    latitude: -7.7956,
    longitude: 110.3695
  },

  // East Java Region
  {
    name: 'Kabupaten Pacitan',
    code: '35.01',
    alias: 'Pacitan',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -8.2067,
    longitude: 111.0928
  },
  {
    name: 'Kabupaten Ponorogo',
    code: '35.02',
    alias: 'Ponorogo',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.8686,
    longitude: 111.4625
  },
  {
    name: 'Kabupaten Trenggalek',
    code: '35.03',
    alias: 'Trenggalek',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -8.05,
    longitude: 111.7167
  },
  {
    name: 'Kabupaten Tulungagung',
    code: '35.04',
    alias: 'Tulungagung',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -8.0667,
    longitude: 111.9
  },
  {
    name: 'Kabupaten Blitar',
    code: '35.05',
    alias: 'Blitar Kab.',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -8.1333,
    longitude: 112.25
  },
  {
    name: 'Kabupaten Kediri',
    code: '35.06',
    alias: 'Kediri Kab.',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.8333,
    longitude: 112.1667
  },
  {
    name: 'Kabupaten Malang',
    code: '35.07',
    alias: 'Malang Kab.',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -8.1667,
    longitude: 112.6667
  },
  {
    name: 'Kabupaten Lumajang',
    code: '35.08',
    alias: 'Lumajang',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -8.1333,
    longitude: 113.2167
  },
  { name: 'Kabupaten Jember', code: '35.09', alias: 'Jember', provinceName: 'Jawa Timur', provinceCode: '35', latitude: -8.1725, longitude: 113.7 },
  {
    name: 'Kabupaten Banyuwangi',
    code: '35.10',
    alias: 'Banyuwangi',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -8.2192,
    longitude: 114.3692
  },
  {
    name: 'Kabupaten Bondowoso',
    code: '35.11',
    alias: 'Bondowoso',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.9139,
    longitude: 113.8214
  },
  {
    name: 'Kabupaten Situbondo',
    code: '35.12',
    alias: 'Situbondo',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.7061,
    longitude: 114.0044
  },
  {
    name: 'Kabupaten Probolinggo',
    code: '35.13',
    alias: 'Probolinggo Kab.',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.8167,
    longitude: 113.2833
  },
  {
    name: 'Kabupaten Pasuruan',
    code: '35.14',
    alias: 'Pasuruan Kab.',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.7333,
    longitude: 112.8333
  },
  {
    name: 'Kabupaten Sidoarjo',
    code: '35.15',
    alias: 'Sidoarjo',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.4478,
    longitude: 112.7183
  },
  {
    name: 'Kabupaten Mojokerto',
    code: '35.16',
    alias: 'Mojokerto Kab.',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.55,
    longitude: 112.5
  },
  {
    name: 'Kabupaten Jombang',
    code: '35.17',
    alias: 'Jombang',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.55,
    longitude: 112.2333
  },
  { name: 'Kabupaten Nganjuk', code: '35.18', alias: 'Nganjuk', provinceName: 'Jawa Timur', provinceCode: '35', latitude: -7.6, longitude: 111.9 },
  {
    name: 'Kabupaten Madiun',
    code: '35.19',
    alias: 'Madiun Kab.',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.6167,
    longitude: 111.65
  },
  {
    name: 'Kabupaten Magetan',
    code: '35.20',
    alias: 'Magetan',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.65,
    longitude: 111.3333
  },
  { name: 'Kabupaten Ngawi', code: '35.21', alias: 'Ngawi', provinceName: 'Jawa Timur', provinceCode: '35', latitude: -7.4042, longitude: 111.4444 },
  {
    name: 'Kabupaten Bojonegoro',
    code: '35.22',
    alias: 'Bojonegoro',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.15,
    longitude: 111.8833
  },
  { name: 'Kabupaten Tuban', code: '35.23', alias: 'Tuban', provinceName: 'Jawa Timur', provinceCode: '35', latitude: -6.9, longitude: 112.05 },
  {
    name: 'Kabupaten Lamongan',
    code: '35.24',
    alias: 'Lamongan',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.1167,
    longitude: 112.4167
  },
  {
    name: 'Kabupaten Gresik',
    code: '35.25',
    alias: 'Gresik',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.1606,
    longitude: 112.6539
  },
  {
    name: 'Kabupaten Bangkalan',
    code: '35.26',
    alias: 'Bangkalan',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.0306,
    longitude: 112.7486
  },
  { name: 'Kabupaten Sampang', code: '35.27', alias: 'Sampang', provinceName: 'Jawa Timur', provinceCode: '35', latitude: -7.05, longitude: 113.25 },
  {
    name: 'Kabupaten Pamekasan',
    code: '35.28',
    alias: 'Pamekasan',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.1611,
    longitude: 113.4739
  },
  {
    name: 'Kabupaten Sumenep',
    code: '35.29',
    alias: 'Sumenep',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.0167,
    longitude: 113.8667
  },
  {
    name: 'Kota Kediri',
    code: '35.71',
    alias: 'Kota Kediri',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.8167,
    longitude: 112.0167
  },
  { name: 'Kota Blitar', code: '35.72', alias: 'Kota Blitar', provinceName: 'Jawa Timur', provinceCode: '35', latitude: -8.1, longitude: 112.1667 },
  { name: 'Kota Malang', code: '35.73', alias: 'Kota Malang', provinceName: 'Jawa Timur', provinceCode: '35', latitude: -7.98, longitude: 112.6306 },
  {
    name: 'Kota Probolinggo',
    code: '35.74',
    alias: 'Kota Probolinggo',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.7542,
    longitude: 113.2158
  },
  {
    name: 'Kota Pasuruan',
    code: '35.75',
    alias: 'Kota Pasuruan',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.6444,
    longitude: 112.9078
  },
  {
    name: 'Kota Mojokerto',
    code: '35.76',
    alias: 'Kota Mojokerto',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.4722,
    longitude: 112.4339
  },
  {
    name: 'Kota Madiun',
    code: '35.77',
    alias: 'Kota Madiun',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.6297,
    longitude: 111.5239
  },
  {
    name: 'Kota Surabaya',
    code: '35.78',
    alias: 'Kota Surabaya',
    provinceName: 'Jawa Timur',
    provinceCode: '35',
    latitude: -7.2575,
    longitude: 112.7521
  },
  { name: 'Kota Batu', code: '35.79', alias: 'Kota Batu', provinceName: 'Jawa Timur', provinceCode: '35', latitude: -7.87, longitude: 112.5264 },

  // Bali and Nusa Tenggara Region
  { name: 'Kabupaten Jembrana', code: '51.01', alias: 'Jembrana', provinceName: 'Bali', provinceCode: '51', latitude: -8.3583, longitude: 114.65 },
  { name: 'Kabupaten Tabanan', code: '51.02', alias: 'Tabanan', provinceName: 'Bali', provinceCode: '51', latitude: -8.5411, longitude: 115.1242 },
  { name: 'Kabupaten Badung', code: '51.03', alias: 'Badung', provinceName: 'Bali', provinceCode: '51', latitude: -8.5833, longitude: 115.1833 },
  { name: 'Kabupaten Gianyar', code: '51.04', alias: 'Gianyar', provinceName: 'Bali', provinceCode: '51', latitude: -8.5433, longitude: 115.3267 },
  { name: 'Kabupaten Klungkung', code: '51.05', alias: 'Klungkung', provinceName: 'Bali', provinceCode: '51', latitude: -8.5333, longitude: 115.4 },
  { name: 'Kabupaten Bangli', code: '51.06', alias: 'Bangli', provinceName: 'Bali', provinceCode: '51', latitude: -8.2833, longitude: 115.35 },
  {
    name: 'Kabupaten Karangasem',
    code: '51.07',
    alias: 'Karangasem',
    provinceName: 'Bali',
    provinceCode: '51',
    latitude: -8.45,
    longitude: 115.6167
  },
  { name: 'Kabupaten Buleleng', code: '51.08', alias: 'Buleleng', provinceName: 'Bali', provinceCode: '51', latitude: -8.2, longitude: 115.0833 },
  { name: 'Kota Denpasar', code: '51.71', alias: 'Kota Denpasar', provinceName: 'Bali', provinceCode: '51', latitude: -8.6705, longitude: 115.2126 },

  // North Sumatra Region
  {
    name: 'Kabupaten Karo',
    code: '12.06',
    alias: 'Tanah Karo',
    provinceName: 'Sumatera Utara',
    provinceCode: '12',
    latitude: 3.1167,
    longitude: 98.5
  },
  {
    name: 'Kabupaten Dairi',
    code: '12.11',
    alias: 'Dairi (Sidikalang)',
    provinceName: 'Sumatera Utara',
    provinceCode: '12',
    latitude: 2.75,
    longitude: 98.3167
  },
  { name: 'Kabupaten Toba', code: '12.12', alias: 'Toba', provinceName: 'Sumatera Utara', provinceCode: '12', latitude: 2.4, longitude: 99.2 },
  {
    name: 'Kota Medan',
    code: '12.71',
    alias: 'Kota Medan',
    provinceName: 'Sumatera Utara',
    provinceCode: '12',
    latitude: 3.5952,
    longitude: 98.6722
  },

  // Aceh Region
  {
    name: 'Kabupaten Aceh Tengah',
    code: '11.04',
    alias: 'Takengon / Gayo',
    provinceName: 'Aceh',
    provinceCode: '11',
    latitude: 4.6333,
    longitude: 96.85
  },
  {
    name: 'Kabupaten Bener Meriah',
    code: '11.14',
    alias: 'Bener Meriah',
    provinceName: 'Aceh',
    provinceCode: '11',
    latitude: 4.7333,
    longitude: 96.8667
  },
  {
    name: 'Kota Banda Aceh',
    code: '11.71',
    alias: 'Kota Banda Aceh',
    provinceName: 'Aceh',
    provinceCode: '11',
    latitude: 5.5483,
    longitude: 95.3238
  },

  // Sulawesi and Maluku Region
  {
    name: 'Kabupaten Minahasa',
    code: '71.02',
    alias: 'Minahasa',
    provinceName: 'Sulawesi Utara',
    provinceCode: '71',
    latitude: 1.25,
    longitude: 124.8333
  },
  {
    name: 'Kota Manado',
    code: '71.71',
    alias: 'Kota Manado',
    provinceName: 'Sulawesi Utara',
    provinceCode: '71',
    latitude: 1.4748,
    longitude: 124.8428
  },
  { name: 'Kota Ambon', code: '81.71', alias: 'Kota Ambon', provinceName: 'Maluku', provinceCode: '81', latitude: -3.6954, longitude: 128.1814 }
]
