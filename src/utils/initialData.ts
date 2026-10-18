import { 
  Project, 
  WorkItem, 
  Worker, 
  AttendanceRecord, 
  StaffVisitLog, 
  SPBSubmission, 
  PettyCashTransaction, 
  MaterialStock, 
  EquipmentItem,
  UserAccount
} from '../types';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-superadmin',
    name: 'Ir. Hendra Wijaya, M.T.',
    email: 'hendra.superadmin@civiltrack.id',
    role: 'superadmin'
  },
  {
    id: 'user-admin',
    name: 'Budi Santoso, S.T. (Project Director)',
    email: 'budi.admin@civiltrack.id',
    role: 'admin'
  },
  {
    id: 'user-site',
    name: 'Rian Pratama, S.T. (Site Engineer RSUD)',
    email: 'rian.user@civiltrack.id',
    role: 'user',
    assignedProjectId: 'proj-1'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    code: 'PRJ-2026-001',
    name: 'Pembangunan Gedung Rawat Inap RSUD 6 Lantai',
    client: 'Dinas Kesehatan & RSUD Wilayah',
    location: 'Jl. Pemuda No. 45, Sentra Medika',
    startDate: '2026-01-10',
    endDate: '2026-11-30',
    contractValue: 18500000000, // Rp 18.5 Miliar
    siteManager: 'Ir. Agus Susanto, S.T.',
    logisticsOfficer: 'Deni Kurniawan',
    description: 'Pekerjaan struktur beton bertulang 6 lantai, MEP hospital grade, dan arsitektur finishing steril.',
    status: 'Aktif'
  },
  {
    id: 'proj-2',
    code: 'PRJ-2026-002',
    name: 'Rekonstruksi Jembatan & Akses Jalan Cisadane',
    client: 'Balai Besar Pelaksanaan Jalan Nasional (BBPJN)',
    location: 'Ruas Jalur Lingkar Cisadane KM 14',
    startDate: '2026-02-01',
    endDate: '2026-09-15',
    contractValue: 12200000000, // Rp 12.2 Miliar
    siteManager: 'Teguh Prasetyo, S.T.',
    logisticsOfficer: 'Hendra Saputra',
    description: 'Pondasi bore pile diameter 100cm, girder prategang bentang 35m, dan perkerasan kaku beton FS-45.',
    status: 'Aktif'
  },
  {
    id: 'proj-3',
    code: 'PRJ-2026-003',
    name: 'Saluran Drainase Utama & Box Culvert Kawasan Industri',
    client: 'PT Surya Cipta Megah Nusantara',
    location: 'Kawasan Industri Timur Blok C',
    startDate: '2026-03-01',
    endDate: '2026-08-30',
    contractValue: 6400000000, // Rp 6.4 Miliar
    siteManager: 'Fajar Nugraha, S.T.',
    logisticsOfficer: 'Bambang Irawan',
    description: 'Pemasangan precast box culvert 2.5x2.5m sepanjang 1.2 KM dan retaining wall bronjong.',
    status: 'Aktif'
  }
];

