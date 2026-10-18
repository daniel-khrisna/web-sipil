import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Edit2, 
  Trash2, 
  Phone, 
  Building2, 
  Briefcase, 
  Lock,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Worker, WorkerCategory } from '../../types';
import { SpreadsheetModal } from '../common/SpreadsheetModal';
import { downloadTemplateSDM, exportTableToExcel } from '../../utils/spreadsheet';

const CATEGORIES: WorkerCategory[] = [
  'Ahli',
  'Teknis',
  'Logistik',
  'Tenaga Harian',
  'Borongan',
  'Konsultan'
];

export const SdmTab: React.FC = () => {
  const { 
    activeProject, 
    workers, 
    addWorker, 
    updateWorker, 
    deleteWorker, 
    importWorkers,
    editMode 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [isSpreadsheetOpen, setIsSpreadsheetOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    position: '',
    category: 'Tenaga Harian' as WorkerCategory,
    type: 'Internal' as 'Internal' | 'Vendor',
    vendorName: '',
    phone: '',
    dailyRate: 0,
    status: 'Aktif' as Worker['status'],
    notes: ''
  });

  const projectWorkers = useMemo(() => {
    return workers.filter(w => w.projectId === activeProject.id);
  }, [workers, activeProject.id]);

  const filteredWorkers = useMemo(() => {
    return projectWorkers.filter(w => {
      const matchSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (w.vendorName && w.vendorName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = selectedCategory === 'all' || w.category === selectedCategory;
      const matchType = selectedType === 'all' || w.type === selectedType;
      return matchSearch && matchCategory && matchType;
    });
  }, [projectWorkers, searchQuery, selectedCategory, selectedType]);

  const handleOpenAdd = () => {
    setEditingWorker(null);
    setFormData({
      name: '',
      position: '',
      category: 'Tenaga Harian',
      type: 'Internal',
      vendorName: '',
      phone: '',
      dailyRate: 150000,
      status: 'Aktif',
      notes: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (w: Worker) => {
    setEditingWorker(w);
    setFormData({
      name: w.name,
      position: w.position,
      category: w.category,
      type: w.type,
      vendorName: w.vendorName || '',
      phone: w.phone,
      dailyRate: w.dailyRate || 0,
      status: w.status,
      notes: w.notes
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.position.trim()) return;

    if (editingWorker) {
      updateWorker({
        ...editingWorker,
        name: formData.name,
        position: formData.position,
        category: formData.category,
        type: formData.type,
        vendorName: formData.type === 'Vendor' ? formData.vendorName : undefined,
        phone: formData.phone,
        dailyRate: Number(formData.dailyRate) || undefined,
        status: formData.status,
        notes: formData.notes
      });
    } else {
      addWorker({
        projectId: activeProject.id,
        name: formData.name,
        position: formData.position,
        category: formData.category,
        type: formData.type,
        vendorName: formData.type === 'Vendor' ? formData.vendorName : undefined,
        phone: formData.phone,
        dailyRate: Number(formData.dailyRate) || undefined,
        status: formData.status,
        notes: formData.notes
      });
    }
    setIsFormOpen(false);
  };

  const handleExportExcel = () => {
    const rows = projectWorkers.map(w => ({
      'Nama Tenaga Kerja': w.name,
      'Jabatan': w.position,
      'Kategori': w.category,
      'Internal atau Vendor': w.type,
      'Nama Vendor / Subkon': w.vendorName || '-',
      'No Telepon / HP': w.phone,
      'Upah Harian (Rp)': w.dailyRate || 0,
      'Status': w.status,
      'Catatan': w.notes
    }));
    exportTableToExcel(rows, `SDM_TenagaKerja_${activeProject.code}`);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Total Personel Terdata</div>
          <div className="mt-1 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {projectWorkers.length} Orang
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            {projectWorkers.filter(w => w.status === 'Aktif').length} berstatus Aktif
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Tim Internal Proyek</div>
          <div className="mt-1 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {projectWorkers.filter(w => w.type === 'Internal').length} Orang
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Site Manager, Teknis, Logistik & K3
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Vendor / Subkon / Mandor</div>
          <div className="mt-1 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {projectWorkers.filter(w => w.type === 'Vendor').length} Orang
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Borongan pembesian, bekisting & cor
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Kategori Tenaga Ahli & Konsultan</div>
          <div className="mt-1 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {projectWorkers.filter(w => w.category === 'Ahli' || w.category === 'Konsultan').length} Orang
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            SKA Sertifikasi & Pengawas MK
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama pekerja, jabatan, atau vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">Semua Kategori</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">Semua Tipe (Internal & Vendor)</option>
            <option value="Internal">Internal</option>
            <option value="Vendor">Vendor / Subkon</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSpreadsheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-amber-500" />
            <span>Impor Spreadsheet</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
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
          >
            {!editMode ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Tambah SDM</span>
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
                <th className="py-3 px-3.5 font-semibold">Nama Tenaga Kerja</th>
                <th className="py-3 px-3.5 font-semibold">Jabatan / Posisi</th>
                <th className="py-3 px-3.5 font-semibold">Kategori</th>
                <th className="py-3 px-3.5 font-semibold">Tipe Asal</th>
                <th className="py-3 px-3.5 font-semibold">Vendor / Mandor</th>
                <th className="py-3 px-3.5 font-semibold">Kontak HP</th>
                <th className="py-3 px-3.5 font-semibold text-right">Upah Harian</th>
                <th className="py-3 px-3.5 font-semibold">Status</th>
                <th className="py-3 px-3.5 font-semibold">Catatan</th>
                <th className="py-3 px-3.5 font-semibold text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {filteredWorkers.length > 0 ? (
                filteredWorkers.map((w, idx) => (
                  <tr key={w.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 px-3.5 text-neutral-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3.5 font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                      {w.name}
                    </td>
                    <td className="py-3 px-3.5 text-neutral-700 dark:text-neutral-300 font-medium">
                      {w.position}
                    </td>
                    <td className="py-3 px-3.5 text-neutral-600 dark:text-neutral-400">
                      {w.category}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={`text-[11px] font-medium ${w.type === 'Internal' ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-600 dark:text-neutral-400'}`}>
                        {w.type}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-neutral-600 dark:text-neutral-400 text-[11px]">
                      {w.vendorName || '-'}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-neutral-600 dark:text-neutral-400">
                      {w.phone || '-'}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-neutral-800 dark:text-neutral-200">
                      {w.dailyRate ? formatRupiah(w.dailyRate) : '-'}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={`text-[11px] font-medium ${
                        w.status === 'Aktif' 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-neutral-400'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 max-w-xs text-[11px] text-neutral-500 truncate" title={w.notes}>
                      {w.notes || '-'}
                    </td>
                    <td className="py-3 px-3.5 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(w)}
                          disabled={!editMode}
                          className="p-1.5 text-neutral-500 hover:text-amber-500 dark:hover:text-amber-400 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus data ${w.name}?`)) {
                              deleteWorker(w.id);
                            }
                          }}
                          disabled={!editMode}
                          className="p-1.5 text-neutral-500 hover:text-red-500 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">Belum ada data tenaga kerja.</p>
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
                {editingWorker ? 'Edit Data Tenaga Kerja' : 'Tambah Tenaga Kerja Baru'}
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
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ir. Agus Susanto, S.T. / Suhartono"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Jabatan / Posisi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Mandor Pembesian, Site Engineer..."
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as WorkerCategory })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Internal atau Vendor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Internal">Internal Perusahaan</option>
                    <option value="Vendor">Vendor / Subkon Luar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Nama Vendor / Kelompok Mandor
                  </label>
                  <input
                    type="text"
                    disabled={formData.type === 'Internal'}
                    placeholder={formData.type === 'Internal' ? 'Tidak perlu diisi (Internal)' : 'Nama Subkon / Kelompok'}
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Upah Harian (Rp - Opsional)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 150000"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Status Personel
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                    <option value="Cuti">Cuti</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Keahlian / Sertifikasi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SKA Madya, SIO Alat..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
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
                  className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-lg shadow-xs"
                >
                  {editingWorker ? 'Simpan Perubahan' : 'Tambah Tenaga Kerja'}
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
        title="SDM / Tenaga Kerja"
        onDownloadTemplate={downloadTemplateSDM}
        onImportData={importWorkers}
      />
    </div>
  );
};
