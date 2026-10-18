import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit2, 
  Trash2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  Lock,
  Layers,
  FileSpreadsheet,
  X,
  History
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MaterialStock, MaterialCategory, MaterialStockMovement } from '../../types';
import { SpreadsheetModal } from '../common/SpreadsheetModal';
import { downloadTemplateBahan, exportTableToExcel } from '../../utils/spreadsheet';

const MATERIAL_CATEGORIES: MaterialCategory[] = [
  'Baja & Besi',
  'Semen',
  'Agregat & Pasir',
  'Bata & Dinding',
  'Kayu & Triplek',
  'Perpipaan & Plumbing',
  'BBM & Energi',
  'Finishing & Cat',
  'Elektrikal',
  'Lainnya'
];

export const StokBahanTab: React.FC = () => {
  const { 
    activeProject, 
    materialStocks, 
    addMaterial, 
    updateMaterial, 
    deleteMaterial, 
    addStockMovement, 
    deleteStockMovement, 
    importMaterials,
    editMode 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStockStatus, setFilterStockStatus] = useState<string>('all'); // 'all', 'low', 'safe'

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialStock | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedMaterialForMovement, setSelectedMaterialForMovement] = useState<MaterialStock | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedMaterialForHistory, setSelectedMaterialForHistory] = useState<MaterialStock | null>(null);
  const [isSpreadsheetOpen, setIsSpreadsheetOpen] = useState(false);

  // Form Material State
  const [formData, setFormData] = useState({
    materialName: '',
    category: 'Baja & Besi' as MaterialCategory,
    unit: 'Batang',
    initialStock: 100,
    minimumStock: 20,
    notes: ''
  });

  // Movement Form State
  const [movementData, setMovementData] = useState({
    type: 'Masuk' as 'Masuk' | 'Keluar',
    date: new Date().toISOString().split('T')[0],
    quantity: 50,
    referenceDoc: '',
    partnerOrDivision: '',
    notes: ''
  });

  const projectMaterials = useMemo(() => {
    return materialStocks.filter(m => m.projectId === activeProject.id);
  }, [materialStocks, activeProject.id]);

  // Calculated materials with real-time in, out, and current stock
  const materialsWithStock = useMemo(() => {
    return projectMaterials.map(m => {
      const inQty = m.movements.filter(mv => mv.type === 'Masuk').reduce((acc, c) => acc + c.quantity, 0);
      const outQty = m.movements.filter(mv => mv.type === 'Keluar').reduce((acc, c) => acc + c.quantity, 0);
      const currentStock = m.initialStock + inQty - outQty;
      const isLowStock = currentStock <= m.minimumStock;
      return {
        ...m,
        inQty,
        outQty,
        currentStock,
        isLowStock
      };
    });
  }, [projectMaterials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materialsWithStock.filter(m => {
      const matchSearch = m.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.notes.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'all' || m.category === selectedCategory;
      const matchStatus = filterStockStatus === 'all' || 
                          (filterStockStatus === 'low' && m.isLowStock) || 
                          (filterStockStatus === 'safe' && !m.isLowStock);
      return matchSearch && matchCategory && matchStatus;
    });
  }, [materialsWithStock, searchQuery, selectedCategory, filterStockStatus]);

  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setFormData({
      materialName: '',
      category: 'Baja & Besi',
      unit: 'Batang',
      initialStock: 100,
      minimumStock: 25,
      notes: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (m: MaterialStock) => {
    setEditingMaterial(m);
    setFormData({
      materialName: m.materialName,
      category: m.category,
      unit: m.unit,
      initialStock: m.initialStock,
      minimumStock: m.minimumStock,
      notes: m.notes
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.materialName.trim()) return;

    if (editingMaterial) {
      updateMaterial({
        ...editingMaterial,
        materialName: formData.materialName,
        category: formData.category,
        unit: formData.unit,
        initialStock: Number(formData.initialStock),
        minimumStock: Number(formData.minimumStock),
        notes: formData.notes
      });
    } else {
      addMaterial({
        projectId: activeProject.id,
        materialName: formData.materialName,
        category: formData.category,
        unit: formData.unit,
        initialStock: Number(formData.initialStock),
        minimumStock: Number(formData.minimumStock),
        notes: formData.notes
      });
    }
    setIsFormOpen(false);
  };

  const handleOpenMovement = (m: MaterialStock, defaultType: 'Masuk' | 'Keluar') => {
    setSelectedMaterialForMovement(m);
    setMovementData({
      type: defaultType,
      date: new Date().toISOString().split('T')[0],
      quantity: 10,
      referenceDoc: defaultType === 'Masuk' ? 'SJ-Vendor-01' : 'RFW-Mandor-01',
      partnerOrDivision: defaultType === 'Masuk' ? 'Supplier Utama' : 'Tim Pembesian Lantai 3',
      notes: ''
    });
    setIsMovementModalOpen(true);
  };

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialForMovement || movementData.quantity <= 0) return;

    addStockMovement(selectedMaterialForMovement.id, {
      type: movementData.type,
      date: movementData.date,
      quantity: Number(movementData.quantity),
      referenceDoc: movementData.referenceDoc || undefined,
      partnerOrDivision: movementData.partnerOrDivision || undefined,
      notes: movementData.notes || undefined
    });

    setIsMovementModalOpen(false);
  };

  const handleExportExcel = () => {
    const rows = materialsWithStock.map(m => ({
      'Nama Bahan': m.materialName,
      'Kategori': m.category,
      'Satuan': m.unit,
      'Stok Awal': m.initialStock,
      'Total Masuk': m.inQty,
      'Total Keluar': m.outQty,
      'Sisa Stok Sekarang': m.currentStock,
      'Batas Minimum Stok': m.minimumStock,
      'Status Stok': m.isLowStock ? 'Kritis / Menipis' : 'Aman',
      'Catatan': m.notes
    }));
    exportTableToExcel(rows, `Stok_Bahan_${activeProject.code}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Total Jenis Bahan Terdata</div>
          <div className="mt-1 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {projectMaterials.length} Material
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Besi, semen, bata, pasir, kayu, BBM, listrik
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Bahan Stok Menipis / Kritis</div>
          <div className="mt-1 text-2xl font-bold font-mono text-red-500 flex items-center gap-1.5">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>{materialsWithStock.filter(m => m.isLowStock).length} Item</span>
          </div>
          <div className="text-[11px] text-red-600 dark:text-red-400 mt-1">
            Di bawah batas minimum cadangan proyek
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Bahan Stok Aman</div>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {materialsWithStock.filter(m => !m.isLowStock).length} Item
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Cukup untuk jadwal kerja 2 minggu ke depan
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Total Log Mutasi Bahan</div>
          <div className="mt-1 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {projectMaterials.reduce((acc, m) => acc + m.movements.length, 0)} Log
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Surat jalan vendor & opname mandor
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
              placeholder="Cari nama material, kategori, atau catatan..."
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
            <option value="all">Semua Kategori Bahan</option>
            {MATERIAL_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterStockStatus}
            onChange={(e) => setFilterStockStatus(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">Semua Status Stok</option>
            <option value="low">Kritis / Menipis Saja</option>
            <option value="safe">Stok Aman Saja</option>
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
            <span>Tambah Bahan</span>
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
                <th className="py-3 px-3.5 font-semibold">Nama Bahan Material</th>
                <th className="py-3 px-3.5 font-semibold">Kategori</th>
                <th className="py-3 px-3.5 font-semibold">Satuan</th>
                <th className="py-3 px-3.5 font-semibold text-right">Stok Awal</th>
                <th className="py-3 px-3.5 font-semibold text-right text-emerald-600 dark:text-emerald-400">Total Masuk</th>
                <th className="py-3 px-3.5 font-semibold text-right text-red-500">Total Keluar</th>
                <th className="py-3 px-3.5 font-semibold text-right font-bold text-neutral-900 dark:text-neutral-100">
                  Sisa Stok Sekarang
                </th>
                <th className="py-3 px-3.5 font-semibold text-right">Batas Min</th>
                <th className="py-3 px-3.5 font-semibold">Kondisi Stok</th>
                <th className="py-3 px-3.5 font-semibold text-center no-print">Mutasi Stok</th>
                <th className="py-3 px-3.5 font-semibold text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 px-3.5 text-neutral-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3.5 max-w-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      <div>{m.materialName}</div>
                      {m.notes && <div className="text-[11px] text-neutral-500 font-normal truncate">{m.notes}</div>}
                    </td>
                    <td className="py-3 px-3.5 text-neutral-600 dark:text-neutral-400">{m.category}</td>
                    <td className="py-3 px-3.5 text-neutral-600 dark:text-neutral-400">{m.unit}</td>
                    <td className="py-3 px-3.5 text-right font-mono text-neutral-600 dark:text-neutral-400">
                      {m.initialStock}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      +{m.inQty}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-red-500 font-medium">
                      -{m.outQty}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                      {m.currentStock}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-neutral-500">
                      {m.minimumStock}
                    </td>
                    <td className="py-3 px-3.5">
                      {m.isLowStock ? (
                        <span className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Kritis / Menipis
                        </span>
                      ) : (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          Aman
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-center no-print">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenMovement(m, 'Masuk')}
                          disabled={!editMode}
                          className="px-2 py-1 text-[11px] font-semibold bg-emerald-600/15 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-400 hover:text-white rounded transition-colors disabled:opacity-40"
                          title="Catat barang masuk (Surat Jalan)"
                        >
                          + Masuk
                        </button>
                        <button
                          onClick={() => handleOpenMovement(m, 'Keluar')}
                          disabled={!editMode}
                          className="px-2 py-1 text-[11px] font-semibold bg-red-600/15 hover:bg-red-600 text-red-700 dark:text-red-400 hover:text-white rounded transition-colors disabled:opacity-40"
                          title="Catat barang keluar (Dipakai lapangan)"
                        >
                          - Keluar
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMaterialForHistory(m);
                            setIsHistoryModalOpen(true);
                          }}
                          className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                          title="Lihat riwayat mutasi"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          disabled={!editMode}
                          className="p-1 text-neutral-500 hover:text-amber-500 disabled:opacity-30"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus material "${m.materialName}"?`)) {
                              deleteMaterial(m.id);
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
                  <td colSpan={12} className="py-12 text-center text-neutral-500">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">Belum ada bahan material yang cocok.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Material Baru / Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {editingMaterial ? 'Edit Bahan Material' : 'Tambah Bahan Material Baru'}
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
                  Nama Bahan Material <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Besi Beton D16 Ulir, Semen Padang 50kg, Solar B35..."
                  value={formData.materialName}
                  onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Kategori Bahan
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as MaterialCategory })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  >
                    {MATERIAL_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Satuan Unit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Batang, Zak, m³, Lembar, Liter, Kwh..."
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Stok Awal di Proyek <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.initialStock}
                    onChange={(e) => setFormData({ ...formData, initialStock: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Batas Minimum Cadangan (Reorder Level) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Keterangan / Spesifikasi / Lokasi Gudang
                </label>
                <textarea
                  rows={2}
                  placeholder="Gudang A, terlindung terpal, bersertifikat SNI..."
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
                  {editingMaterial ? 'Simpan Perubahan' : 'Tambah Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Catat Mutasi (Barang Masuk / Keluar) */}
      {isMovementModalOpen && selectedMaterialForMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Catat Mutasi: {selectedMaterialForMovement.materialName}
                </h3>
                <p className="text-xs text-neutral-500">
                  Satuan: <span className="font-semibold">{selectedMaterialForMovement.unit}</span>
                </p>
              </div>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMovementSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Jenis Mutasi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={movementData.type}
                    onChange={(e) => setMovementData({ ...movementData, type: e.target.value as any })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 font-semibold"
                  >
                    <option value="Masuk">Barang Masuk (Penerimaan)</option>
                    <option value="Keluar">Barang Keluar (Dipakai)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Jumlah / Qty ({selectedMaterialForMovement.unit}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={movementData.quantity}
                    onChange={(e) => setMovementData({ ...movementData, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tanggal Mutasi
                </label>
                <input
                  type="date"
                  required
                  value={movementData.date}
                  onChange={(e) => setMovementData({ ...movementData, date: e.target.value })}
                  className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  No Surat Jalan / SPB / Referensi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: SJ-KS-9901 / SPB-RSUD-014"
                  value={movementData.referenceDoc}
                  onChange={(e) => setMovementData({ ...movementData, referenceDoc: e.target.value })}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  {movementData.type === 'Masuk' ? 'Nama Vendor / Supplier' : 'Divisi / Mandor Penerima'}
                </label>
                <input
                  type="text"
                  placeholder={movementData.type === 'Masuk' ? 'PT Krakatau Steel, CV Pasir Jaya...' : 'Mandor Pembesian Lt 3, Pengecoran...'}
                  value={movementData.partnerOrDivision}
                  onChange={(e) => setMovementData({ ...movementData, partnerOrDivision: e.target.value })}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Catatan Lapangan
                </label>
                <input
                  type="text"
                  placeholder="Kondisi fisik utuh, uji slump, dsb..."
                  value={movementData.notes}
                  onChange={(e) => setMovementData({ ...movementData, notes: e.target.value })}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs ${
                    movementData.type === 'Masuk' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Simpan Catatan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Riwayat Mutasi Lengkap */}
      {isHistoryModalOpen && selectedMaterialForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Kartu Riwayat Stok: {selectedMaterialForHistory.materialName}
                </h3>
                <p className="text-xs text-neutral-500">
                  Stok Awal: <strong className="font-mono">{selectedMaterialForHistory.initialStock} {selectedMaterialForHistory.unit}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 text-xs">
              {selectedMaterialForHistory.movements.length > 0 ? (
                selectedMaterialForHistory.movements.map((mv) => (
                  <div
                    key={mv.id}
                    className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          mv.type === 'Masuk' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'
                        }`}>
                          {mv.type === 'Masuk' ? '+ Masuk' : '- Keluar'}
                        </span>
                        <span className="font-mono font-medium text-neutral-500">{mv.date}</span>
                        {mv.referenceDoc && (
                          <span className="font-mono text-neutral-600 dark:text-neutral-300">({mv.referenceDoc})</span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                        Pihak: <strong>{mv.partnerOrDivision || '-'}</strong> {mv.notes ? `· ${mv.notes}` : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold text-sm ${
                        mv.type === 'Masuk' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                      }`}>
                        {mv.type === 'Masuk' ? '+' : '-'}{mv.quantity} {selectedMaterialForHistory.unit}
                      </div>
                      {editMode && (
                        <button
                          onClick={() => deleteStockMovement(selectedMaterialForHistory.id, mv.id)}
                          className="text-[10px] text-red-500 hover:underline mt-1"
                        >
                          Hapus Log
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-neutral-500">
                  Belum ada catatan mutasi masuk atau keluar untuk material ini.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 text-right">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spreadsheet Modal */}
      <SpreadsheetModal
        isOpen={isSpreadsheetOpen}
        onClose={() => setIsSpreadsheetOpen(false)}
        title="Stok Bahan Gudang"
        onDownloadTemplate={downloadTemplateBahan}
        onImportData={importMaterials}
      />
    </div>
  );
};
