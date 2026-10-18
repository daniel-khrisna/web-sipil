import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  Download, 
  Camera, 
  Trash2, 
  Search, 
  Filter, 
  Lock,
  CheckCircle2,
  X,
  CreditCard
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PettyCashTransaction } from '../../types';
import { PhotoViewerModal } from '../common/PhotoViewerModal';
import { exportTableToExcel } from '../../utils/spreadsheet';

const EXPENSE_CATEGORIES = [
  'BBM & Energi Alat',
  'Konsumsi & Lembur Pengecoran',
  'Listrik & Utilitas Sementara',
  'Alat K3 & Lapangan',
  'Perlengkapan Alat & Bengkel',
  'ATK & Kantor Direksi Keet',
  'Biaya Kirim / Tips Bongkar Muat',
  'Lain-lain Lapangan'
];

export const KasKecilTab: React.FC = () => {
  const { 
    activeProject, 
    pettyCashList, 
    addPettyCashTransaction, 
    deletePettyCashTransaction, 
    spbList,
    editMode 
  } = useApp();

  // Selected Month filter (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [txType, setTxType] = useState<'Pemasukan' | 'Pengeluaran'>('Pengeluaran');

  // Form Fields
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    refSpbNumber: '',
    amount: 500000,
    category: EXPENSE_CATEGORIES[0],
    receiptPhotoUrl: '',
    recordedBy: 'Admin Lapangan'
  });

  const [photoViewer, setPhotoViewer] = useState<{ isOpen: boolean; title: string; url?: string }>({
    isOpen: false,
    title: ''
  });

  // Filter project transactions and sort by date ascending for proper bank statement (rekening koran) balance
  const projectTransactions = useMemo(() => {
    return pettyCashList
      .filter(p => p.projectId === activeProject.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [pettyCashList, activeProject.id]);

  // Calculate Running Balance for all transactions up to date
  const transactionsWithRunningBalance = useMemo(() => {
    let runningBalance = 0;
    return projectTransactions.map(tx => {
      if (tx.type === 'Pemasukan') {
        runningBalance += tx.amount;
      } else {
        runningBalance -= tx.amount;
      }
      return {
        ...tx,
        currentBalance: runningBalance
      };
    });
  }, [projectTransactions]);

  // Filter for the selected month
  const monthlyTransactions = useMemo(() => {
    return transactionsWithRunningBalance.filter(tx => {
      const matchMonth = tx.date.startsWith(selectedMonth);
      const matchSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (tx.refSpbNumber && tx.refSpbNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchMonth && matchSearch;
    });
  }, [transactionsWithRunningBalance, selectedMonth, searchQuery]);

  // Previous month ending balance (Saldo Awal Bulan Ini)
  const initialMonthlyBalance = useMemo(() => {
    const prior = transactionsWithRunningBalance.filter(tx => tx.date < `${selectedMonth}-01`);
    if (prior.length === 0) return 0;
    return prior[prior.length - 1].currentBalance || 0;
  }, [transactionsWithRunningBalance, selectedMonth]);

  // Month Pemasukan & Pengeluaran
  const monthTotalIn = useMemo(() => {
    return monthlyTransactions.filter(t => t.type === 'Pemasukan').reduce((acc, t) => acc + t.amount, 0);
  }, [monthlyTransactions]);

  const monthTotalOut = useMemo(() => {
    return monthlyTransactions.filter(t => t.type === 'Pengeluaran').reduce((acc, t) => acc + t.amount, 0);
  }, [monthlyTransactions]);

  // Ending balance for this month
  const endingMonthlyBalance = initialMonthlyBalance + monthTotalIn - monthTotalOut;

  // SPB list that can be linked for Pemasukan drop kas
  const availableSpbList = useMemo(() => {
    return spbList.filter(s => s.projectId === activeProject.id);
  }, [spbList, activeProject.id]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleOpenAdd = (type: 'Pemasukan' | 'Pengeluaran') => {
    setTxType(type);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: type === 'Pemasukan' ? 'Drop Dana Kas Kecil dari Kantor Pusat' : '',
      refSpbNumber: '',
      amount: type === 'Pemasukan' ? 10000000 : 250000,
      category: type === 'Pemasukan' ? 'Drop Kas Kantor Pusat' : EXPENSE_CATEGORIES[0],
      receiptPhotoUrl: '',
      recordedBy: 'Admin Lapangan'
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || formData.amount <= 0) return;

    addPettyCashTransaction({
      projectId: activeProject.id,
      date: formData.date,
      description: formData.description,
      refSpbNumber: formData.refSpbNumber || undefined,
      type: txType,
      amount: Number(formData.amount),
      category: formData.category,
      receiptPhotoUrl: formData.receiptPhotoUrl || undefined,
      recordedBy: formData.recordedBy
    });

    setIsFormOpen(false);
  };

  const handleExportExcel = () => {
    const rows = monthlyTransactions.map(tx => ({
      'Tanggal': tx.date,
      'Uraian Transaksi': tx.description,
      'No Ref SPB / Bukti': tx.refSpbNumber || '-',
      'Kategori': tx.category,
      'Pemasukan / Debit (Rp)': tx.type === 'Pemasukan' ? tx.amount : 0,
      'Pengeluaran / Kredit (Rp)': tx.type === 'Pengeluaran' ? tx.amount : 0,
      'Saldo Berjalan (Rp)': tx.currentBalance || 0,
      'Petugas': tx.recordedBy
    }));
    exportTableToExcel(rows, `Rekening_Koran_Kas_Kecil_${selectedMonth}_${activeProject.code}`);
  };

  return (
    <div className="space-y-6">
      {/* Month Selector & Summary Bar (Format Rekening Koran) */}
      <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Buku Kas Kecil Proyek (Petty Cash Ledger)
          </div>
          <h2 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Rekening Koran Bulanan Lapangan
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Dicatat harian untuk operasional lapangan, pengisian melalui SPB kantor pusat
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span className="text-xs text-neutral-500">Pilih Bulan:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-neutral-900 dark:text-neutral-100 text-xs font-mono font-semibold focus:outline-hidden"
            />
          </div>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Koran</span>
          </button>
        </div>
      </div>

      {/* 4 Cards: Sisa Kas Bulan Ini, Pemasukan, Pengeluaran, Saldo Sekarang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sisa Kas Awal Bulan */}
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Sisa Kas Awal Bulan Ini</div>
          <div className="mt-1 text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {formatRupiah(initialMonthlyBalance)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Saldo bergulir per 1 {selectedMonth}
          </div>
        </div>

        {/* Total Pemasukan Bulan Ini */}
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Total Pemasukan (Drop Pusat)</div>
          <div className="mt-1 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ArrowDownLeft className="w-4 h-4" />
            {formatRupiah(monthTotalIn)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Diminta melalui SPB kas kecil
          </div>
        </div>

        {/* Total Pengeluaran Bulan Ini */}
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Total Pengeluaran Lapangan</div>
          <div className="mt-1 text-xl font-bold font-mono text-red-500 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            {formatRupiah(monthTotalOut)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Solar, lembur, utilitas, ATK, tips
          </div>
        </div>

        {/* Saldo Kas Sekarang */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-xs">
          <div className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
            Saldo Kas Lapangan Sekarang
          </div>
          <div className="mt-1 text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
            {formatRupiah(endingMonthlyBalance)}
          </div>
          <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
            Status: {endingMonthlyBalance >= 2000000 ? 'Saldo Aman' : 'Perlu Tambah SPB Kas Kecil'}
          </div>
        </div>
      </div>

      {/* Control Strip & Add Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <div className="relative min-w-[240px] flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari uraian transaksi, kategori, atau no SPB..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleOpenAdd('Pemasukan')}
            disabled={!editMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-colors ${
              editMode
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Drop Kas Masuk (Pusat)</span>
          </button>

          <button
            onClick={() => handleOpenAdd('Pengeluaran')}
            disabled={!editMode}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-colors ${
              editMode
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>- Catat Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Rekening Koran Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Mutasi Rekening Koran Kas Kecil ({selectedMonth})
            </h3>
            <p className="text-[11px] text-neutral-500">
              Format buku kas harian debit/kredit dan saldo berjalan otomatis
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/70 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                <th className="py-3 px-3.5 font-semibold">No</th>
                <th className="py-3 px-3.5 font-semibold">Tanggal</th>
                <th className="py-3 px-3.5 font-semibold">Uraian Transaksi</th>
                <th className="py-3 px-3.5 font-semibold">No Ref SPB / Bukti</th>
                <th className="py-3 px-3.5 font-semibold">Kategori Biaya</th>
                <th className="py-3 px-3.5 font-semibold text-right text-emerald-600 dark:text-emerald-400">
                  Pemasukan (Debit)
                </th>
                <th className="py-3 px-3.5 font-semibold text-right text-red-500">
                  Pengeluaran (Kredit)
                </th>
                <th className="py-3 px-3.5 font-semibold text-right font-bold text-neutral-900 dark:text-neutral-100">
                  Saldo Berjalan
                </th>
                <th className="py-3 px-3.5 font-semibold text-center">Nota</th>
                <th className="py-3 px-3.5 font-semibold text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {monthlyTransactions.length > 0 ? (
                monthlyTransactions.map((tx, idx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 px-3.5 text-neutral-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3.5 font-mono text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3.5 font-medium text-neutral-900 dark:text-neutral-100 max-w-sm">
                      {tx.description}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-xs text-amber-600 dark:text-amber-400">
                      {tx.refSpbNumber || '-'}
                    </td>
                    <td className="py-3 px-3.5 text-neutral-500 text-[11px]">
                      {tx.category}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {tx.type === 'Pemasukan' ? formatRupiah(tx.amount) : '-'}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-semibold text-red-500">
                      {tx.type === 'Pengeluaran' ? formatRupiah(tx.amount) : '-'}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {formatRupiah(tx.currentBalance || 0)}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      {tx.receiptPhotoUrl ? (
                        <button
                          onClick={() => setPhotoViewer({ isOpen: true, title: `Kwitansi ${tx.description}`, url: tx.receiptPhotoUrl })}
                          className="p-1 text-neutral-500 hover:text-amber-500"
                          title="Lihat Nota"
                        >
                          <Camera className="w-4 h-4 mx-auto" />
                        </button>
                      ) : (
                        <span className="text-neutral-300 dark:text-neutral-700">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-center no-print">
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus transaksi "${tx.description}"?`)) {
                            deletePettyCashTransaction(tx.id);
                          }
                        }}
                        disabled={!editMode}
                        className="p-1 text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-neutral-500">
                    <Wallet className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">Belum ada transaksi di bulan {selectedMonth}.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {txType === 'Pemasukan' ? 'Catat Pemasukan (Drop Kas Pusat)' : 'Catat Pengeluaran Kas Kecil'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tanggal Transaksi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Nominal Transaksi (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Uraian Transaksi / Keperluan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={txType === 'Pemasukan' ? 'Drop dana kas kecil SPB-015' : 'Konsumsi lembur pengecoran, beli BBM genset...'}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Kategori Biaya
                  </label>
                  {txType === 'Pemasukan' ? (
                    <input
                      type="text"
                      disabled
                      value="Drop Kas Kantor Pusat"
                      className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                    />
                  ) : (
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                    >
                      {EXPENSE_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Referensi No SPB (Jika Ada)
                  </label>
                  <select
                    value={formData.refSpbNumber}
                    onChange={(e) => setFormData({ ...formData, refSpbNumber: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 font-mono"
                  >
                    <option value="">- Tidak Mengait SPB -</option>
                    {availableSpbList.map(s => (
                      <option key={s.id} value={s.spbNumber}>{s.spbNumber}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Lampiran Foto Nota / Bukti Transfer:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.receiptPhotoUrl}
                    onChange={(e) => setFormData({ ...formData, receiptPhotoUrl: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, receiptPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80' })}
                    className="px-3 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-neutral-800 dark:text-neutral-200 rounded-lg whitespace-nowrap"
                  >
                    Sampel Nota
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-xs text-white ${
                    txType === 'Pemasukan' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Simpan Transaksi Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Viewer */}
      <PhotoViewerModal
        isOpen={photoViewer.isOpen}
        onClose={() => setPhotoViewer({ isOpen: false, title: '' })}
        title={photoViewer.title}
        photoUrl={photoViewer.url}
      />
    </div>
  );
};