export const INITIAL_WORK_ITEMS: WorkItem[] = [
  // Proyek 1: Gedung RSUD 6 Lantai
  {
    id: 'wk-101',
    projectId: 'proj-1',
    division: 'Pekerjaan Persiapan & K3',
    subDivision: 'Pembersihan Lahan, Pengukuran & Bouwplank',
    volume: 1,
    unit: 'Ls',
    unitPrice: 150000000,
    estimatedPrice: 150000000,
    weightPct: 0.81,
    progressPct: 100,
    realizedValue: 150000000,
    status: 'Selesai',
    notes: 'Elevasi benchmark BM-01 telah diverifikasi konsultan pengawas.',
    updatedDate: '2026-01-25'
  },
  {
    id: 'wk-102',
    projectId: 'proj-1',
    division: 'Pekerjaan Persiapan & K3',
    subDivision: 'Pagar Proyek & Fasilitas K3 / Direksi Keet',
    volume: 1,
    unit: 'Ls',
    unitPrice: 220000000,
    estimatedPrice: 220000000,
    weightPct: 1.19,
    progressPct: 100,
    realizedValue: 220000000,
    status: 'Selesai',
    notes: 'Pos K3 & posko safety briefing lengkap APD.',
    updatedDate: '2026-01-30'
  },
  {
    id: 'wk-103',
    projectId: 'proj-1',
    division: 'Pekerjaan Tanah & Pondasi',
    subDivision: 'Galian Tanah Pile Cap & Tie Beam (Excavator)',
    volume: 2450,
    unit: 'm³',
    unitPrice: 65000,
    estimatedPrice: 159250000,
    weightPct: 0.86,
    progressPct: 100,
    realizedValue: 159250000,
    status: 'Selesai',
    notes: 'Dewatering pompa submersible berjalan lancar tanpa longsor.',
    updatedDate: '2026-02-14'
  },
  {
    id: 'wk-104',
    projectId: 'proj-1',
    division: 'Pekerjaan Tanah & Pondasi',
    subDivision: 'Pemancangan Spun Pile Dia 50cm kedalaman 24m',
    volume: 180,
    unit: 'Titik',
    unitPrice: 8500000,
    estimatedPrice: 1530000000,
    weightPct: 8.27,
    progressPct: 100,
    realizedValue: 1530000000,
    status: 'Selesai',
    notes: 'Kalendering akhir rata-rata < 15mm per 10 pukulan (final set terpenuhi).',
    updatedDate: '2026-02-28'
  },
  {
    id: 'wk-105',
    projectId: 'proj-1',
    division: 'Pekerjaan Struktur Beton & Baja',
    subDivision: 'Pembesian & Pengecoran Pile Cap & Tie Beam K-350',
    volume: 480,
    unit: 'm³',
    unitPrice: 4200000,
    estimatedPrice: 2016000000,
    weightPct: 10.90,
    progressPct: 100,
    realizedValue: 2016000000,
    status: 'Selesai',
    notes: 'Slump test 12±2 cm, curing goni basah 7 hari.',
    updatedDate: '2026-03-10'
  },
  {
    id: 'wk-106',
    projectId: 'proj-1',
    division: 'Pekerjaan Struktur Beton & Baja',
    subDivision: 'Struktur Kolom, Balok & Pelat Lantai 1 s/d Lantai 3',
    volume: 1650,
    unit: 'm³',
    unitPrice: 4650000,
    estimatedPrice: 7672500000,
    weightPct: 41.47,
    progressPct: 85,
    realizedValue: 6521625000,
    status: 'Sedang Berjalan',
    notes: 'Lantai 1 dan 2 selesai 100%, Lantai 3 bekisting dan pembesian balok 70%.',
    updatedDate: '2026-03-24'
  },
  {
    id: 'wk-107',
    projectId: 'proj-1',
    division: 'Pekerjaan Struktur Beton & Baja',
    subDivision: 'Struktur Kolom, Balok & Pelat Lantai 4 s/d Lantai 6 & Rooftop',
    volume: 1450,
    unit: 'm³',
    unitPrice: 4800000,
    estimatedPrice: 6960000000,
    weightPct: 37.62,
    progressPct: 15,
    realizedValue: 1044000000,
    status: 'Sedang Berjalan',
    notes: 'Tower crane terpasang, perakitan tulangan kolom lantai 4 dimulai.',
    updatedDate: '2026-03-26'
  },
  {
    id: 'wk-108',
    projectId: 'proj-1',
    division: 'Pekerjaan Arsitektur & Finishing',
    subDivision: 'Pasangan Dinding Bata Ringan (Hebel) Lantai 1 & 2',
    volume: 3200,
    unit: 'm²',
    unitPrice: 165000,
    estimatedPrice: 528000000,
    weightPct: 2.85,
    progressPct: 40,
    realizedValue: 211200000,
    status: 'Sedang Berjalan',
    notes: 'Mortar thinbed siap, pipa conduit listrik ditanam bersamaan.',
    updatedDate: '2026-03-27'
  },
  {
    id: 'wk-109',
    projectId: 'proj-1',
    division: 'Pekerjaan MEP (Mekanikal Elektrikal Plumbing)',
    subDivision: 'Pemasangan Pipa Sanitasi, Air Bersih & Hydrant Lt 1-3',
    volume: 1,
    unit: 'Ls',
    unitPrice: 420000000,
    estimatedPrice: 420000000,
    weightPct: 2.27,
    progressPct: 30,
    realizedValue: 126000000,
    status: 'Sedang Berjalan',
    notes: 'Pipa pipa PVC Kelas AW dan pipa black steel SCH 40 tersuplai di gudang.',
    updatedDate: '2026-03-28'
  },

  // Proyek 2: Jembatan Cisadane
  {
    id: 'wk-201',
    projectId: 'proj-2',
    division: 'Pekerjaan Tanah & Pondasi',
    subDivision: 'Pengeboran Bore Pile Dia 100cm (Abutment A1 & A2)',
    volume: 36,
    unit: 'Titik',
    unitPrice: 38000000,
    estimatedPrice: 1368000000,
    weightPct: 11.21,
    progressPct: 100,
    realizedValue: 1368000000,
    status: 'Selesai',
    notes: 'Semua titik lulus uji PIT (Pile Integrity Test).',
    updatedDate: '2026-02-20'
  },
  {
    id: 'wk-202',
    projectId: 'proj-2',
    division: 'Pekerjaan Struktur Beton & Baja',
    subDivision: 'Erection Girder Prategang I-Girder Bentang 35 Meter',
    volume: 12,
    unit: 'Batang',
    unitPrice: 450000000,
    estimatedPrice: 5400000000,
    weightPct: 44.26,
    progressPct: 60,
    realizedValue: 3240000000,
    status: 'Sedang Berjalan',
    notes: '7 girder telah terpasang di atas elastomeric bearing pad.',
    updatedDate: '2026-03-22'
  }
];

