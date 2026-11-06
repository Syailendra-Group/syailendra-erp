/**
 * demo-data.ts — Realistic mock datasets for Syailendra SCM Living Prototype
 * Complies with octadev-coding-rules-v80 (Strict Type Safety Invariant)
 */

export interface SCMHarvestDemoItem {
  id: string
  code: string
  date: string
  farmer: string
  commodity: string
  location: string
  weight: number
  moisture: string
  lot: string
  status: 'received' | 'ready' | 'distilled'
}

export interface SCMLotDemoItem {
  id: string
  code: string
  material: string
  type: 'raw' | 'crude' | 'export'
  quantity: string
  location: string
  qcStatus: 'passed' | 'quarantine' | 'rejected'
}

export interface SCMDistillationDemoItem {
  id: string
  code: string
  kettle: string
  inputLot: string
  duration: string
  outputKg: number
  yieldPercent: number
  outputLot: string
  status: 'completed' | 'in_progress'
}

export interface SCMQCDemoItem {
  id: string
  code: string
  lot: string
  commodity: string
  density: string
  refractive: string
  marker: string
  result: 'passed' | 'quarantine' | 'rejected'
  coa: string
}

export const MOCK_HARVEST_ITEMS: SCMHarvestDemoItem[] = [
  {
    id: '1',
    code: 'HAR-20261106-001',
    date: '06 Nov 2026',
    farmer: 'Bpk. Sukirman (Kelompok Tani Rembang)',
    commodity: 'Nilam Jawa (Pogostemon cablin)',
    location: 'Kec. Lasem, Rembang',
    weight: 1250,
    moisture: '14.2%',
    lot: 'LOT-RAW-20261106-01',
    status: 'ready'
  },
  {
    id: '2',
    code: 'HAR-20261105-004',
    date: '05 Nov 2026',
    farmer: 'Koperasi Tani Atsiri Manunggal',
    commodity: 'Daun Cengkeh (Syzygium aromaticum)',
    location: 'Kec. Garut Kota, Garut',
    weight: 2400,
    moisture: '16.5%',
    lot: 'LOT-RAW-20261105-02',
    status: 'received'
  },
  {
    id: '3',
    code: 'HAR-20261105-003',
    date: '05 Nov 2026',
    farmer: 'Bpk. Haryono (Mitra Mandiri)',
    commodity: 'Serai Wangi (Cymbopogon nardus)',
    location: 'Kec. Subang, Subang',
    weight: 850,
    moisture: '13.8%',
    lot: 'LOT-RAW-20261105-01',
    status: 'distilled'
  },
  {
    id: '4',
    code: 'HAR-20261104-002',
    date: '04 Nov 2026',
    farmer: 'Bpk. Abdullah (Mitra Penyuling)',
    commodity: 'Biji Pala (Myristica fragrans)',
    location: 'Kec. Bogor Selatan, Bogor',
    weight: 520,
    moisture: '11.0%',
    lot: 'LOT-RAW-20261104-01',
    status: 'distilled'
  }
]

export const MOCK_LOT_ITEMS: SCMLotDemoItem[] = [
  {
    id: '1',
    code: 'LOT-RAW-20261106-01',
    material: 'Daun Nilam Kering Basah',
    type: 'raw',
    quantity: '1,250.00 Kg',
    location: 'Silo Bahan Baku A-01, Rembang',
    qcStatus: 'passed'
  },
  {
    id: '2',
    code: 'LOT-OIL-20261106-01',
    material: 'Minyak Nilam Mentah (Crude Patchouli)',
    type: 'crude',
    quantity: '34.50 Kg',
    location: 'Karantina Drum Station, Lasem',
    qcStatus: 'quarantine'
  },
  {
    id: '3',
    code: 'EXP-DRUM-2026-042',
    material: 'Minyak Nilam Super (Refined Export)',
    type: 'export',
    quantity: '200.00 Kg',
    location: 'Gudang Ekspor Silo Utama, Jakarta',
    qcStatus: 'passed'
  },
  {
    id: '4',
    code: 'LOT-OIL-20261105-02',
    material: 'Minyak Daun Cengkeh Mentah (Crude Clove)',
    type: 'crude',
    quantity: '68.20 Kg',
    location: 'Gudang Transisi Tangki C-02, Garut',
    qcStatus: 'passed'
  }
]

export const MOCK_DISTILLATION_ITEMS: SCMDistillationDemoItem[] = [
  {
    id: '1',
    code: 'DST-20261106-01',
    kettle: 'DST-JTG-001 (Ketel Uap 1 Ton)',
    inputLot: 'LOT-RAW-20261106-01 (1,250 Kg)',
    duration: '8.5 Jam',
    outputKg: 34.5,
    yieldPercent: 2.76,
    outputLot: 'LOT-OIL-20261106-01',
    status: 'completed'
  },
  {
    id: '2',
    code: 'DST-20261105-02',
    kettle: 'DST-JTG-002 (Ketel Uap 2 Ton)',
    inputLot: 'LOT-RAW-20261105-02 (2,400 Kg)',
    duration: '10.0 Jam',
    outputKg: 68.2,
    yieldPercent: 2.84,
    outputLot: 'LOT-OIL-20261105-02',
    status: 'completed'
  },
  {
    id: '3',
    code: 'DST-20261106-02',
    kettle: 'DST-JBR-001 (Ketel Tekan)',
    inputLot: 'LOT-RAW-20261105-01 (850 Kg)',
    duration: '4.0 Jam (Berjalan)',
    outputKg: 0,
    yieldPercent: 0,
    outputLot: 'LOT-OIL-20261106-02',
    status: 'in_progress'
  }
]

export const MOCK_QC_ITEMS: SCMQCDemoItem[] = [
  {
    id: '1',
    code: 'QC-20261106-001',
    lot: 'LOT-OIL-20261106-01',
    commodity: 'Minyak Nilam Super (Patchouli Oil)',
    density: '0.965 (ISO: 0.955 - 0.983)',
    refractive: '1.508 (ISO: 1.505 - 1.515)',
    marker: 'Patchouli Alcohol: 32.4% (Min: 30%)',
    result: 'passed',
    coa: 'COA-SBI-2026-042'
  },
  {
    id: '2',
    code: 'QC-20261105-002',
    lot: 'LOT-OIL-20261105-02',
    commodity: 'Minyak Daun Cengkeh (Clove Leaf Oil)',
    density: '1.045 (ISO: 1.035 - 1.060)',
    refractive: '1.534 (ISO: 1.530 - 1.540)',
    marker: 'Eugenol: 79.2% (Min: 78%)',
    result: 'passed',
    coa: 'COA-SBI-2026-041'
  },
  {
    id: '3',
    code: 'QC-20261104-001',
    lot: 'LOT-OIL-20261104-01',
    commodity: 'Minyak Biji Pala (Nutmeg Oil)',
    density: '0.892 (ISO: 0.880 - 0.910)',
    refractive: '1.482 (ISO: 1.474 - 1.488)',
    marker: 'Myristicin: 10.5% (Min: 10%)',
    result: 'quarantine',
    coa: 'PENDING_RETEST'
  }
]
