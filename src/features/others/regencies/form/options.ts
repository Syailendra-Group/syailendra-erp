export interface RegencyOptionItem {
  name: string
  code: string
  provinceName: string
  provinceCode: string
  alias?: string
  latitude?: number
  longitude?: number
}

export const INDONESIA_REGENCIES: RegencyOptionItem[] = [
  // Jawa Tengah
  {
    name: 'Kabupaten Temanggung',
    code: '33.23',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Temanggung',
    latitude: -7.3167,
    longitude: 110.1667
  },
  {
    name: 'Kabupaten Wonosobo',
    code: '33.07',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Wonosobo',
    latitude: -7.3639,
    longitude: 109.9
  },
  {
    name: 'Kabupaten Magelang',
    code: '33.08',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Magelang',
    latitude: -7.4705,
    longitude: 110.2178
  },
  {
    name: 'Kabupaten Boyolali',
    code: '33.09',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Boyolali',
    latitude: -7.5333,
    longitude: 110.6
  },
  {
    name: 'Kabupaten Klaten',
    code: '33.10',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Klaten',
    latitude: -7.7058,
    longitude: 110.6019
  },
  {
    name: 'Kabupaten Sukoharjo',
    code: '33.11',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Sukoharjo',
    latitude: -7.6833,
    longitude: 110.8333
  },
  {
    name: 'Kabupaten Karanganyar',
    code: '33.13',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Karanganyar',
    latitude: -7.5964,
    longitude: 110.9514
  },
  {
    name: 'Kabupaten Sragen',
    code: '33.14',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Sragen',
    latitude: -7.4264,
    longitude: 111.0222
  },
  {
    name: 'Kabupaten Grobogan',
    code: '33.15',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Grobogan',
    latitude: -7.1167,
    longitude: 110.9167
  },
  { name: 'Kabupaten Blora', code: '33.16', provinceName: 'Jawa Tengah', provinceCode: 'JT', alias: 'Blora', latitude: -7.0, longitude: 111.4167 },
  {
    name: 'Kabupaten Rembang',
    code: '33.17',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Rembang',
    latitude: -6.7119,
    longitude: 111.3436
  },
  { name: 'Kabupaten Pati', code: '33.18', provinceName: 'Jawa Tengah', provinceCode: 'JT', alias: 'Pati', latitude: -6.7558, longitude: 111.0381 },
  { name: 'Kabupaten Kudus', code: '33.19', provinceName: 'Jawa Tengah', provinceCode: 'JT', alias: 'Kudus', latitude: -6.8048, longitude: 110.8405 },
  {
    name: 'Kabupaten Jepara',
    code: '33.20',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Jepara',
    latitude: -6.5892,
    longitude: 110.6681
  },
  { name: 'Kabupaten Demak', code: '33.21', provinceName: 'Jawa Tengah', provinceCode: 'JT', alias: 'Demak', latitude: -6.8944, longitude: 110.6389 },
  {
    name: 'Kabupaten Semarang',
    code: '33.22',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Kab. Semarang',
    latitude: -7.1897,
    longitude: 110.4286
  },
  {
    name: 'Kabupaten Kendal',
    code: '33.24',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Kendal',
    latitude: -6.9197,
    longitude: 110.2039
  },
  {
    name: 'Kabupaten Batang',
    code: '33.25',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Batang',
    latitude: -6.9083,
    longitude: 109.7333
  },
  {
    name: 'Kabupaten Pekalongan',
    code: '33.26',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Kab. Pekalongan',
    latitude: -7.0167,
    longitude: 109.6333
  },
  {
    name: 'Kabupaten Pemalang',
    code: '33.27',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Pemalang',
    latitude: -6.8889,
    longitude: 109.3806
  },
  {
    name: 'Kabupaten Tegal',
    code: '33.28',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Kab. Tegal',
    latitude: -6.9833,
    longitude: 109.1333
  },
  {
    name: 'Kabupaten Brebes',
    code: '33.29',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Brebes',
    latitude: -6.8706,
    longitude: 109.0433
  },
  {
    name: 'Kota Semarang',
    code: '33.74',
    provinceName: 'Jawa Tengah',
    provinceCode: 'JT',
    alias: 'Semarang',
    latitude: -6.9667,
    longitude: 110.4167
  },
  { name: 'Kota Surakarta', code: '33.72', provinceName: 'Jawa Tengah', provinceCode: 'JT', alias: 'Solo', latitude: -7.5667, longitude: 110.8167 },
  // Jawa Barat & Banten
  {
    name: 'Kabupaten Bandung Barat',
    code: '32.17',
    provinceName: 'Jawa Barat',
    provinceCode: 'JB',
    alias: 'KBB',
    latitude: -6.8667,
    longitude: 107.5
  },
  { name: 'Kabupaten Garut', code: '32.05', provinceName: 'Jawa Barat', provinceCode: 'JB', alias: 'Garut', latitude: -7.2278, longitude: 107.9086 },
  {
    name: 'Kabupaten Subang',
    code: '32.13',
    provinceName: 'Jawa Barat',
    provinceCode: 'JB',
    alias: 'Subang',
    latitude: -6.5667,
    longitude: 107.7667
  },
  { name: 'Kabupaten Lebak', code: '36.02', provinceName: 'Banten', provinceCode: 'BT', alias: 'Lebak', latitude: -6.65, longitude: 106.2167 },
  // Jawa Timur & DIY
  {
    name: 'Kabupaten Sleman',
    code: '34.04',
    provinceName: 'DI Yogyakarta',
    provinceCode: 'YO',
    alias: 'Sleman',
    latitude: -7.7167,
    longitude: 110.35
  },
  {
    name: 'Kabupaten Bantul',
    code: '34.02',
    provinceName: 'DI Yogyakarta',
    provinceCode: 'YO',
    alias: 'Bantul',
    latitude: -7.8833,
    longitude: 110.3333
  },
  {
    name: 'Kabupaten Malang',
    code: '35.07',
    provinceName: 'Jawa Timur',
    provinceCode: 'JI',
    alias: 'Kab. Malang',
    latitude: -8.1667,
    longitude: 112.6667
  },
  {
    name: 'Kabupaten Banyuwangi',
    code: '35.10',
    provinceName: 'Jawa Timur',
    provinceCode: 'JI',
    alias: 'Banyuwangi',
    latitude: -8.2192,
    longitude: 114.3692
  },
  // Sumatera
  { name: 'Kabupaten Aceh Tengah', code: '11.04', provinceName: 'Aceh', provinceCode: 'AC', alias: 'Takengon', latitude: 4.6333, longitude: 96.85 },
  {
    name: 'Kabupaten Dairi',
    code: '12.11',
    provinceName: 'Sumatera Utara',
    provinceCode: 'SU',
    alias: 'Sidikalang',
    latitude: 2.7667,
    longitude: 98.3
  },
  {
    name: 'Kabupaten Agam',
    code: '13.06',
    provinceName: 'Sumatera Barat',
    provinceCode: 'SB',
    alias: 'Bukittinggi Agro',
    latitude: -0.25,
    longitude: 100.2
  }
]