export const INITIAL_WORKERS: Worker[] = [
  // Staf & Tenaga Proyek 1
  {
    id: 'wkr-01',
    projectId: 'proj-1',
    name: 'Ir. Agus Susanto, S.T.',
    position: 'Project Manager / Site Manager',
    category: 'Ahli',
    type: 'Internal',
    phone: '0812-3456-7890',
    status: 'Aktif',
    notes: 'SKA Manajemen Proyek Madya.'
  },
  {
    id: 'wkr-02',
    projectId: 'proj-1',
    name: 'Rian Pratama, S.T.',
    position: 'Site Engineer Struktur',
    category: 'Teknis',
    type: 'Internal',
    phone: '0813-8821-4321',
    status: 'Aktif',
    notes: 'Penanggung jawab pembesian & kontrol elevasi.'
  },
  {
    id: 'wkr-03',
    projectId: 'proj-1',
    name: 'Deni Kurniawan',
    position: 'Pelaksana Lapangan & Logistik',
    category: 'Logistik',
    type: 'Internal',
    phone: '0857-1122-3344',
    status: 'Aktif',
    notes: 'Penerima material, cek surat jalan & opname gudang.'
  },
  {
    id: 'wkr-04',
    projectId: 'proj-1',
    name: 'Guntur Pamungkas, S.T.',
    position: 'Ahli K3 Konstruksi (Safety Officer)',
    category: 'Ahli',
    type: 'Internal',
    phone: '0821-9988-7766',
    status: 'Aktif',
    notes: 'Sertifikasi K3 Umum & K3 Konstruksi Kemnaker.'
  },
  {
    id: 'wkr-05',
    projectId: 'proj-1',
    name: 'Suhartono',
    position: 'Mandor Utama Pembesian (Besi Beton)',
    category: 'Borongan',
    type: 'Vendor',
    vendorName: 'Tim Mandor Tono Brebes',
    phone: '0878-5544-2211',
    dailyRate: 175000,
    status: 'Aktif',
    notes: 'Membawahi 18 tukang besi dan pembantu.'
  },
  {
    id: 'wkr-06',
    projectId: 'proj-1',
    name: 'Karno',
    position: 'Mandor Bekisting & Kayu',
    category: 'Borongan',
    type: 'Vendor',
    vendorName: 'Mandor Karno Cilacap',
    phone: '0852-3322-1199',
    dailyRate: 170000,
    status: 'Aktif',
    notes: 'Membawahi 14 tukang kayu & scaffolding.'
  },
  {
    id: 'wkr-07',
    projectId: 'proj-1',
    name: 'Yanto',
    position: 'Kepala Tukang Cor Ready-Mix',
    category: 'Tenaga Harian',
    type: 'Vendor',
    vendorName: 'Tim Mandor Tono Brebes',
    phone: '0819-0102-0304',
    dailyRate: 150000,
    status: 'Aktif',
    notes: 'Spesialis vibrator & perataan jidar.'
  },
  {
    id: 'wkr-08',
    projectId: 'proj-1',
    name: 'Ahmad Faisal',
    position: 'Pekerja Harian Lepas (Ladang/Laden)',
    category: 'Tenaga Harian',
    type: 'Internal',
    phone: '0896-4433-2211',
    dailyRate: 120000,
    status: 'Aktif',
    notes: 'Transport material & pembersihan lokasi.'
  },
  {
    id: 'wkr-09',
    projectId: 'proj-1',
    name: 'Ir. Wahyu Pratomo, IPM',
    position: 'Konsultan Pengawas Struktur (MK)',
    category: 'Konsultan',
    type: 'Vendor',
    vendorName: 'PT Cipta Reka Konsultan',
    phone: '0811-2233-4455',
    status: 'Aktif',
    notes: 'Pemberi persetujuan Request for Work (RFW).'
  },
  // Proyek 2
  {
    id: 'wkr-20',
    projectId: 'proj-2',
    name: 'Teguh Prasetyo, S.T.',
    position: 'Site Manager Jembatan',
    category: 'Ahli',
    type: 'Internal',
    phone: '0812-7788-9900',
    status: 'Aktif',
    notes: 'Spesialis jembatan prategang.'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-01',
    projectId: 'proj-1',
    date: '2026-03-28',
    workerId: 'wkr-05',
    workerName: 'Suhartono (Mandor Besi)',
    category: 'Borongan',
    status: 'Hadir',
    overtimeHours: 2,
    notes: 'Pekerjaan perakitan tulangan balok B1 Lt 3 sampai malam.'
  },
  {
    id: 'att-02',
    projectId: 'proj-1',
    date: '2026-03-28',
    workerId: 'wkr-06',
    workerName: 'Karno (Mandor Bekisting)',
    category: 'Borongan',
    status: 'Hadir',
    overtimeHours: 1,
    notes: 'Pemasangan scaffolding scafolding lantai 3.'
  },
  {
    id: 'att-03',
    projectId: 'proj-1',
    date: '2026-03-28',
    workerId: 'wkr-07',
    workerName: 'Yanto (Tukang Cor)',
    category: 'Tenaga Harian',
    status: 'Hadir',
    overtimeHours: 0,
    notes: 'Persiapan slump cone dan vibrating needle.'
  },
  {
    id: 'att-04',
    projectId: 'proj-1',
    date: '2026-03-28',
    workerId: 'wkr-08',
    workerName: 'Ahmad Faisal (Laden)',
    category: 'Tenaga Harian',
    status: 'Hadir',
    overtimeHours: 2,
    notes: 'Membantu angkat besi tulangan ke hoist.'
  }
];

