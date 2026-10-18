import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  Calendar, 
  TrendingUp, 
  Users, 
  FileCheck, 
  Wallet, 
  Package, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  ShieldAlert,
  Building,
  MapPin,
  CalendarDays
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TabKey } from '../layout/Sidebar';

interface DashboardTabProps {
  onNavigateTab: (tab: TabKey) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ onNavigateTab }) => {
  const { 
    activeProject, 
    workItems, 
    workers, 
    attendanceRecords, 
    staffVisits, 
    spbList, 
    pettyCashList, 
    materialStocks, 
    equipmentList 
  } = useApp();

  // Date range filter
  const [startDate, setStartDate] = useState<string>(activeProject.startDate || '2026-01-01');
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Format currency IDR
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // 1. Pekerjaan Calculations
  const projectWorkItems = useMemo(() => {
    return workItems.filter(w => w.projectId === activeProject.id);
  }, [workItems, activeProject.id]);

  const totalEstimatedContract = useMemo(() => {
    return projectWorkItems.reduce((acc, item) => acc + item.estimatedPrice, 0) || activeProject.contractValue;
  }, [projectWorkItems, activeProject.contractValue]);

  const totalRealizedProgress = useMemo(() => {
    // Weighted progress = sum of (progressPct * weightPct / 100)
    const weightedSum = projectWorkItems.reduce((acc, item) => acc + (item.progressPct * (item.weightPct / 100)), 0);
    return Math.min(100, Math.round(weightedSum * 100) / 100);
  }, [projectWorkItems]);

  const totalRealizedValue = useMemo(() => {
    return projectWorkItems.reduce((acc, item) => acc + item.realizedValue, 0);
  }, [projectWorkItems]);

  // 2. SDM Calculations
  const projectWorkers = useMemo(() => {
    return workers.filter(w => w.projectId === activeProject.id);
  }, [workers, activeProject.id]);

  const activeWorkerCount = projectWorkers.filter(w => w.status === 'Aktif').length;
  const vendorWorkerCount = projectWorkers.filter(w => w.type === 'Vendor').length;

  // 3. Absensi Calculations within range
  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter(a => a.projectId === activeProject.id && a.date >= startDate && a.date <= endDate);
  }, [attendanceRecords, activeProject.id, startDate, endDate]);

  const presentCount = filteredAttendance.filter(a => a.status === 'Hadir' || a.status === 'Lembur').length;
  const totalOvertimeHours = filteredAttendance.reduce((acc, a) => acc + (a.overtimeHours || 0), 0);

  const filteredVisits = useMemo(() => {
    return staffVisits.filter(v => v.projectId === activeProject.id && v.date >= startDate && v.date <= endDate);
  }, [staffVisits, activeProject.id, startDate, endDate]);

  // 4. SPB Calculations within range
  const filteredSpb = useMemo(() => {
    return spbList.filter(s => s.projectId === activeProject.id && s.submissionDate >= startDate && s.submissionDate <= endDate);
  }, [spbList, activeProject.id, startDate, endDate]);

  const totalSpbAmount = filteredSpb.reduce((acc, s) => acc + s.totalAmount, 0);
  const pendingApprovalSpb = filteredSpb.filter(s => !s.logisticsApproval.approved || !s.pjApproval.approved);
  const unpaidSpb = filteredSpb.filter(s => s.paymentStatus === 'Belum Dibayar');
  const tempoSpb = filteredSpb.filter(s => s.paymentMethod === 'Tempo');

  // 5. Kas Kecil Calculations
  const filteredPettyCash = useMemo(() => {
    return pettyCashList.filter(p => p.projectId === activeProject.id && p.date >= startDate && p.date <= endDate);
  }, [pettyCashList, activeProject.id, startDate, endDate]);

  const totalPettyCashIn = filteredPettyCash.filter(p => p.type === 'Pemasukan').reduce((acc, p) => acc + p.amount, 0);
  const totalPettyCashOut = filteredPettyCash.filter(p => p.type === 'Pengeluaran').reduce((acc, p) => acc + p.amount, 0);

  // Overall current balance for this project
  const allProjectPettyCash = pettyCashList.filter(p => p.projectId === activeProject.id);
  const currentCashBalance = allProjectPettyCash.reduce((acc, p) => {
    return p.type === 'Pemasukan' ? acc + p.amount : acc - p.amount;
  }, 0);

  // 6. Stok Bahan Calculations
  const projectMaterials = useMemo(() => {
    return materialStocks.filter(m => m.projectId === activeProject.id);
  }, [materialStocks, activeProject.id]);

  const lowStockItems = projectMaterials.filter(m => {
    const inQty = m.movements.filter(mv => mv.type === 'Masuk').reduce((acc, c) => acc + c.quantity, 0);
    const outQty = m.movements.filter(mv => mv.type === 'Keluar').reduce((acc, c) => acc + c.quantity, 0);
    const current = m.initialStock + inQty - outQty;
    return current <= m.minimumStock;
  });

  // 7. Stok Alat Calculations
  const projectEquipment = useMemo(() => {
    return equipmentList.filter(e => e.projectId === activeProject.id);
  }, [equipmentList, activeProject.id]);

  const operationalTools = projectEquipment.filter(e => e.status === 'Beroperasi' || e.status === 'Siap Pakai').length;
  const maintenanceTools = projectEquipment.filter(e => e.status === 'Rusak / Butuh Servis' || e.status === 'Sedang Diservis').length;
  const rentalTools = projectEquipment.filter(e => e.ownership === 'Sewa Rental').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print Header (Only visible when printing) */}
      <div className="hidden print-only p-6 border-b-2 border-neutral-800 text-center">
        <h1 className="text-2xl font-bold tracking-tight uppercase text-neutral-900">
          LAPORAN EKSEKUTIF MONITORING KONTRAKTOR SIPIL
        </h1>
        <h2 className="text-lg font-semibold text-neutral-700 mt-1">
          {activeProject.name} ({activeProject.code})
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Klien: {activeProject.client} · Lokasi: {activeProject.location} · Periode: {startDate} s/d {endDate}
        </p>
      </div>

      {/* Screen Toolbar: Title, Filter Tanggal & Tombol Print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <span>Rangkuman Eksekutif Proyek</span>
            <span>·</span>
            <span>{activeProject.code}</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {activeProject.name}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {activeProject.location}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5" />
              {activeProject.client}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Picker */}
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800/80 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700/60 text-xs">
            <CalendarDays className="w-4 h-4 text-neutral-400" />
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500 text-[11px]">Dari:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-neutral-800 dark:text-neutral-200 focus:outline-hidden font-mono text-xs"
              />
            </div>
            <span className="text-neutral-400">s/d</span>
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500 text-[11px]">Sampai:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-neutral-800 dark:text-neutral-200 focus:outline-hidden font-mono text-xs"
              />
            </div>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-950 font-semibold rounded-xl text-xs transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Realisasi Progres Kumulatif */}
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-medium">Progres Fisik Kumulatif</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
                {totalRealizedProgress}%
              </span>
              <span className="text-xs text-neutral-500 font-medium">terbobot</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, totalRealizedProgress)}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 flex justify-between items-center">
            <span>Realisasi Nilai:</span>
            <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
              {formatRupiah(totalRealizedValue)}
            </span>
          </div>
        </div>

        {/* KPI 2: Total Nilai Kontrak Proyek */}
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-medium">Total Nilai Kontrak</span>
              <Building className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100 truncate">
              {formatRupiah(totalEstimatedContract)}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Dari {projectWorkItems.length} item pekerjaan terdaftar
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 flex justify-between items-center">
            <span>Site Manager:</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[140px]">
              {activeProject.siteManager}
            </span>
          </div>
        </div>

        {/* KPI 3: Saldo Kas Kecil Lapangan */}
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-medium">Saldo Kas Kecil Lapangan</span>
              <Wallet className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {formatRupiah(currentCashBalance)}
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">+{formatRupiah(totalPettyCashIn)}</span>
              <span>/</span>
              <span className="text-red-500 font-mono">-{formatRupiah(totalPettyCashOut)}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 flex justify-between items-center">
            <span>Status Kas:</span>
            <span className={`font-semibold ${currentCashBalance > 3000000 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
              {currentCashBalance > 3000000 ? 'Sehat (Aman)' : 'Perlu Tambahan SPB'}
            </span>
          </div>
        </div>

        {/* KPI 4: Alert Material & Alat */}
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-medium">Status Logistik & Aset</span>
              <AlertTriangle className={`w-4 h-4 ${lowStockItems.length > 0 || maintenanceTools > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600 dark:text-neutral-400">Bahan Stok Kritis:</span>
                <span className={`font-mono font-bold ${lowStockItems.length > 0 ? 'text-red-500' : 'text-neutral-700 dark:text-neutral-300'}`}>
                  {lowStockItems.length} Item
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600 dark:text-neutral-400">Alat Butuh Servis:</span>
                <span className={`font-mono font-bold ${maintenanceTools > 0 ? 'text-amber-500' : 'text-neutral-700 dark:text-neutral-300'}`}>
                  {maintenanceTools} Unit
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 flex justify-between items-center">
            <span>SPB Menunggu TTD:</span>
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
              {pendingApprovalSpb.length} Berkas
            </span>
          </div>
        </div>
      </div>

      {/* Rangkuman 6 Modul Utama (Tab 2 s/d 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modul 2: Rangkuman List Pekerjaan */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  2. Rangkuman Progress Pekerjaan (WBS)
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Total {projectWorkItems.length} sub divisi pekerjaan terdata
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('pekerjaan')}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium"
            >
              Kelola Tab
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {projectWorkItems.slice(0, 4).map((w) => (
              <div key={w.id} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate pr-2">
                    {w.subDivision}
                  </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">
                    {w.progressPct}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-2">
                  <span>Bobot: {w.weightPct}%</span>
                  <span className="font-mono">{formatRupiah(w.estimatedPrice)}</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${w.progressPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modul 3 & 4: Rangkuman SDM, Kehadiran & Kunjungan Supervisi */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  3 & 4. SDM, Absensi Lapangan & Supervisi Staf
                </h3>
                <p className="text-[11px] text-neutral-500">
                  {activeWorkerCount} Pekerja Aktif · {filteredVisits.length} Log Kunjungan Staf
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigateTab('absensi')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                Absensi
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border border-neutral-200 dark:border-neutral-800">
              <div className="text-[11px] text-neutral-500">Presensi Periode Ini</div>
              <div className="text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1">
                {presentCount} Presensi
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                Total lembur: {totalOvertimeHours} Jam
              </div>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border border-neutral-200 dark:border-neutral-800">
              <div className="text-[11px] text-neutral-500">Komposisi Tenaga Kerja</div>
              <div className="text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1">
                {vendorWorkerCount} Vendor / Subkon
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">
                {projectWorkers.length - vendorWorkerCount} Tim Internal
              </div>
            </div>
          </div>

          {/* Log Kunjungan Staf Terkini */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Log Kunjungan Supervisi / Staf Teknis:
            </div>
            {filteredVisits.length > 0 ? (
              filteredVisits.slice(0, 2).map((v) => (
                <div key={v.id} className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 text-xs">
                  <div className="flex items-center justify-between font-medium text-neutral-900 dark:text-neutral-100">
                    <span>{v.staffName}</span>
                    <span className="text-[11px] text-neutral-500 font-mono">{v.date} ({v.checkInTime})</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 italic">
                    &quot;{v.purpose}&quot;
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 italic p-2 bg-neutral-50 dark:bg-neutral-800/20 rounded-lg">
                Belum ada catatan kunjungan staf dalam rentang tanggal ini.
              </p>
            )}
          </div>
        </div>

        {/* Modul 5a & 5b: Rangkuman Pengajuan SPB & Kas Kecil */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  5a & 5b. Pengajuan SPB & Arus Kas Kecil
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Total Diajukan: {formatRupiah(totalSpbAmount)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigateTab('spb')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                SPB
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('kaskecil')}
                className="text-xs text-neutral-600 dark:text-neutral-400 hover:underline flex items-center gap-1 font-medium"
              >
                Kas Kecil
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredSpb.slice(0, 3).map((spb) => (
              <div key={spb.id} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-xs">
                <div className="flex items-center justify-between font-semibold">
                  <span className="font-mono text-neutral-900 dark:text-neutral-100">{spb.spbNumber}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatRupiah(spb.totalAmount)}</span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">
                  Item: {spb.items.map(i => `${i.itemName} (${i.volume} ${i.unit})`).join(', ')}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700/60 text-[11px]">
                  <div className="flex items-center gap-1">
                    <span className="text-neutral-500">Persetujuan:</span>
                    {spb.logisticsApproval.approved && spb.pjApproval.approved ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Lengkap (2 TTD OK)</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Menunggu Persetujuan</span>
                    )}
                  </div>
                  <span className="text-neutral-600 dark:text-neutral-300 font-medium">
                    {spb.paymentMethod} {spb.tempoDueDate ? `(JT: ${spb.tempoDueDate})` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modul 6 & 7: Rangkuman Stok Bahan & Stok Alat */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  6 & 7. Stok Bahan Gudang & Alat Kerja
                </h3>
                <p className="text-[11px] text-neutral-500">
                  {projectMaterials.length} Bahan Terdaftar · {projectEquipment.length} Unit Alat
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigateTab('stokbahan')}
                className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 font-medium"
              >
                Bahan
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('stokalat')}
                className="text-xs text-neutral-600 dark:text-neutral-400 hover:underline flex items-center gap-1 font-medium"
              >
                Alat
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border border-neutral-200 dark:border-neutral-800">
              <div className="text-[11px] text-neutral-500">Status Alat & Mesin</div>
              <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {operationalTools} Beroperasi/Siap
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                {rentalTools} Sewa Rental · {projectEquipment.length - rentalTools} Milik Sendiri
              </div>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border border-neutral-200 dark:border-neutral-800">
              <div className="text-[11px] text-neutral-500">Peringatan Bahan Menipis</div>
              <div className="text-base font-bold font-mono text-red-500 mt-1">
                {lowStockItems.length} Bahan Kritis
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                Segera terbitkan SPB pengadaan
              </div>
            </div>
          </div>

          {/* Quick list of critical materials */}
          <div className="space-y-1.5">
            {lowStockItems.length > 0 ? (
              lowStockItems.slice(0, 2).map((m) => {
                const inQty = m.movements.filter(mv => mv.type === 'Masuk').reduce((acc, c) => acc + c.quantity, 0);
                const outQty = m.movements.filter(mv => mv.type === 'Keluar').reduce((acc, c) => acc + c.quantity, 0);
                const sisa = m.initialStock + inQty - outQty;
                return (
                  <div key={m.id} className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-red-700 dark:text-red-300">{m.materialName}</span>
                      <div className="text-[10px] text-red-600/80">Batas min: {m.minimumStock} {m.unit}</div>
                    </div>
                    <span className="font-mono font-bold text-red-600 dark:text-red-400">
                      Sisa: {sisa} {m.unit}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Semua stok material dalam kondisi aman di atas batas minimum.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
