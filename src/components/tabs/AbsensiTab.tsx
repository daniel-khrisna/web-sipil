import React, { useState, useMemo } from 'react';
import { 
  CalendarCheck2, 
  Clock, 
  CheckCircle2, 
  Camera, 
  FileText, 
  Plus, 
  Trash2, 
  Calendar, 
  Users, 
  Lock, 
  CheckCheck,
  AlertTriangle,
  MapPin,
  X,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus, StaffVisitLog } from '../../types';
import { PhotoViewerModal } from '../common/PhotoViewerModal';

export const AbsensiTab: React.FC = () => {
  const { 
    activeProject, 
    workers, 
    attendanceRecords, 
    addAttendanceRecord, 
    updateAttendanceRecord, 
    batchMarkAttendance, 
    staffVisits, 
    addStaffVisit, 
    deleteStaffVisit,
    editMode 
  } = useApp();

  // Active view: 'field_attendance' (Tenaga Kerja Lapangan) vs 'staff_visits' (Log Kunjungan Staf Teknis)
  const [activeSubTab, setActiveSubTab] = useState<'field_attendance' | 'staff_visits'>('field_attendance');

  // Date for Field Attendance
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Modal for adding Staff Visit
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [visitFormData, setVisitFormData] = useState({
    staffName: '',
    role: 'Pelaksana Lapangan / Site Engineer',
    checkInTime: '08:30',
    checkOutTime: '16:00',
    purpose: '',
    findings: '',
    signatureOrNotes: 'Telah diperiksa & disetujui.'
  });

  // Photo viewer modal
  const [viewerPhoto, setViewerPhoto] = useState<{ isOpen: boolean; title: string; url?: string }>({
    isOpen: false,
    title: ''
  });

  // Filter workers who belong to field work (Tenaga Harian, Borongan, Teknis)
  const fieldWorkers = useMemo(() => {
    return workers.filter(w => 
      w.projectId === activeProject.id && 
      (w.category === 'Tenaga Harian' || w.category === 'Borongan' || w.category === 'Teknis' || w.category === 'Logistik') &&
      w.status === 'Aktif'
    );
  }, [workers, activeProject.id]);

  // Today's attendance map
  const dailyAttendanceMap = useMemo(() => {
    const map = new Map<string, typeof attendanceRecords[0]>();
    attendanceRecords
      .filter(r => r.projectId === activeProject.id && r.date === selectedDate)
      .forEach(r => {
        map.set(r.workerId, r);
      });
    return map;
  }, [attendanceRecords, activeProject.id, selectedDate]);

  // Project staff visits
  const projectVisits = useMemo(() => {
    return staffVisits.filter(v => v.projectId === activeProject.id);
  }, [staffVisits, activeProject.id]);

  // Quick batch mark all as Hadir
  const handleMarkAllPresent = () => {
    if (!editMode) return;
    const workerIds = fieldWorkers.map(w => w.id);
    batchMarkAttendance(selectedDate, 'Hadir', workerIds);
  };

  // Change individual status
  const handleStatusChange = (workerId: string, workerName: string, category: any, newStatus: AttendanceStatus) => {
    if (!editMode) return;
    const existing = dailyAttendanceMap.get(workerId);
    if (existing) {
      updateAttendanceRecord({
        ...existing,
        status: newStatus,
        overtimeHours: newStatus === 'Lembur' ? (existing.overtimeHours || 2) : 0
      });
    } else {
      addAttendanceRecord({
        projectId: activeProject.id,
        date: selectedDate,
        workerId,
        workerName,
        category,
        status: newStatus,
        overtimeHours: newStatus === 'Lembur' ? 2 : 0,
        notes: ''
      });
    }
  };

  // Change overtime hours
  const handleOvertimeChange = (workerId: string, hours: number) => {
    if (!editMode) return;
    const existing = dailyAttendanceMap.get(workerId);
    if (existing) {
      updateAttendanceRecord({
        ...existing,
        overtimeHours: hours
      });
    }
  };

  // Submit new staff visit
  const handleVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitFormData.staffName.trim() || !visitFormData.purpose.trim()) return;

    addStaffVisit({
      projectId: activeProject.id,
      date: selectedDate,
      staffName: visitFormData.staffName,
      role: visitFormData.role,
      checkInTime: visitFormData.checkInTime,
      checkOutTime: visitFormData.checkOutTime,
      purpose: visitFormData.purpose,
      findings: visitFormData.findings,
      signatureOrNotes: visitFormData.signatureOrNotes
    });

    setIsVisitModalOpen(false);
    setVisitFormData({
      staffName: '',
      role: 'Pelaksana Lapangan / Site Engineer',
      checkInTime: '08:30',
      checkOutTime: '16:00',
      purpose: '',
      findings: '',
      signatureOrNotes: 'Telah diperiksa & disetujui.'
    });
  };

  // Statistics for the selected date
  const totalField = fieldWorkers.length;
  const presentCount = Array.from(dailyAttendanceMap.values()).filter(r => r.status === 'Hadir' || r.status === 'Lembur').length;
  const overtimeCount = Array.from(dailyAttendanceMap.values()).filter(r => r.status === 'Lembur').length;
  const sickOrPermitCount = Array.from(dailyAttendanceMap.values()).filter(r => r.status === 'Sakit' || r.status === 'Izin').length;

  return (
    <div className="space-y-6">
      {/* Subtab Switcher & Explanation Box */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('field_attendance')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeSubTab === 'field_attendance'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              <CalendarCheck2 className="w-4 h-4 text-amber-500" />
              <span>Presensi Tenaga Kerja Lapangan</span>
            </button>
            <button
              onClick={() => setActiveSubTab('staff_visits')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeSubTab === 'staff_visits'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-500" />
              <span>Log Kunjungan Supervisi / Staf Teknis</span>
            </button>
          </div>

          <div className="text-[11px] text-neutral-500 max-w-md">
            💡 <strong className="text-neutral-700 dark:text-neutral-300">Solusi Civil Track:</strong> Tenaga lapangan diabsen harian per mandor, sedangkan manajer & pelaksana teknis mencatat log kunjungan/inspeksi berkala tanpa kewajiban absen mesin kaku.
          </div>
        </div>
      </div>

      {activeSubTab === 'field_attendance' ? (
        <>
          {/* Daily Strip & Batch Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="text-xs text-neutral-500 font-medium">Tanggal Presensi Lapangan</div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-mono font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="text-xs text-neutral-500 font-medium">Kehadiran Hari Terpilih</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {presentCount}
                </span>
                <span className="text-xs text-neutral-500 font-mono">/ {totalField} Tenaga</span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Tingkat Kehadiran: {totalField > 0 ? Math.round((presentCount / totalField) * 100) : 0}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="text-xs text-neutral-500 font-medium">Pekerja Lembur Cor / Malam</div>
              <div className="mt-1 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {overtimeCount} Orang
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Dicatat untuk klaim kas kecil / upah
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
              <div className="text-xs text-neutral-500 font-medium">Tindakan Cepat Batch</div>
              <button
                onClick={handleMarkAllPresent}
                disabled={!editMode || totalField === 0}
                className="mt-2 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs disabled:opacity-40"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Tandai Semua Hadir ({totalField})</span>
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Daftar Absensi Mandor & Tenaga Kerja Lapangan
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Tanggal: <span className="font-mono font-medium">{selectedDate}</span>
                </p>
              </div>
              {!editMode && (
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Mode View Saja (Kunci)</span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/70 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                    <th className="py-3 px-3.5 font-semibold">No</th>
                    <th className="py-3 px-3.5 font-semibold">Nama Tenaga Kerja</th>
                    <th className="py-3 px-3.5 font-semibold">Jabatan</th>
                    <th className="py-3 px-3.5 font-semibold">Kategori & Asal</th>
                    <th className="py-3 px-3.5 font-semibold text-center">Status Kehadiran</th>
                    <th className="py-3 px-3.5 font-semibold text-center">Jam Lembur</th>
                    <th className="py-3 px-3.5 font-semibold">Keterangan / Tugas Hari Ini</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {fieldWorkers.length > 0 ? (
                    fieldWorkers.map((w, idx) => {
                      const record = dailyAttendanceMap.get(w.id);
                      const currentStatus = record ? record.status : 'Hadir'; // default fallback
                      const overtimeHours = record ? record.overtimeHours : 0;

                      return (
                        <tr key={w.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-colors">
                          <td className="py-3 px-3.5 text-neutral-400 font-mono">{idx + 1}</td>
                          <td className="py-3 px-3.5 font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                            {w.name}
                          </td>
                          <td className="py-3 px-3.5 text-neutral-700 dark:text-neutral-300 font-medium">
                            {w.position}
                          </td>
                          <td className="py-3 px-3.5 text-[11px] text-neutral-500">
                            {w.category} {w.vendorName ? `· ${w.vendorName}` : '· Internal'}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-700 p-0.5 bg-neutral-100 dark:bg-neutral-800">
                              {(['Hadir', 'Lembur', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatus[]).map((st) => (
                                <button
                                  key={st}
                                  disabled={!editMode}
                                  onClick={() => handleStatusChange(w.id, w.name, w.category, st)}
                                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                                    currentStatus === st
                                      ? st === 'Hadir'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : st === 'Lembur'
                                        ? 'bg-amber-500 text-neutral-950 shadow-xs'
                                        : st === 'Sakit' || st === 'Izin'
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'bg-red-600 text-white shadow-xs'
                                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            {currentStatus === 'Lembur' ? (
                              <div className="inline-flex items-center gap-1">
                                <input
                                  type="number"
                                  min="1"
                                  max="12"
                                  disabled={!editMode}
                                  value={overtimeHours || 2}
                                  onChange={(e) => handleOvertimeChange(w.id, parseInt(e.target.value) || 0)}
                                  className="w-12 text-center p-1 rounded font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs"
                                />
                                <span className="text-[11px] text-neutral-500">Jam</span>
                              </div>
                            ) : (
                              <span className="text-neutral-400 font-mono">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-[11px] text-neutral-500">
                            {record?.notes || (currentStatus === 'Lembur' ? 'Lembur pekerjaan struktur' : 'Pekerjaan normal')}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-neutral-500">
                        Tidak ada tenaga kerja lapangan aktif di proyek ini. Tambahkan di tab SDM.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Staff Visit Log */
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Buku Log Kunjungan Supervisi & Manajemen Proyek
              </h3>
              <p className="text-xs text-neutral-500">
                Mencatat kehadiran fleksibel Project Manager, Konsultan MK, Ahli K3, dan Logistik
              </p>
            </div>
            <button
              onClick={() => setIsVisitModalOpen(true)}
              disabled={!editMode}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg shadow-xs transition-colors ${
                editMode
                  ? 'bg-amber-500 hover:bg-amber-600 text-neutral-950'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Catat Kunjungan Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectVisits.length > 0 ? (
              projectVisits.map((visit) => (
                <div key={visit.id} className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                          {visit.staffName}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                          {visit.role}
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-neutral-500 font-mono">
                        <div>{visit.date}</div>
                        <div className="text-neutral-700 dark:text-neutral-300 font-medium">
                          {visit.checkInTime} - {visit.checkOutTime || 'Selesai'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2 text-xs">
                      <div>
                        <span className="text-neutral-500 font-medium">Agenda / Tujuan:</span>
                        <p className="text-neutral-800 dark:text-neutral-200 mt-0.5 font-medium">
                          {visit.purpose}
                        </p>
                      </div>

                      <div>
                        <span className="text-neutral-500 font-medium">Temuan & Instruksi Kerja:</span>
                        <p className="text-neutral-600 dark:text-neutral-400 mt-0.5 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700/60 text-[11px]">
                          {visit.findings}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {visit.signatureOrNotes || 'Terverifikasi'}
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm('Hapus log kunjungan ini?')) {
                          deleteStaffVisit(visit.id);
                        }
                      }}
                      disabled={!editMode}
                      className="text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-12 text-center text-neutral-500 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-medium text-neutral-700 dark:text-neutral-300">Belum ada catatan kunjungan staf.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Catat Kunjungan Staf */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Catat Log Kunjungan / Supervisi Lapangan
              </h3>
              <button
                onClick={() => setIsVisitModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVisitSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Nama Staf / Pejabat yang Hadir <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ir. Hendra Wijaya / Deni Kurniawan"
                  value={visitFormData.staffName}
                  onChange={(e) => setVisitFormData({ ...visitFormData, staffName: e.target.value })}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Jabatan / Peran
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Direktur Operasional / Logistik Pusat / Site Manager"
                  value={visitFormData.role}
                  onChange={(e) => setVisitFormData({ ...visitFormData, role: e.target.value })}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Jam Tiba (Check-in)
                  </label>
                  <input
                    type="time"
                    value={visitFormData.checkInTime}
                    onChange={(e) => setVisitFormData({ ...visitFormData, checkInTime: e.target.value })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Jam Selesai (Check-out)
                  </label>
                  <input
                    type="time"
                    value={visitFormData.checkOutTime}
                    onChange={(e) => setVisitFormData({ ...visitFormData, checkOutTime: e.target.value })}
                    className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tujuan Kunjungan / Agenda <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Inspeksi pembesian lantai 3 & rapat mingguan konsultan"
                  value={visitFormData.purpose}
                  onChange={(e) => setVisitFormData({ ...visitFormData, purpose: e.target.value })}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Temuan Lapangan, Instruksi atau Catatan Khusus
                </label>
                <textarea
                  rows={3}
                  placeholder="Catatan mutu, keselamatan K3, arahan percepatan, dsb..."
                  value={visitFormData.findings}
                  onChange={(e) => setVisitFormData({ ...visitFormData, findings: e.target.value })}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsVisitModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-lg shadow-xs"
                >
                  Simpan Catatan Kunjungan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      <PhotoViewerModal
        isOpen={viewerPhoto.isOpen}
        onClose={() => setViewerPhoto({ isOpen: false, title: '' })}
        title={viewerPhoto.title}
        photoUrl={viewerPhoto.url}
      />
    </div>
  );
};
