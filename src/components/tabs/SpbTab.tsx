import React, { useState, useMemo } from 'react';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Camera, 
  Download, 
  Trash2, 
  Edit2, 
  ExternalLink, 
  Printer, 
  Lock, 
  AlertCircle,
  X,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  SPBSubmission, 
  SPBItem, 
  SPBItemStatus, 
  SPBPaymentStatus, 
  SPBPaymentMethod 
} from '../../types';
import { PhotoViewerModal } from '../common/PhotoViewerModal';

export const SpbTab: React.FC = () => {
  const { 
    activeProject, 
    spbList, 
    addSPB, 
    updateSPB, 
    deleteSPB, 
    approveSPB, 
    currentUser,
    editMode 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterItemStatus, setFilterItemStatus] = useState<string>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');

  // Form Modal (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSpb, setEditingSpb] = useState<SPBSubmission | null>(null);

  // Print voucher preview modal
  const [printVoucherSpb, setPrintVoucherSpb] = useState<SPBSubmission | null>(null);

  // Photo viewer modal
  const [photoViewer, setPhotoViewer] = useState<{ isOpen: boolean; title: string; url?: string }>({
    isOpen: false,
    title: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    submissionDate: new Date().toISOString().split('T')[0],
    items: [
      { id: '1', itemName: '', volume: 1, unit: 'Batang', estimatedPrice: 0, totalPrice: 0, purpose: '' }
    ] as SPBItem[],
    itemStatus: 'Belum Dipesan' as SPBItemStatus,
    paymentStatus: 'Belum Dibayar' as SPBPaymentStatus,
    paymentMethod: 'Cash' as SPBPaymentMethod,
    tempoDueDate: '',
    spbPhotoUrl: '',
    supplierInvoicePhotoUrl: '',
    notes: ''
  });

  const projectSpbs = useMemo(() => {
    return spbList.filter(s => s.projectId === activeProject.id);
  }, [spbList, activeProject.id]);

  const filteredSpbs = useMemo(() => {
    return projectSpbs.filter(s => {
      const matchSearch = s.spbNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.items.some(i => i.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || i.purpose.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchItem = filterItemStatus === 'all' || s.itemStatus === filterItemStatus;
      const matchPay = filterPaymentStatus === 'all' || s.paymentStatus === filterPaymentStatus;
      return matchSearch && matchItem && matchPay;
    });
  }, [projectSpbs, searchQuery, filterItemStatus, filterPaymentStatus]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleOpenAdd = () => {
    setEditingSpb(null);
    setFormData({
      submissionDate: new Date().toISOString().split('T')[0],
      items: [
        { id: `spbi-${Date.now()}`, itemName: '', volume: 1, unit: 'Zak', estimatedPrice: 75000, totalPrice: 75000, purpose: '' }
      ],
      itemStatus: 'Belum Dipesan',
      paymentStatus: 'Belum Dibayar',
      paymentMethod: 'Cash',
      tempoDueDate: '',
      spbPhotoUrl: '',
      supplierInvoicePhotoUrl: '',
      notes: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (spb: SPBSubmission) => {
    setEditingSpb(spb);
    setFormData({
      submissionDate: spb.submissionDate,
      items: spb.items.map(i => ({ ...i })),
      itemStatus: spb.itemStatus,
      paymentStatus: spb.paymentStatus,
      paymentMethod: spb.paymentMethod,
      tempoDueDate: spb.tempoDueDate || '',
      spbPhotoUrl: spb.spbPhotoUrl || '',
      supplierInvoicePhotoUrl: spb.supplierInvoicePhotoUrl || '',
      notes: spb.notes
    });
    setIsFormOpen(true);
  };

  const handleItemChange = (index: number, field: keyof SPBItem, value: any) => {
    const updated = [...formData.items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'volume' || field === 'estimatedPrice') {
      const vol = field === 'volume' ? Number(value) : updated[index].volume;
      const price = field === 'estimatedPrice' ? Number(value) : updated[index].estimatedPrice;
      updated[index].totalPrice = vol * price;
    }
    setFormData({ ...formData, items: updated });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { id: `spbi-${Date.now()}`, itemName: '', volume: 1, unit: 'Unit', estimatedPrice: 0, totalPrice: 0, purpose: '' }
      ]
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0 || !formData.items[0].itemName.trim()) {
      alert('Masukkan minimal satu item bahan/alat.');
      return;
    }

    if (editingSpb) {
      updateSPB({
        ...editingSpb,
        submissionDate: formData.submissionDate,
        items: formData.items,
        itemStatus: formData.itemStatus,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        tempoDueDate: formData.paymentMethod === 'Tempo' ? formData.tempoDueDate : undefined,
        spbPhotoUrl: formData.spbPhotoUrl,
        supplierInvoicePhotoUrl: formData.supplierInvoicePhotoUrl,
        notes: formData.notes
      });
    } else {
      addSPB({
        projectId: activeProject.id,
        submissionDate: formData.submissionDate,
        items: formData.items,
        logisticsApproval: {
          approved: false,
          officerName: activeProject.logisticsOfficer || 'Petugas Logistik'
        },
        pjApproval: {
          approved: false,
          officerName: activeProject.siteManager || 'Project Manager'
        },
        spbPhotoUrl: formData.spbPhotoUrl,
        supplierInvoicePhotoUrl: formData.supplierInvoicePhotoUrl,
        itemStatus: formData.itemStatus,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        tempoDueDate: formData.paymentMethod === 'Tempo' ? formData.tempoDueDate : undefined,
        notes: formData.notes
      });
    }
    setIsFormOpen(false);
  };

  // Quick photo upload helper simulation (sets realistic civil image)
  const handleSimulatePhotoUpload = (field: 'spb' | 'invoice') => {
    if (!editMode) return;
    const samplePhotos = {
      spb: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      invoice: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
    };
    if (field === 'spb') {
      setFormData(prev => ({ ...prev, spbPhotoUrl: samplePhotos.spb }));
    } else {
      setFormData(prev => ({ ...prev, supplierInvoicePhotoUrl: samplePhotos.invoice }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Total Nilai Pengajuan SPB</div>
          <div className="mt-1 text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {formatRupiah(projectSpbs.reduce((acc, s) => acc + s.totalAmount, 0))}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Dari {projectSpbs.length} surat pengajuan
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Persetujuan TTD Lengkap</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {projectSpbs.filter(s => s.logisticsApproval.approved && s.pjApproval.approved).length}
            </span>
            <span className="text-xs text-neutral-500 font-mono">/ {projectSpbs.length} SPB</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Logistik & PJ Proyek
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Status Barang Datang</div>
          <div className="mt-1 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {projectSpbs.filter(s => s.itemStatus === 'Sudah Datang Lengkap').length} Lengkap
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
            {projectSpbs.filter(s => s.itemStatus === 'Belum Dipesan').length} Belum dipesan ke supplier
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Skema Pembayaran Tempo / Reimburse</div>
          <div className="mt-1 text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {projectSpbs.filter(s => s.paymentMethod === 'Tempo').length} Tempo
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Reimburse Logistik: {projectSpbs.filter(s => s.paymentMethod === 'Reimburse Logistik').length}
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
              placeholder="Cari no SPB, nama bahan/alat, atau peruntukan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <select
            value={filterItemStatus}
            onChange={(e) => setFilterItemStatus(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">Semua Status Barang</option>
            <option value="Belum Dipesan">Belum Dipesan</option>
            <option value="Dipesan">Dipesan ke Supplier</option>
            <option value="Sudah Datang Sebagian">Sudah Datang Sebagian</option>
            <option value="Sudah Datang Lengkap">Sudah Datang Lengkap</option>
          </select>

          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">Semua Status Bayar</option>
            <option value="Belum Dibayar">Belum Dibayar Pusat</option>
            <option value="Sudah Dibayar">Sudah Dibayar</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
            <span>Buat SPB Baru</span>
          </button>
        </div>
      </div>

      {/* List SPB Submissions */}
      <div className="space-y-4">
        {filteredSpbs.length > 0 ? (
          filteredSpbs.map((spb) => {
            const hasBothSignatures = spb.logisticsApproval.approved && spb.pjApproval.approved;

            return (
              <div
                key={spb.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
              >
                {/* Header Strip of Card */}
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      {spb.spbNumber}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">
                      Tanggal: {spb.submissionDate}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Status Barang */}
                    <span className="font-medium text-[11px] text-neutral-700 dark:text-neutral-300">
                      Barang: <strong className={spb.itemStatus === 'Sudah Datang Lengkap' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}>{spb.itemStatus}</strong>
                    </span>
                    <span>·</span>
                    {/* Status Bayar */}
                    <span className="font-medium text-[11px] text-neutral-700 dark:text-neutral-300">
                      Bayar: <strong className={spb.paymentStatus === 'Sudah Dibayar' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>{spb.paymentStatus}</strong> ({spb.paymentMethod})
                    </span>
                  </div>
                </div>

                {/* Items Table inside Card */}
                <div className="my-3 overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 text-[11px]">
                        <th className="py-1.5 font-medium">Bahan / Alat yang Diajukan</th>
                        <th className="py-1.5 font-medium">Volume & Unit</th>
                        <th className="py-1.5 font-medium text-right">Harga Satuan (Est)</th>
                        <th className="py-1.5 font-medium text-right">Total Perkiraan</th>
                        <th className="py-1.5 font-medium">Peruntukan (Untuk Apa)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/40">
                      {spb.items.map((item, idx) => (
                        <tr key={idx} className="text-neutral-800 dark:text-neutral-200">
                          <td className="py-2 font-semibold">{item.itemName}</td>
                          <td className="py-2 font-mono">{item.volume} {item.unit}</td>
                          <td className="py-2 text-right font-mono text-neutral-600 dark:text-neutral-400">
                            {formatRupiah(item.estimatedPrice)}
                          </td>
                          <td className="py-2 text-right font-mono font-bold text-neutral-900 dark:text-neutral-100">
                            {formatRupiah(item.totalPrice || item.volume * item.estimatedPrice)}
                          </td>
                          <td className="py-2 text-[11px] text-neutral-500 max-w-xs">{item.purpose || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Section: 2 TTD Signatures & Photos */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Tanda Tangan 1: Logistik */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        1. TTD Logistik Proyek:
                      </span>
                      {spb.logisticsApproval.approved ? (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          Belum TTD
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                      Nama: {spb.logisticsApproval.officerName || 'Petugas Logistik'}
                    </div>
                    {spb.logisticsApproval.approved ? (
                      <div className="text-[10px] text-neutral-400 mt-1">
                        Disetujui tgl: {spb.logisticsApproval.approvalDate}
                      </div>
                    ) : (
                      <button
                        onClick={() => approveSPB(spb.id, 'logistik')}
                        disabled={!editMode}
                        className="mt-2 w-full py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors disabled:opacity-40"
                      >
                        Beri Persetujuan Logistik
                      </button>
                    )}
                  </div>

                  {/* Tanda Tangan 2: PJ Proyek */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        2. TTD PJ Proyek (Site Manager):
                      </span>
                      {spb.pjApproval.approved ? (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          Belum TTD
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                      Nama: {spb.pjApproval.officerName || 'Site Manager'}
                    </div>
                    {spb.pjApproval.approved ? (
                      <div className="text-[10px] text-neutral-400 mt-1">
                        Disetujui tgl: {spb.pjApproval.approvalDate}
                      </div>
                    ) : (
                      <button
                        onClick={() => approveSPB(spb.id, 'pj')}
                        disabled={!editMode}
                        className="mt-2 w-full py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors disabled:opacity-40"
                      >
                        Beri Persetujuan PJ Proyek
                      </button>
                    )}
                  </div>

                  {/* Lampiran Foto & Actions */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border border-neutral-200 dark:border-neutral-700/60 flex flex-col justify-between">
                    <div>
                      <div className="font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                        Lampiran Foto Fisik:
                      </div>
                      <div className="flex items-center gap-2">
                        {spb.spbPhotoUrl ? (
                          <button
                            onClick={() => setPhotoViewer({ isOpen: true, title: `Foto Fisik ${spb.spbNumber}`, url: spb.spbPhotoUrl })}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-neutral-800 dark:text-neutral-200 rounded font-medium"
                          >
                            <Camera className="w-3.5 h-3.5 text-amber-500" />
                            <span>Foto SPB</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-neutral-400 italic">Foto SPB (-)</span>
                        )}

                        {spb.supplierInvoicePhotoUrl ? (
                          <button
                            onClick={() => setPhotoViewer({ isOpen: true, title: `Nota Supplier ${spb.spbNumber}`, url: spb.supplierInvoicePhotoUrl })}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-neutral-800 dark:text-neutral-200 rounded font-medium"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Nota Supplier</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-neutral-400 italic">Nota Supplier (-)</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-neutral-200 dark:border-neutral-700">
                      <button
                        onClick={() => setPrintVoucherSpb(spb)}
                        className="flex items-center gap-1 text-[11px] text-neutral-700 dark:text-neutral-300 hover:text-amber-500 font-medium"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Voucher SPB</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(spb)}
                          disabled={!editMode}
                          className="p-1 text-neutral-400 hover:text-amber-500 disabled:opacity-30"
                          title="Edit SPB"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus pengajuan ${spb.spbNumber}?`)) {
                              deleteSPB(spb.id);
                            }
                          }}
                          disabled={!editMode}
                          className="p-1 text-neutral-400 hover:text-red-500 disabled:opacity-30"
                          title="Hapus SPB"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-neutral-500 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
            <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="font-medium text-neutral-700 dark:text-neutral-300">Belum ada pengajuan SPB yang cocok.</p>
          </div>
        )}
      </div>

      {/* Form Modal: Tambah / Edit SPB */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {editingSpb ? `Edit SPB (${editingSpb.spbNumber})` : 'Buat Surat Pengajuan Bahan / Alat (SPB)'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tanggal Pengajuan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.submissionDate}
                    onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Status Barang
                  </label>
                  <select
                    value={formData.itemStatus}
                    onChange={(e) => setFormData({ ...formData, itemStatus: e.target.value as SPBItemStatus })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Belum Dipesan">Belum Dipesan</option>
                    <option value="Dipesan">Dipesan ke Supplier</option>
                    <option value="Sudah Datang Sebagian">Sudah Datang Sebagian</option>
                    <option value="Sudah Datang Lengkap">Sudah Datang Lengkap</option>
                  </select>
                </div>
              </div>

              {/* Items List (Multi-item) */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 bg-neutral-50 dark:bg-neutral-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    Daftar Alat / Bahan yang Diajukan
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Baris
                  </button>
                </div>

                {formData.items.map((item, index) => (
                  <div key={item.id} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-neutral-400">Item #{index + 1}</span>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-neutral-400 hover:text-red-500 text-xs"
                        >
                          Hapus Baris
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          required
                          placeholder="Nama Bahan/Alat (contoh: Semen PCC, Besi D16, Pompa Air)"
                          value={item.itemName}
                          onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                          className="w-full p-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          step="any"
                          required
                          placeholder="Volume"
                          value={item.volume}
                          onChange={(e) => handleItemChange(index, 'volume', parseFloat(e.target.value) || 0)}
                          className="w-full p-1.5 font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Satuan (Zak, Batang, Ls)"
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          className="w-full p-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <input
                          type="number"
                          required
                          placeholder="Estimasi Harga Satuan (Rp)"
                          value={item.estimatedPrice}
                          onChange={(e) => handleItemChange(index, 'estimatedPrice', parseFloat(e.target.value) || 0)}
                          className="w-full p-1.5 font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Keterangan peruntukan (Untuk apa di lapangan)"
                          value={item.purpose}
                          onChange={(e) => handleItemChange(index, 'purpose', e.target.value)}
                          className="w-full p-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pembayaran Info */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as SPBPaymentMethod })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Cash">Cash (Tunai)</option>
                    <option value="Tempo">Tempo (Termin)</option>
                    <option value="Reimburse Logistik">Reimburse Logistik (Ditalangi dulu)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Status Pembayaran
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as SPBPaymentStatus })}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Belum Dibayar">Belum Dibayar Pusat</option>
                    <option value="Sudah Dibayar">Sudah Dibayar Pusat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Jatuh Tempo (Jika Tempo)
                  </label>
                  <input
                    type="date"
                    disabled={formData.paymentMethod !== 'Tempo'}
                    value={formData.tempoDueDate}
                    onChange={(e) => setFormData({ ...formData, tempoDueDate: e.target.value })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Photo Attachments Inputs */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 bg-neutral-50 dark:bg-neutral-800/40 space-y-3">
                <span className="font-bold text-neutral-800 dark:text-neutral-200 block">
                  Lampiran Foto Fisik SPB & Nota Supplier
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      URL Foto Fisik SPB (Bertanda Tangan):
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formData.spbPhotoUrl}
                        onChange={(e) => setFormData({ ...formData, spbPhotoUrl: e.target.value })}
                        className="w-full p-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleSimulatePhotoUpload('spb')}
                        className="px-2 py-1 text-[11px] bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-neutral-800 dark:text-neutral-200 rounded whitespace-nowrap"
                        title="Simulasi unggah foto dari kamera / galeri"
                      >
                        Sampel
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      URL Foto Nota / Kwitansi Supplier:
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formData.supplierInvoicePhotoUrl}
                        onChange={(e) => setFormData({ ...formData, supplierInvoicePhotoUrl: e.target.value })}
                        className="w-full p-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleSimulatePhotoUpload('invoice')}
                        className="px-2 py-1 text-[11px] bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-neutral-800 dark:text-neutral-200 rounded whitespace-nowrap"
                        title="Simulasi unggah nota"
                      >
                        Sampel
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Catatan Tambahan
                </label>
                <textarea
                  rows={2}
                  placeholder="No rekening supplier, jatuh tempo, pengiriman, dsb..."
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
                  {editingSpb ? 'Simpan Perubahan' : 'Terbitkan SPB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voucher SPB Print View Modal */}
      {printVoucherSpb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-neutral-900 rounded-xl shadow-2xl max-w-2xl w-full p-8 border border-neutral-300 flex flex-col max-h-[90vh] overflow-y-auto print-card">
            <div className="flex justify-between items-start border-b-2 border-neutral-900 pb-4">
              <div>
                <div className="text-xl font-black tracking-tight">CIVIL TRACK - KONTRAKTOR SIPIL</div>
                <div className="text-xs text-neutral-600 uppercase font-semibold mt-0.5">
                  SURAT PERINTAH BAYAR / PENGAJUAN BAHAN & ALAT (SPB)
                </div>
                <div className="text-xs text-neutral-600 mt-1">
                  Proyek: <strong>{activeProject.name}</strong> ({activeProject.code})
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono">{printVoucherSpb.spbNumber}</div>
                <div className="text-xs text-neutral-600">Tanggal: {printVoucherSpb.submissionDate}</div>
                <div className="text-xs text-neutral-600">Metode: {printVoucherSpb.paymentMethod}</div>
              </div>
            </div>

            <div className="my-6">
              <table className="w-full text-left text-xs border border-neutral-400 border-collapse">
                <thead>
                  <tr className="bg-neutral-100 border-b border-neutral-400">
                    <th className="p-2 border-r border-neutral-400">No</th>
                    <th className="p-2 border-r border-neutral-400">Nama Bahan / Alat</th>
                    <th className="p-2 border-r border-neutral-400">Volume</th>
                    <th className="p-2 border-r border-neutral-400 text-right">Harga Satuan</th>
                    <th className="p-2 border-r border-neutral-400 text-right">Total Perkiraan</th>
                    <th className="p-2">Peruntukan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-300">
                  {printVoucherSpb.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border-r border-neutral-300 font-mono">{idx + 1}</td>
                      <td className="p-2 border-r border-neutral-300 font-semibold">{item.itemName}</td>
                      <td className="p-2 border-r border-neutral-300 font-mono">{item.volume} {item.unit}</td>
                      <td className="p-2 border-r border-neutral-300 text-right font-mono">{formatRupiah(item.estimatedPrice)}</td>
                      <td className="p-2 border-r border-neutral-300 text-right font-mono font-bold">
                        {formatRupiah(item.totalPrice || item.volume * item.estimatedPrice)}
                      </td>
                      <td className="p-2 text-[11px] text-neutral-600">{item.purpose}</td>
                    </tr>
                  ))}
                  <tr className="bg-neutral-50 font-bold border-t-2 border-neutral-400">
                    <td colSpan={4} className="p-2 text-right border-r border-neutral-400">
                      TOTAL PENGAJUAN:
                    </td>
                    <td className="p-2 text-right font-mono text-sm border-r border-neutral-400">
                      {formatRupiah(printVoucherSpb.totalAmount)}
                    </td>
                    <td className="p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-xs text-neutral-600 mb-6 bg-neutral-50 p-3 rounded border border-neutral-200">
              <strong>Catatan:</strong> {printVoucherSpb.notes || 'Permohonan pembayaran diajukan ke Bagian Keuangan Kantor Pusat.'}
            </div>

            {/* 2 Signatures Block */}
            <div className="grid grid-cols-2 gap-8 text-center text-xs mt-auto pt-6 border-t border-neutral-300">
              <div>
                <div className="font-semibold text-neutral-700">Diajukan Oleh (Logistik Proyek):</div>
                <div className="h-20 flex items-center justify-center font-cursive text-neutral-400">
                  {printVoucherSpb.logisticsApproval.approved ? (
                    <div className="text-emerald-700 font-bold border-2 border-dashed border-emerald-600 p-2 rounded rotate-[-4deg]">
                      VERIFIED & APPROVED<br/>
                      <span className="text-[10px] font-mono">{printVoucherSpb.logisticsApproval.approvalDate}</span>
                    </div>
                  ) : (
                    '(Belum Ditandatangani)'
                  )}
                </div>
                <div className="font-bold border-t border-neutral-400 pt-1">
                  {printVoucherSpb.logisticsApproval.officerName || 'Deni Kurniawan'}
                </div>
                <div className="text-[10px] text-neutral-500">Petugas Logistik Lapangan</div>
              </div>

              <div>
                <div className="font-semibold text-neutral-700">Disetujui Oleh (PJ Proyek):</div>
                <div className="h-20 flex items-center justify-center font-cursive text-neutral-400">
                  {printVoucherSpb.pjApproval.approved ? (
                    <div className="text-blue-700 font-bold border-2 border-dashed border-blue-600 p-2 rounded rotate-[4deg]">
                      SETUJU DIBAYARKAN<br/>
                      <span className="text-[10px] font-mono">{printVoucherSpb.pjApproval.approvalDate}</span>
                    </div>
                  ) : (
                    '(Belum Ditandatangani)'
                  )}
                </div>
                <div className="font-bold border-t border-neutral-400 pt-1">
                  {printVoucherSpb.pjApproval.officerName || 'Ir. Agus Susanto, S.T.'}
                </div>
                <div className="text-[10px] text-neutral-500">Site Manager / Project Manager</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-neutral-200 no-print">
              <button
                onClick={() => setPrintVoucherSpb(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-lg"
              >
                <Printer className="w-4 h-4" />
                Cetak Dokumen
              </button>
            </div>
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
