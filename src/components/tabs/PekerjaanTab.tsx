import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  FileSpreadsheet, 
  Lock,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkItem, DivisionType } from '../../types';
import { SpreadsheetModal } from '../common/SpreadsheetModal';
import { downloadTemplateListPekerjaan, exportTableToExcel } from '../../utils/spreadsheet';

const DIVISIONS: DivisionType[] = [
  'Pekerjaan Persiapan & K3',
  'Pekerjaan Tanah & Pondasi',
  'Pekerjaan Struktur Beton & Baja',
  'Pekerjaan Arsitektur & Finishing',
  'Pekerjaan MEP (Mekanikal Elektrikal Plumbing)',
  'Pekerjaan Saluran & Infrastruktur Luar'
];

export const PekerjaanTab: React.FC = () => {
  const { 
    activeProject, 
    workItems, 
    addWorkItem, 
    updateWorkItem, 
    deleteWorkItem, 
    importWorkItems,
    editMode 
  } = useApp();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal Form State (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);
  const [isSpreadsheetOpen, setIsSpreadsheetOpen] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    division: DIVISIONS[2] as DivisionType,
    subDivision: '',
    volume: 1,
    unit: 'm³',
    unitPrice: 0,
    weightPct: 5,
    progressPct: 0,
    status: 'Belum Mulai' as WorkItem['status'],
    notes: ''
  });

  // Filter items for current active project
  const projectItems = useMemo(() => {
    return workItems.filter(w => w.projectId === activeProject.id);
  }, [workItems, activeProject.id]);

  // Filtered by search & division
  const filteredItems = useMemo(() => {
    return projectItems.filter(item => {
      const matchSearch = item.subDivision.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.division.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.notes.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDivision = selectedDivision === 'all' || item.division === selectedDivision;
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
      return matchSearch && matchDivision && matchStatus;
    });
  }, [projectItems, searchQuery, selectedDivision, selectedStatus]);

  // Aggregate Calculations
  const totalWeight = useMemo(() => {
    return Math.round(projectItems.reduce((acc, i) => acc + (Number(i.weightPct) || 0), 0) * 100) / 100;
  }, [projectItems]);

  const totalContract = useMemo(() => {
    return projectItems.reduce((acc, i) => acc + (Number(i.estimatedPrice) || 0), 0);
  }, [projectItems]);

  const totalRealized = useMemo(() => {
    return projectItems.reduce((acc, i) => acc + (Number(i.realizedValue) || 0), 0);
  }, [projectItems]);

  const cumulativeProgress = useMemo(() => {
    const val = projectItems.reduce((acc, i) => acc + (Number(i.progressPct) * (Number(i.weightPct) / 100)), 0);
    return Math.round(val * 100) / 100;
  }, [projectItems]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      division: DIVISIONS[2],
      subDivision: '',
      volume: 1,
      unit: 'm³',
      unitPrice: 1000000,
      weightPct: 5,
      progressPct: 0,
      status: 'Belum Mulai',
      notes: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: WorkItem) => {
    setEditingItem(item);
    setFormData({
      division: item.division,
      subDivision: item.subDivision,
      volume: item.volume,
      unit: item.unit,
      unitPrice: item.unitPrice,
      weightPct: item.weightPct,
      progressPct: item.progressPct,
      status: item.status,
      notes: item.notes
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subDivision.trim()) return;

    if (editingItem) {
      updateWorkItem({
        ...editingItem,
        division: formData.division,
        subDivision: formData.subDivision,
        volume: Number(formData.volume),
        unit: formData.unit,
        unitPrice: Number(formData.unitPrice),
        weightPct: Number(formData.weightPct),
        progressPct: Number(formData.progressPct),
        status: formData.progressPct >= 100 ? 'Selesai' : formData.progressPct > 0 ? 'Sedang Berjalan' : formData.status,
        notes: formData.notes,
        updatedDate: new Date().toISOString().split('T')[0]
      });
    } else {
      addWorkItem({
        projectId: activeProject.id,
        division: formData.division,
        subDivision: formData.subDivision,
        volume: Number(formData.volume),
        unit: formData.unit,
        unitPrice: Number(formData.unitPrice),
        weightPct: Number(formData.weightPct),
        progressPct: Number(formData.progressPct),
        status: formData.progressPct >= 100 ? 'Selesai' : formData.progressPct > 0 ? 'Sedang Berjalan' : formData.status,
        notes: formData.notes,
        updatedDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsFormOpen(false);
  };

  const handleExportExcel = () => {
    const rows = projectItems.map(i => ({
      'Divisi Pekerjaan': i.division,
      'Sub Divisi': i.subDivision,
      'Volume': i.volume,
      'Satuan': i.unit,
      'Harga Satuan (Rp)': i.unitPrice,
      'Perkiraan Harga (Rp)': i.estimatedPrice,
      'Bobot (%)': i.weightPct,
      'Progress (%)': i.progressPct,
      'Nilai Realisasi (Rp)': i.realizedValue,
      'Status': i.status,
      'Catatan': i.notes,
      'Tanggal Update': i.updatedDate
    }));
    exportTableToExcel(rows, `List_Pekerjaan_${activeProject.code}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Total Nilai Pekerjaan (WBS)</div>
          <div className="mt-1 text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {formatRupiah(totalContract)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Realisasi: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{formatRupiah(totalRealized)}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Progres Kumulatif Terbobot</div>
          <div className="mt-1 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {cumulativeProgress}%
          </div>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, cumulativeProgress)}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Total Akumulasi Bobot</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${totalWeight === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
              {totalWeight}%
            </span>
            <span className="text-xs text-neutral-500">/ 100% Target</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
            {totalWeight === 100 ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bobot pas 100%
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Total belum 100% (Selisih {Math.round((100 - totalWeight) * 100) / 100}%)
              </span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Item Pekerjaan</div>
          <div className="mt-1 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {projectItems.length}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Selesai: {projectItems.filter(i => i.progressPct >= 100).length} · Berjalan: {projectItems.filter(i => i.progressPct > 0 && i.progressPct < 100).length}
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filter, Spreadsheet & Tambah Pekerjaan */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari sub divisi, spesifikasi atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Division Filter */}
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">Semua Divisi Pekerjaan</option>
            {DIVISIONS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSpreadsheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Impor dari Excel / Google Sheets"
          >
            <Upload className="w-3.5 h-3.5 text-amber-500" />
            <span>Impor Spreadsheet</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Download Data ke Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Excel</span>
          </button>

          <button
            onClick={handleOpenAdd}
            disabled={!editMode}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-colors ${
              editMode
                ? 'bg-amber-500 hover:bg-amber-600 text-neutral-950'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
            }`}
            title={!editMode ? 'Aktifkan toggle "Mode Ubah Data" di header untuk menambah pekerjaan' : undefined}
          >
            {!editMode ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Tambah Pekerjaan</span>
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/70 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                <th className="py-3 px-3.5 font-semibold">No</th>
                <th className="py-3 px-3.5 font-semibold">Divisi & Sub Divisi</th>
                <th className="py-3 px-3.5 font-semibold text-right">Volume</th>
                <th className="py-3 px-3.5 font-semibold">Satuan</th>
                <th className="py-3 px-3.5 font-semibold text-right">Harga Satuan</th>
                <th className="py-3 px-3.5 font-semibold text-right">Perkiraan Harga</th>
                <th className="py-3 px-3.5 font-semibold text-right">Bobot</th>
                <th className="py-3 px-3.5 font-semibold text-right">Progress</th>
                <th className="py-3 px-3.5 font-semibold text-right">Nilai Realisasi</th>
                <th className="py-3 px-3.5 font-semibold">Catatan / Spesifikasi</th>
                <th className="py-3 px-3.5 font-semibold text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 px-3.5 text-neutral-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3.5 max-w-xs">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {item.subDivision}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {item.division}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-medium text-neutral-900 dark:text-neutral-100">
                      {new Intl.NumberFormat('id-ID').format(item.volume)}
                    </td>
                    <td className="py-3 px-3.5 text-neutral-600 dark:text-neutral-400">{item.unit}</td>
                    <td className="py-3 px-3.5 text-right font-mono text-neutral-700 dark:text-neutral-300">
                      {formatRupiah(item.unitPrice)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatRupiah(item.estimatedPrice)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-medium text-amber-600 dark:text-amber-400">
                      {item.weightPct}%
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <div className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                        {item.progressPct}%
                      </div>
                      <div className="w-16 bg-neutral-200 dark:bg-neutral-700 h-1 rounded-full ml-auto mt-1 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${item.progressPct}%` }} />
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatRupiah(item.realizedValue)}
                    </td>
                    <td className="py-3 px-3.5 max-w-xs text-[11px] text-neutral-500 truncate" title={item.notes}>
                      {item.notes || '-'}
                    </td>
                    <td className="py-3 px-3.5 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          disabled={!editMode}
                          className="p-1.5 text-neutral-500 hover:text-amber-500 dark:hover:text-amber-400 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={editMode ? 'Edit Pekerjaan' : 'Mode view saja'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus pekerjaan "${item.subDivision}"?`)) {
                              deleteWorkItem(item.id);
                            }
                          }}
                          disabled={!editMode}
                          className="p-1.5 text-neutral-500 hover:text-red-500 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={editMode ? 'Hapus' : 'Mode view saja'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-neutral-500">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">Belum ada item pekerjaan yang cocok.</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Klik &quot;Tambah Pekerjaan&quot; atau &quot;Impor Spreadsheet&quot; untuk menambahkan data.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal (Add / Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {editingItem ? 'Edit Item Pekerjaan' : 'Tambah Pekerjaan Baru'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Divisi Pekerjaan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value as DivisionType })}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                >
                  {DIVISIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Sub Divisi / Uraian Pekerjaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembesian Balok & Plat Lantai 3, Pasangan Bata Ringan..."
                  value={formData.subDivision}
                  onChange={(e) => setFormData({ ...formData, subDivision: e.target.value })}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Volume Pekerjaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Satuan Unit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="m³, m², m, Ls, Titik..."
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Harga Satuan (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Auto calculated price preview */}
              <div className="p-3 bg-neutral-100 dark:bg-neutral-800/60 rounded-lg flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Perkiraan Total Harga (Volume × Harga Satuan):
                </span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                  {formatRupiah(formData.volume * formData.unitPrice)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Bobot Pekerjaan (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.weightPct}
                    onChange={(e) => setFormData({ ...formData, weightPct: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Progress Pekerjaan Sekarang (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={formData.progressPct}
                    onChange={(e) => setFormData({ ...formData, progressPct: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Catatan / Spesifikasi Teknis / Kendala Lapangan
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan pelaksanaan, hasil uji slump, batch cor, dsb..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                />
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
                  className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-lg shadow-xs"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Pekerjaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spreadsheet Modal */}
      <SpreadsheetModal
        isOpen={isSpreadsheetOpen}
        onClose={() => setIsSpreadsheetOpen(false)}
        title="List Pekerjaan (WBS)"
        onDownloadTemplate={downloadTemplateListPekerjaan}
        onImportData={importWorkItems}
      />
    </div>
  );
};