export const INITIAL_STAFF_VISITS: StaffVisitLog[] = [
  {
    id: 'vst-01',
    projectId: 'proj-1',
    date: '2026-03-28',
    staffName: 'Ir. Hendra Wijaya, M.T. (Direktur Operasional)',
    role: 'Supervisi Kantor Pusat',
    checkInTime: '09:30',
    checkOutTime: '13:00',
    purpose: 'Inspeksi mutu sambungan pembesian kolom Lt 3 & kesiapan pengecoran zona timur.',
    findings: 'Kerapatan begel sengkang sudah sesuai shop drawing, kebersihan bekisting sebelum cor agar disemprot air kompresor.',
    signatureOrNotes: 'Telah diperiksa & disetujui untuk lanjut pengecoran.'
  },
  {
    id: 'vst-02',
    projectId: 'proj-1',
    date: '2026-03-27',
    staffName: 'Deni Kurniawan (Logistik Proyek)',
    role: 'Logistik & Gudang',
    checkInTime: '08:00',
    checkOutTime: '17:30',
    purpose: 'Penerimaan besi ulir D16 400 batang dari PT Krakatau Steel & cek fisik semen.',
    findings: 'Surat jalan lengkap, diameter aktual toleransi SNI 0.2mm, disimpan di atas bantalan kayu tertutup terpal.',
    signatureOrNotes: 'Berita acara serah terima terlampir.'
  }
];

