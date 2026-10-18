import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit2, 
  Trash2, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Lock,
  Building,
  User,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EquipmentItem, EquipmentCategory, EquipmentStatus } from '../../types';
import { SpreadsheetModal } from '../common/SpreadsheetModal';
import { downloadTemplateAlat, exportTableToExcel } from '../../utils/spreadsheet';

const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  'Alat Berat',
  'Mesin Ringan',
  'Power Tools',
  'Alat Ukur / Survey',
  'Alat Keselamatan (K3)',
  'Genset & Kelistrikan',
  'Pompa Air'
];

const STATUS_OPTIONS: EquipmentStatus[] = [
  'Siap Pakai',
  'Beroperasi',
  'Rusak / Butuh Servis',
  'Sedang Diservis',
  'Standby',
  'Selesai / Dikembalikan'
];

export const StokAlatTab: React.FC = () => {
  const { 
    activeProject, 
    equipmentList, 
    addEquipment, 
    updateEquipment, 
    deleteEquipment, 
    importEquipment,
    editMode 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOwnership, setSelectedOwnership] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [isSpreadsheetOpen, setIsSpreadsheetOpen] = useState(false);

  const [formData, setFormData] = useState({
    toolName: '',
    serialNumber: '',
    category: 'Power Tools' as EquipmentCategory,
    ownership: 'Milik Sendiri' as 'Milik Sendiri' | 'Sewa Rental',
    rentalVendor: '',
    rentalDailyRate: 0,
    entryDate: new Date().toISOString().split('T')[0],
    exitDate: '',
    status: 'Siap Pakai' as EquipmentStatus,
    assignedOperator: '',
    locationZone: '',
    notes: ''
  });

  const projectEquipment = useMemo(() => {
    return equipmentList.filter(e => e.projectId === activeProject.id);
  }, [equipmentList, activeProject.id]);

  const filteredEquipment = useMemo(() => {
    return projectEquipment.filter(item => {
      const matchSearch = item.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.assignedOperator && item.assignedOperator.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.locationZone && item.locationZone.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchOwnership = selectedOwnership === 'all' || item.ownership === selectedOwnership;
      return matchSearch && matchCategory && matchStatus && matchOwnership;
    });
  }, [projectEquipment, searchQuery, selectedCategory, selectedStatus, selectedOwnership]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      toolName: '',
      serialNumber: `EQ-${Date.now().toString().slice(-4)}`,
      category: 'Power Tools',
      ownership: 'Milik Sendiri',
      rentalVendor: '',
      rentalDailyRate: 0,
      entryDate: new Date().toISOString().split('T')[0],
      exitDate: '',
      status: 'Siap Pakai',
      assignedOperator: '',
      locationZone: 'Gudang Alat',
      notes: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: EquipmentItem) => {
    setEditingItem(item);
    setFormData({
      toolName: item.toolName,
      serialNumber: item.serialNumber,
      category: item.category,
      ownership: item.ownership,
      rentalVendor: item.rentalVendor || '',
      rentalDailyRate: item.rentalDailyRate || 0,
      entryDate: item.entryDate,
      exitDate: item.exitDate || '',
      status: item.status,
      assignedOperator: item.assignedOperator || '',
      locationZone: item.locationZone || '',
      notes: item.notes
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.toolName.trim()) return;

    if (editingItem) {
      updateEquipment({
        ...editingItem,
        toolName: formData.toolName,
        serialNumber: formData.serialNumber,
        category: formData.category,
        ownership: formData.ownership,
        rentalVendor: formData.ownership === 'Sewa Rental' ? formData.rentalVendor : undefined,
        rentalDailyRate: formData.ownership === 'Sewa Rental' ? Number(formData.rentalDailyRate) : undefined,
        entryDate: formData.entryDate,
        exitDate: formData.exitDate || undefined,
        status: formData.status,
        assignedOperator: formData.assignedOperator,
        locationZone: formData.locationZone,
        notes: formData.notes
      });
    } else {
      addEquipment({
        projectId: activeProject.id,
        toolName: formData.toolName,
        serialNumber: formData.serialNumber,
        category: formData.category,
        ownership: formData.ownership,
        rentalVendor: formData.ownership === 'Sewa Rental' ? formData.rentalVendor : undefined,
        rentalDailyRate: formData.ownership === 'Sewa Rental' ? Number(formData.rentalDailyRate) : undefined,
        entryDate: formData.entryDate,
        exitDate: formData.exitDate || undefined,
        status: formData.status,
        assignedOperator: formData.assignedOperator,
        locationZone: formData.locationZone,
        notes: formData.notes
      });
    }
    setIsFormOpen(false);
  };

  const handleExportExcel = () => {
    const rows = projectEquipment.map(item => ({
      'Nama Alat': item.toolName,
      'No Seri / Kode Aset': item.serialNumber,
      'Kategori': item.category,
      'Kepemilikan': item.ownership,
      'Vendor Rental': item.rentalVendor || '-',
      'Tarif Harian (Rp)': item.rentalDailyRate || 0,
      'Tanggal Masuk': item.entryDate,
      'Tanggal Keluar': item.exitDate || '-',
      'Status': item.status,
      'Operator Penanggung Jawab': item.assignedOperator || '-',
      'Zona Lokasi': item.locationZone || '-',
      'Keterangan': item.notes
    }));
    exportTableToExcel(rows, `Stok_Alat_${activeProject.code}`);
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
          <div className="text-xs text-neutral-500 font-medium">Total Unit Peralatan Proyek</div>
          <div className="mt-1 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {projectEquipment.length} Unit
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Excavator, crane, genset, stamper, bor, gerinda
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Alat Siap / Beroperasi</div>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {projectEquipment.filter(e => e.status === 'Beroperasi' || e.status === 'Siap Pakai').length} Unit
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            Kondisi produktif beroperasi
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Alat Rusak / Sedang Diservis</div>
          <div className="mt-1 text-2xl font-bold font-mono text-amber-500 flex items-center gap-1.5">
            <Wrench className="w-5 h-5 text-amber-500" />
            <span>{projectEquipment.filter(e => e.status === 'Rusak / Butuh Servis' || e.status === 'Sedang Diservis').length} Unit</span>
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
            Menunggu mekanik / suku cadang
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Alat Sewa Rental</div>
          <div className="mt-1 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {projectEquipment.filter(e => e.ownership === 'Sewa Rental').length} Unit
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Milik Sendiri: {projectEquipment.filter(e => e.ownership === 'Milik Sendiri').length} Unit
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
              placeholder="Cari nama alat, no seri, operator, zona..."
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
            <option value="all">Semua Kategori Alat</option>
            {EQUIPMENT_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">Semua Status Operasi</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={selectedOwnership}
            onChange={(e) => setSelectedOwnership(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">Semua Kepemilikan</option>
            <option value="Milik Sendiri">Milik Sendiri</option>
            <option value="Sewa Rental">Sewa Rental</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSpreadsheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-amber-500" />
            <span>Impor Spreadsheet</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 text-neutral-700 dark:text-neutral-300 transition-colors"
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
            <span>Tambah Alat</span>
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
                <th className="py-3 px-3.5 font-semibold">Nama Alat / Mesin</th>
                <th className="py-3 px-3.5 font-semibold">Kategori</th>
                <th className="py-3 px-3.5 font-semibold">No Seri / Aset</th>
                <th className="py-3 px-3.5 font-semibold">Kepemilikan & Biaya</th>
                <th className="py-3 px-3.5 font-semibold">Tanggal Masuk / Keluar</th>
                <th className="py-3 px-3.5 font-semibold">Status Alat</th>
                <th className="py-3 px-3.5 font-semibold">Operator & Lokasi</th>
                <th className="py-3 px-3.5 font-semibold">Keterangan</th>
                <th className="py-3 px-3.5 font-semibold text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 px-3.5 text-neutral-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3.5 font-bold text-neutral-900 dark:text-neutral-100 max-w-xs">
                      {item.toolName}
                    </td>
                    <td className="py-3 px-3.5 text-neutral-600 dark:text-neutral-400">{item.category}</td>
                    <td className="py-3 px-3.5 font-mono text-neutral-500">{item.serialNumber}</td>
                    <td className="py-3 px-3.5">
                      <div className="font-medium text-neutral-800 dark:text-neutral-200">
                        {item.ownership}
                      </div>
                      {item.ownership === 'Sewa Rental' && (
                        <div className="text-[11px] text-neutral-500 font-mono">
                          {item.rentalVendor ? `${item.rentalVendor} · ` : ''}{formatRupiah(item.rentalDailyRate || 0)}/hari
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                      <div>Masuk: {item.entryDate}</div>
                      <div>Keluar: {item.exitDate || '-'}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={`text-[11px] font-semibold ${
                        item.status === 'Beroperasi' || item.status === 'Siap Pakai'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : item.status.includes('Rusak') || item.status.includes('Servis')
                          ? 'text-amber-500'
                          : 'text-neutral-500'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-[11px]">
                      <div className="text-neutral-800 dark:text-neutral-200 font-medium">
                        {item.assignedOperator || '-'}
                      </div>
                      <div className="text-neutral-500">
                        {item.locationZone || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 max-w-xs text-[11px] text-neutral-500 truncate" title={item.notes}>
                      {item.notes || '-'}
                    </td>
                    <td className="py-3 px-3.5 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          disabled={!editMode}
                          className="p-1 text-neutral-500 hover:text-amber-500 disabled:opacity-30"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus alat "${item.toolName}"?`)) {
                              deleteEquipment(item.id);
                            }
                          }}
                          disabled={!editMode}
                          className="p-1 text-neutral-400 hover:text-red-500 disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-neutral-500">
                    <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">Belum ada unit peralatan yang cocok.</p>
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
                {editingItem ? 'Edit Data Peralatan' : 'Tambah Peralatan / Mesin Baru'}
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
                    Nama Alat / Mesin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Excavator Komatsu PC200, Stamper Kodok, Gerinda..."
                    value={formData.toolName}
                    onChange={(e) => setFormData({ ...formData, toolName: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    No Seri / Kode Aset <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="EXC-001 / AST-881"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Kategori Alat
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as EquipmentCategory })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  >
                    {EQUIPMENT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Status Operasional
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EquipmentStatus })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 font-semibold"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Kepemilikan
                  </label>
                  <select
                    value={formData.ownership}
                    onChange={(e) => setFormData({ ...formData, ownership: e.target.value as any })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Milik Sendiri">Milik Sendiri</option>
                    <option value="Sewa Rental">Sewa Rental</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Vendor Rental (Jika Sewa)
                  </label>
                  <input
                    type="text"
                    disabled={formData.ownership !== 'Sewa Rental'}
                    placeholder="PT Mitra Alat..."
                    value={formData.rentalVendor}
                    onChange={(e) => setFormData({ ...formData, rentalVendor: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 disabled:opacity-40"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tarif Sewa/Hari (Rp)
                  </label>
                  <input
                    type="number"
                    disabled={formData.ownership !== 'Sewa Rental'}
                    placeholder="Contoh: 1850000"
                    value={formData.rentalDailyRate}
                    onChange={(e) => setFormData({ ...formData, rentalDailyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tanggal Masuk Proyek <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tanggal Keluar / Demobilisasi
                  </label>
                  <input
                    type="date"
                    value={formData.exitDate}
                    onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Operator / Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Surya Wibowo (Operator SIO)"
                    value={formData.assignedOperator}
                    onChange={(e) => setFormData({ ...formData, assignedOperator: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Zona / Lokasi Pemakaian
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Area Galian Barat, Workshop Pembesian"
                    value={formData.locationZone}
                    onChange={(e) => setFormData({ ...formData, locationZone: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Keterangan Kondisi & Jadwal Pemeliharaan
                </label>
                <textarea
                  rows={2}
                  placeholder="Ganti oli rutin, servis berkala, sertifikasi Disnaker..."
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
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Peralatan'}
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
        title="Stok Alat & Mesin"
        onDownloadTemplate={downloadTemplateAlat}
        onImportData={importEquipment}
      />
    </div>
  );
};
