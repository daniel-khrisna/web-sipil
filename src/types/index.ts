export type UserRole = 'superadmin' | 'admin' | 'user';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedProjectId?: string; // jika role 'user', hanya boleh akses proyek ini
}

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  location: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  siteManager: string;
  logisticsOfficer: string;
  description: string;
  status: 'Aktif' | 'Selesai' | 'Masa Pemeliharaan' | 'Ditunda';
}

export type DivisionType = 
  | 'Pekerjaan Persiapan & K3'
  | 'Pekerjaan Tanah & Pondasi'
  | 'Pekerjaan Struktur Beton & Baja'
  | 'Pekerjaan Arsitektur & Finishing'
  | 'Pekerjaan MEP (Mekanikal Elektrikal Plumbing)'
  | 'Pekerjaan Saluran & Infrastruktur Luar';

export interface WorkItem {
  id: string;
  projectId: string;
  division: DivisionType;
  subDivision: string;
  volume: number;
  unit: string;
  unitPrice: number;
  estimatedPrice: number; // volume * unitPrice
  weightPct: number; // Bobot pek (%)
  progressPct: number; // Progress pek (%) 0 - 100
  realizedValue: number; // (progressPct / 100) * estimatedPrice
  status: 'Belum Mulai' | 'Sedang Berjalan' | 'Selesai' | 'Tertunda';
  notes: string;
  updatedDate: string;
}

export type WorkerCategory = 
  | 'Ahli' 
  | 'Teknis' 
  | 'Logistik' 
  | 'Tenaga Harian' 
  | 'Borongan' 
  | 'Konsultan';

export interface Worker {
  id: string;
  projectId: string;
  name: string;
  position: string;
  category: WorkerCategory;
  type: 'Internal' | 'Vendor';
  vendorName?: string;
  phone: string;
  dailyRate?: number;
  status: 'Aktif' | 'Nonaktif' | 'Cuti';
  notes: string;
}

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Lembur';

export interface AttendanceRecord {
  id: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  workerId: string;
  workerName: string;
  category: WorkerCategory;
  status: AttendanceStatus;
  overtimeHours: number;
  notes?: string;
  photoUrl?: string; // foto bukti apel / briefing pagi
}

export interface StaffVisitLog {
  id: string;
  projectId: string;
  date: string;
  staffName: string;
  role: string;
  checkInTime: string;
  checkOutTime?: string;
  purpose: string;
  findings: string;
  signatureOrNotes?: string;
}

export interface SPBItem {
  id: string;
  itemName: string;
  volume: number;
  unit: string;
  estimatedPrice: number;
  totalPrice: number;
  purpose: string; // untuk apa (e.g. Pembesian Kolom K1 Lt.2)
}

export type SPBItemStatus = 'Belum Dipesan' | 'Dipesan' | 'Sudah Datang Sebagian' | 'Sudah Datang Lengkap';
export type SPBPaymentStatus = 'Belum Dibayar' | 'Sudah Dibayar';
export type SPBPaymentMethod = 'Cash' | 'Tempo' | 'Reimburse Logistik';

export interface SPBSubmission {
  id: string;
  projectId: string;
  spbNumber: string; // contoh: SPB/2026/03/001
  submissionDate: string;
  items: SPBItem[];
  totalAmount: number;
  
  // Sistem persetujuan 2 tanda tangan
  logisticsApproval: {
    approved: boolean;
    officerName: string;
    approvalDate?: string;
    notes?: string;
  };
  pjApproval: {
    approved: boolean;
    officerName: string;
    approvalDate?: string;
    notes?: string;
  };
  
  // Lampiran foto
  spbPhotoUrl?: string; // Lampiran foto fisik SPB
  supplierInvoicePhotoUrl?: string; // Lampiran Nota dari supplier
  
  // Status
  itemStatus: SPBItemStatus;
  paymentStatus: SPBPaymentStatus;
  paymentMethod: SPBPaymentMethod;
  tempoDueDate?: string;
  notes: string;
}

export interface PettyCashTransaction {
  id: string;
  projectId: string;
  date: string;
  description: string;
  refSpbNumber?: string;
  type: 'Pemasukan' | 'Pengeluaran';
  amount: number;
  category: string; // e.g. 'Drop Kas Kantor Pusat', 'Konsumsi Lembur', 'BBM Genset Darurat', 'ATK Proyek', 'Token Listrik'
  receiptPhotoUrl?: string;
  recordedBy: string;
  currentBalance?: number; // dihitung saat kalkulasi rekening koran
}

export type MaterialCategory = 
  | 'Baja & Besi'
  | 'Semen'
  | 'Agregat & Pasir'
  | 'Bata & Dinding'
  | 'Kayu & Triplek'
  | 'Perpipaan & Plumbing'
  | 'BBM & Energi'
  | 'Finishing & Cat'
  | 'Elektrikal'
  | 'Lainnya';

export interface MaterialStockMovement {
  id: string;
  date: string;
  type: 'Masuk' | 'Keluar';
  quantity: number;
  referenceDoc?: string; // No Surat Jalan / SPB
  partnerOrDivision?: string; // Nama Vendor atau Divisi Penerima
  notes?: string;
}

export interface MaterialStock {
  id: string;
  projectId: string;
  materialName: string;
  category: MaterialCategory;
  unit: string;
  minimumStock: number;
  initialStock: number;
  movements: MaterialStockMovement[];
  notes: string;
}

export type EquipmentCategory = 
  | 'Alat Berat'
  | 'Mesin Ringan'
  | 'Power Tools'
  | 'Alat Ukur / Survey'
  | 'Alat Keselamatan (K3)'
  | 'Genset & Kelistrikan'
  | 'Pompa Air';

export type EquipmentStatus = 
  | 'Siap Pakai'
  | 'Beroperasi'
  | 'Rusak / Butuh Servis'
  | 'Sedang Diservis'
  | 'Standby'
  | 'Selesai / Dikembalikan';

export interface EquipmentItem {
  id: string;
  projectId: string;
  toolName: string;
  serialNumber: string;
  category: EquipmentCategory;
  ownership: 'Milik Sendiri' | 'Sewa Rental';
  rentalVendor?: string;
  rentalDailyRate?: number;
  entryDate: string; // tanggal masuk
  exitDate?: string; // tanggal keluar
  status: EquipmentStatus;
  assignedOperator?: string;
  locationZone?: string;
  notes: string;
}