export const INITIAL_SPB: SPBSubmission[] = [
  {
    id: 'spb-01',
    projectId: 'proj-1',
    spbNumber: 'SPB/RSUD/2026/03/014',
    submissionDate: '2026-03-25',
    items: [
      {
        id: 'spbi-01',
        itemName: 'Besi Beton Ulir D16 BJTS 420B (Panjang 12m)',
        volume: 400,
        unit: 'Batang',
        estimatedPrice: 195000,
        totalPrice: 78000000,
        purpose: 'Tulangan utama kolom dan balok induk Lt 3'
      },
      {
        id: 'spbi-02',
        itemName: 'Kawat Bendrat Hitam (Kawat Ikat Beton)',
        volume: 15,
        unit: 'Roll (20kg)',
        estimatedPrice: 380000,
        totalPrice: 5700000,
        purpose: 'Pengikat pembesian plat dan balok'
      }
    ],
    totalAmount: 83700000,
    logisticsApproval: {
      approved: true,
      officerName: 'Deni Kurniawan (Logistik)',
      approvalDate: '2026-03-25',
      notes: 'Spesifikasi telah dicocokkan dengan Bar Bending Schedule (BBS).'
    },
    pjApproval: {
      approved: true,
      officerName: 'Ir. Agus Susanto, S.T. (Project Manager)',
      approvalDate: '2026-03-26',
      notes: 'Disetujui untuk diproses PO ke distributor utama.'
    },
    spbPhotoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    supplierInvoicePhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    itemStatus: 'Sudah Datang Lengkap',
    paymentStatus: 'Sudah Dibayar',
    paymentMethod: 'Tempo',
    tempoDueDate: '2026-04-25',
    notes: 'Invoice No. INV/KS/8821 Jatuh tempo 30 hari kalender.'
  },
  {
    id: 'spb-02',
    projectId: 'proj-1',
    spbNumber: 'SPB/RSUD/2026/03/015',
    submissionDate: '2026-03-27',
    items: [
      {
        id: 'spbi-03',
        itemName: 'Pengisian Kas Kecil Proyek Lapangan (Petty Cash Tahap 3)',
        volume: 1,
        unit: 'Paket',
        estimatedPrice: 15000000,
        totalPrice: 15000000,
        purpose: 'Operasional harian, solar alat, konsumsi lembur cor malam & ATK'
      }
    ],
    totalAmount: 15000000,
    logisticsApproval: {
      approved: true,
      officerName: 'Deni Kurniawan (Logistik)',
      approvalDate: '2026-03-27',
      notes: 'Kas kecil sebelumnya saldo tinggal Rp 1.450.000 (SPB diajukan).'
    },
    pjApproval: {
      approved: true,
      officerName: 'Ir. Agus Susanto, S.T. (Project Manager)',
      approvalDate: '2026-03-27',
      notes: 'Disetujui ditransfer ke rekening penampung kasir proyek.'
    },
    spbPhotoUrl: '',
    supplierInvoicePhotoUrl: '',
    itemStatus: 'Sudah Datang Lengkap',
    paymentStatus: 'Sudah Dibayar',
    paymentMethod: 'Cash',
    notes: 'Transfer via BCA Finance Pusat Ref: TRF-889921'
  },
  {
    id: 'spb-03',
    projectId: 'proj-1',
    spbNumber: 'SPB/RSUD/2026/03/016',
    submissionDate: '2026-03-28',
    items: [
      {
        id: 'spbi-04',
        itemName: 'Semen Portland Komposit (PCC) 50 Kg',
        volume: 300,
        unit: 'Zak',
        estimatedPrice: 68000,
        totalPrice: 20400000,
        purpose: 'Pasangan bata ringan hebel dan plesteran lantai dasar'
      },
      {
        id: 'spbi-05',
        itemName: 'Semen Instan / Mortar Thinbed Perekat Hebel (40kg)',
        volume: 150,
        unit: 'Zak',
        estimatedPrice: 85000,
        totalPrice: 12750000,
        purpose: 'Perekat hebel dinding partisi ruang rawat Lt 1'
      }
    ],
    totalAmount: 33150000,
    logisticsApproval: {
      approved: true,
      officerName: 'Deni Kurniawan (Logistik)',
      approvalDate: '2026-03-28',
      notes: 'Volume sesuai target jadwal opname dinding minggu ke-12.'
    },
    pjApproval: {
      approved: false, // Menunggu persetujuan PJ Proyek
      officerName: 'Ir. Agus Susanto, S.T. (Project Manager)',
      notes: 'Sedang review harga distributor alternatif.'
    },
    itemStatus: 'Belum Dipesan',
    paymentStatus: 'Belum Dibayar',
    paymentMethod: 'Cash',
    notes: 'Menunggu persetujuan Project Manager untuk PO pengiriman.'
  }
];

export const INITIAL_PETTY_CASH: PettyCashTransaction[] = [
  {
    id: 'pc-01',
    projectId: 'proj-1',
    date: '2026-03-01',
    description: 'Saldo Kas Awal Bulan Maret 2026',
    type: 'Pemasukan',
    amount: 5200000,
    category: 'Saldo Awal',
    recordedBy: 'Admin Lapangan'
  },
  {
    id: 'pc-02',
    projectId: 'proj-1',
    date: '2026-03-05',
    description: 'BBM Solar Subsidi untuk Mesin Stamper & Genset Penerangan',
    type: 'Pengeluaran',
    amount: 450000,
    category: 'BBM & Energi',
    recordedBy: 'Logistik Proyek'
  },
  {
    id: 'pc-03',
    projectId: 'proj-1',
    date: '2026-03-12',
    description: 'Konsumsi Nasi Bungkus & Kopi Lembur Pengecoran Tie Beam 25 Orang',
    type: 'Pengeluaran',
    amount: 875000,
    category: 'Konsumsi & Lembur',
    recordedBy: 'Admin Lapangan'
  },
  {
    id: 'pc-04',
    projectId: 'proj-1',
    date: '2026-03-18',
    description: 'Beli Pulsa Token Listrik PLN Proyek (Daya 13.000 VA Sementara)',
    type: 'Pengeluaran',
    amount: 1500000,
    category: 'Listrik & Utilitas',
    recordedBy: 'Logistik Proyek'
  },
  {
    id: 'pc-05',
    projectId: 'proj-1',
    date: '2026-03-23',
    description: 'Pengadaan APD Tambahan: Sarung Tangan Karet, Masker Debu & Rompi Safety K3',
    type: 'Pengeluaran',
    amount: 925000,
    category: 'Alat K3 & Lapangan',
    recordedBy: 'K3 Officer'
  },
  {
    id: 'pc-06',
    projectId: 'proj-1',
    date: '2026-03-27',
    description: 'Top-up Dana Kas Kecil dari Kantor Pusat (Sesuai SPB/RSUD/2026/03/015)',
    refSpbNumber: 'SPB/RSUD/2026/03/015',
    type: 'Pemasukan',
    amount: 15000000,
    category: 'Drop Kas Kantor Pusat',
    recordedBy: 'Kasir Lapangan'
  },
  {
    id: 'pc-07',
    projectId: 'proj-1',
    date: '2026-03-28',
    description: 'Beli Kawat Las Inverter RB-26 3.2mm & Batu Gurinda Potong 4 inch (1 box)',
    type: 'Pengeluaran',
    amount: 680000,
    category: 'Perlengkapan Alat & Bengkel',
    recordedBy: 'Logistik Proyek'
  }
];

export const INITIAL_MATERIAL_STOCKS: MaterialStock[] = [
  {
    id: 'mat-01',
    projectId: 'proj-1',
    materialName: 'Besi Beton Ulir D16 BJTS 420B (Panjang 12m)',
    category: 'Baja & Besi',
    unit: 'Batang',
    initialStock: 120,
    minimumStock: 80,
    notes: 'Krakatau Steel SNI bersertifikat uji tarik.',
    movements: [
      {
        id: 'mv-01',
        date: '2026-03-27',
        type: 'Masuk',
        quantity: 400,
        referenceDoc: 'SJ-KS-99120 / SPB-014',
        partnerOrDivision: 'PT Krakatau Steel Tbk',
        notes: 'Diterima utuh, diameter lolos uji sigmat.'
      },
      {
        id: 'mv-02',
        date: '2026-03-28',
        type: 'Keluar',
        quantity: 180,
        referenceDoc: 'RFW-032',
        partnerOrDivision: 'Mandor Tono (Tulangan Kolom Lt 3)',
        notes: 'Pemotongan dan pembengkokan bar bender.'
      }
    ]
  },
  {
    id: 'mat-02',
    projectId: 'proj-1',
    materialName: 'Besi Beton Polos D10 BJTP 280 (Panjang 12m)',
    category: 'Baja & Besi',
    unit: 'Batang',
    initialStock: 350,
    minimumStock: 100,
    notes: 'Untuk sengkang/begel balok dan kolom.',
    movements: [
      {
        id: 'mv-03',
        date: '2026-03-24',
        type: 'Keluar',
        quantity: 120,
        referenceDoc: 'RFW-028',
        partnerOrDivision: 'Mandor Tono (Sengkang Balok Lt 3)',
        notes: 'Jarak sengkang tumpuan 100mm, lapangan 150mm.'
      }
    ]
  },
  {
    id: 'mat-03',
    projectId: 'proj-1',
    materialName: 'Semen Portland Komposit (PCC) 50 Kg',
    category: 'Semen',
    unit: 'Zak',
    initialStock: 45,
    minimumStock: 60, // Kritis / Menipis!
    notes: 'Gudang tertutup beralas palet kayu.',
    movements: [
      {
        id: 'mv-04',
        date: '2026-03-26',
        type: 'Keluar',
        quantity: 35,
        referenceDoc: 'Opname Pasang Bata',
        partnerOrDivision: 'Mandor Karno (Plesteran Lantai 1)',
        notes: 'Stok menipis, butuh restock (SPB-016).'
      }
    ]
  },
  {
    id: 'mat-04',
    projectId: 'proj-1',
    materialName: 'Pasir Cor Extra Bersih (Bebas Lumpur <5%)',
    category: 'Agregat & Pasir',
    unit: 'm³',
    initialStock: 25,
    minimumStock: 10,
    notes: 'Pasir Muntilan grade A.',
    movements: [
      {
        id: 'mv-05',
        date: '2026-03-25',
        type: 'Masuk',
        quantity: 32,
        referenceDoc: 'SJ-Pasir-09',
        partnerOrDivision: 'CV Pasir Jaya Mandiri',
        notes: 'Dump truck 4 rit @ 8 m³.'
      }
    ]
  },
  {
    id: 'mat-05',
    projectId: 'proj-1',
    materialName: 'Bata Ringan Hebel Tebal 10cm (60x20x10 cm)',
    category: 'Bata & Dinding',
    unit: 'm³',
    initialStock: 60,
    minimumStock: 20,
    notes: 'Grade AAC standard tahan api.',
    movements: [
      {
        id: 'mv-06',
        date: '2026-03-27',
        type: 'Keluar',
        quantity: 15,
        referenceDoc: 'RFW-Arsi-01',
        partnerOrDivision: 'Tim Pasang Dinding Lt 1',
        notes: 'Partisi kamar mandi dan koridor utama.'
      }
    ]
  },
  {
    id: 'mat-06',
    projectId: 'proj-1',
    materialName: 'Triplek Phenolic Film 12mm (122x244 cm)',
    category: 'Kayu & Triplek',
    unit: 'Lembar',
    initialStock: 180,
    minimumStock: 50,
    notes: 'Bekisting permukaan expose halus.',
    movements: [
      {
        id: 'mv-07',
        date: '2026-03-23',
        type: 'Keluar',
        quantity: 60,
        referenceDoc: 'RFW-Bekist-03',
        partnerOrDivision: 'Mandor Bekisting Lt 3',
        notes: 'Dilumuri minyak bekisting (form oil).'
      }
    ]
  },
  {
    id: 'mat-07',
    projectId: 'proj-1',
    materialName: 'Bahan Bakar Solar Industri B35',
    category: 'BBM & Energi',
    unit: 'Liter',
    initialStock: 650,
    minimumStock: 250,
    notes: 'Disimpan dalam drum besi berlabel mudah terbakar.',
    movements: [
      {
        id: 'mv-08',
        date: '2026-03-28',
        type: 'Keluar',
        quantity: 120,
        referenceDoc: 'Log BBM Alat',
        partnerOrDivision: 'Excavator & Genset Backup 60 KVA',
        notes: 'Pemanasan genset dan galian saluran samping.'
      }
    ]
  },
  {
    id: 'mat-08',
    projectId: 'proj-1',
    materialName: 'Listrik & Pulsa Token Proyek (13.000 VA)',
    category: 'BBM & Energi',
    unit: 'Kwh / Pulsa',
    initialStock: 1200,
    minimumStock: 300,
    notes: 'KWH meter direksi keet dan workshop pembesian.',
    movements: [
      {
        id: 'mv-09',
        date: '2026-03-26',
        type: 'Keluar',
        quantity: 350,
        referenceDoc: 'Meteran PLN',
        partnerOrDivision: 'Workshop Bar Bender & Mesin Las',
        notes: 'Konsumsi normal operasi 2 shift.'
      }
    ]
  }
];

export const INITIAL_EQUIPMENT_ITEMS: EquipmentItem[] = [
  {
    id: 'eq-01',
    projectId: 'proj-1',
    toolName: 'Excavator Komatsu PC200-8 (Bucket 0.9 m³)',
    serialNumber: 'EXC-KM200-9812',
    category: 'Alat Berat',
    ownership: 'Sewa Rental',
    rentalVendor: 'PT Mitra Perkasa Alatindo',
    rentalDailyRate: 1850000,
    entryDate: '2026-01-12',
    status: 'Beroperasi',
    assignedOperator: 'Surya Wibowo (Operator SIO Aktif)',
    locationZone: 'Zona Barat - Galian Retaining Wall & Basement',
    notes: 'Performa hidrolik baik, jam kerja rata-rata 7 jam/hari.'
  },
  {
    id: 'eq-02',
    projectId: 'proj-1',
    toolName: 'Tower Crane Jib 50m Kapasitas 2.5 Ton di Ujung',
    serialNumber: 'TC-XCMG-QTZ63',
    category: 'Alat Berat',
    ownership: 'Sewa Rental',
    rentalVendor: 'PT Cipta Sarana Crane',
    rentalDailyRate: 4200000,
    entryDate: '2026-02-10',
    status: 'Beroperasi',
    assignedOperator: 'Bagus Prakoso & Rigger Joko',
    locationZone: 'Pusat Area Proyek (Radius Cover 100% Gedung)',
    notes: 'Sertifikat kelayakan Disnaker terpasang, uji beban dinamis OK.'
  },
  {
    id: 'eq-03',
    projectId: 'proj-1',
    toolName: 'Pompa Submersible Dewatering 3 Inch (2 HP)',
    serialNumber: 'PMP-TSURUMI-3IN-01',
    category: 'Pompa Air',
    ownership: 'Milik Sendiri',
    entryDate: '2026-01-15',
    status: 'Siap Pakai',
    assignedOperator: 'Deni Kurniawan (Logistik/Mekanik)',
    locationZone: 'Gudang Alat Proyek',
    notes: 'Siap digunakan jika ada genangan hujan di galian pondasi.'
  },
  {
    id: 'eq-04',
    projectId: 'proj-1',
    toolName: 'Stamper Kodok / Plate Compactor Mikasa MVC-88',
    serialNumber: 'STMP-MKS-882',
    category: 'Mesin Ringan',
    ownership: 'Milik Sendiri',
    entryDate: '2026-01-20',
    status: 'Siap Pakai',
    assignedOperator: 'Mandor Suhartono',
    locationZone: 'Pemadatan Pasir Urug Lantai 1',
    notes: 'Ganti oli mesin 4 tak minggu lalu, tarikan normal.'
  },
  {
    id: 'eq-05',
    projectId: 'proj-1',
    toolName: 'Stamper Kuda / Tamping Rammer Robin EH-12',
    serialNumber: 'STMP-RAM-03',
    category: 'Mesin Ringan',
    ownership: 'Milik Sendiri',
    entryDate: '2026-01-20',
    status: 'Rusak / Butuh Servis',
    assignedOperator: '-',
    locationZone: 'Area Bengkel Proyek',
    notes: 'Karburtor kotor & tali starter putus, menunggu sparepart mekanik.'
  },
  {
    id: 'eq-06',
    projectId: 'proj-1',
    toolName: 'Mesin Bar Bender & Bar Cutter Baja Otomatis (Max D32)',
    serialNumber: 'BBC-STRONG-32A',
    category: 'Mesin Ringan',
    ownership: 'Milik Sendiri',
    entryDate: '2026-01-18',
    status: 'Beroperasi',
    assignedOperator: 'Tim Tukang Besi Suhartono',
    locationZone: 'Workshop Pembesian (Bar Bending Yard)',
    notes: 'Mata pisau potong cadangan tersedia 2 set di gudang.'
  },
  {
    id: 'eq-07',
    projectId: 'proj-1',
    toolName: 'Gerinda Tangan 4 Inch Bosch GWS 060',
    serialNumber: 'GRD-BOSCH-01',
    category: 'Power Tools',
    ownership: 'Milik Sendiri',
    entryDate: '2026-01-15',
    status: 'Beroperasi',
    assignedOperator: 'Slamet (Tukang Besi)',
    locationZone: 'Workshop Pembesian',
    notes: 'Pelindung mata gerinda (safety guard) wajib selalu terpasang.'
  },
  {
    id: 'eq-08',
    projectId: 'proj-1',
    toolName: 'Circular Saw Kayu 7-1/4 Inch Makita 5806B',
    serialNumber: 'SAW-MKT-714',
    category: 'Power Tools',
    ownership: 'Milik Sendiri',
    entryDate: '2026-01-20',
    status: 'Siap Pakai',
    assignedOperator: 'Mandor Karno (Tukang Bekisting)',
    locationZone: 'Workshop Fabrikasi Kayu & Plywood',
    notes: 'Kabel ekstensi 20 meter kondisi prima.'
  },
  {
    id: 'eq-09',
    projectId: 'proj-1',
    toolName: 'Bor Beton Rotary Hammer SDS Plus Bosch GBH 2-26 DRE',
    serialNumber: 'BOR-BSH-GBH26',
    category: 'Power Tools',
    ownership: 'Milik Sendiri',
    entryDate: '2026-02-05',
    status: 'Siap Pakai',
    assignedOperator: 'Tim MEP & Pembesian',
    locationZone: 'Gudang Alat',
    notes: 'Mata bor SDS 10mm, 12mm, 16mm lengkap.'
  },
  {
    id: 'eq-10',
    projectId: 'proj-1',
    toolName: 'Bor Kayu Listrik 10mm Modern M-2100C',
    serialNumber: 'BOR-MOD-10M',
    category: 'Power Tools',
    ownership: 'Milik Sendiri',
    entryDate: '2026-02-05',
    status: 'Siap Pakai',
    assignedOperator: 'Tukang Kayu Karno',
    locationZone: 'Fabrikasi Bekisting',
    notes: 'Untuk melubangi balok bekisting dan tie rod.'
  },
  {
    id: 'eq-11',
    projectId: 'proj-1',
    toolName: 'Genset Silent Diesel Perkins 60 KVA',
    serialNumber: 'GEN-PRK-60KVA-09',
    category: 'Genset & Kelistrikan',
    ownership: 'Sewa Rental',
    rentalVendor: 'PT Powerindo Surya Perkasa',
    rentalDailyRate: 650000,
    entryDate: '2026-01-10',
    status: 'Standby',
    assignedOperator: 'Deni Kurniawan (Logistik)',
    locationZone: 'Samping Pos Direksi Keet',
    notes: 'Cadangan otomatis jika aliran PLN padam saat pengecoran ready mix.'
  },
  {
    id: 'eq-12',
    projectId: 'proj-1',
    toolName: 'Total Station Topcon GM-50 & Prisma Poligon',
    serialNumber: 'TS-TPC-GM52-088',
    category: 'Alat Ukur / Survey',
    ownership: 'Milik Sendiri',
    entryDate: '2026-01-10',
    status: 'Siap Pakai',
    assignedOperator: 'Surveyor Fikri, S.T.',
    locationZone: 'Ruang Kantor Site Engineering',
    notes: 'Kalibrasi rutin berlaku sampai November 2026.'
  }
];
