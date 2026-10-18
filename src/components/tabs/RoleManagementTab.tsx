import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  User, 
  Lock, 
  Edit3, 
  Plus, 
  Trash2, 
  Check, 
  Building2, 
  AlertCircle,
  RotateCcw,
  Sparkles,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, UserAccount } from '../../types';

export const RoleManagementTab: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    users, 
    addUser, 
    updateUserRole, 
    deleteUser, 
    projects, 
    activeProject, 
    editMode, 
    setEditMode,
    resetDemoData 
  } = useApp();

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [newUserAssignedProject, setNewUserAssignedProject] = useState(projects[0]?.id || '');

  const isSuperadmin = currentUser.role === 'superadmin';

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      assignedProjectId: newUserRole === 'user' ? newUserAssignedProject : undefined
    });

    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Manajemen Hak Akses & Keamanan Sistem
          </div>
          <h2 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Tingkatan Login & Kontrol Akses Proyek
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Anda saat ini login sebagai: <strong className="text-neutral-800 dark:text-neutral-200">{currentUser.name}</strong> ({currentUser.role})
          </p>
        </div>

        {/* Global Edit Mode Toggle */}
        <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
          <div>
            <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              {editMode ? <Edit3 className="w-3.5 h-3.5 text-emerald-500" /> : <Lock className="w-3.5 h-3.5 text-neutral-400" />}
              <span>Toggle Mode Ubah Data</span>
            </div>
            <div className="text-[11px] text-neutral-500">
              {editMode ? 'Aktif (Data dapat diinput & diubah)' : 'Terkunci (Mode View Saja di semua tab)'}
            </div>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              editMode
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            {editMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Role Matrix Explanation Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Superadmin Card */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">1. Superadmin</h3>
          </div>
          <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 list-disc list-inside">
            <li>Dapat mengubah tingkatan login user di bawahnya.</li>
            <li>Dapat melihat semua data dari semua proyek.</li>
            <li>Dapat menginput dan mengubah semua data.</li>
            <li>Memiliki toggle &quot;Ubah Data&quot; di bagian setting/header.</li>
          </ul>
        </div>

        {/* Admin Card */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">2. Admin</h3>
          </div>
          <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 list-disc list-inside">
            <li>Dapat melihat semua data dari semua proyek.</li>
            <li>Dapat menginput & mengubah data (jika toggle ON).</li>
            <li>Tidak dapat mengubah role akun user lain.</li>
            <li>Memiliki toggle &quot;Ubah Data&quot; di bagian setting/header.</li>
          </ul>
        </div>

        {/* User Card */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <User className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">3. User (Site Level)</h3>
          </div>
          <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 list-disc list-inside">
            <li>Hanya dapat mengakses 1 proyek yang ditugaskan.</li>
            <li>Tidak dapat melihat data dari proyek lain.</li>
            <li>Dapat menginput & mengubah data proyeknya (jika toggle ON).</li>
            <li>Memiliki toggle &quot;Ubah Data&quot; untuk mode view saja.</li>
          </ul>
        </div>
      </div>

      {/* User Accounts Management Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Daftar Pengguna Sistem & Hak Akses
            </h3>
            <p className="text-[11px] text-neutral-500">
              {isSuperadmin 
                ? 'Sebagai Superadmin, Anda dapat mengubah role pengguna di bawah ini.' 
                : 'Hanya Superadmin yang berhak merubah role user lain.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isSuperadmin && (
              <button
                onClick={() => setIsAddUserOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pengguna</span>
              </button>
            )}

            <button
              onClick={() => {
                if (window.confirm('Reset data demo ke pengaturan awal proyek?')) {
                  resetDemoData();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
              title="Reset data demo ke kondisi default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Demo</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/70 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                <th className="py-3 px-3.5 font-semibold">Pengguna</th>
                <th className="py-3 px-3.5 font-semibold">Email</th>
                <th className="py-3 px-3.5 font-semibold">Tingkatan Login (Role)</th>
                <th className="py-3 px-3.5 font-semibold">Hak Akses Proyek</th>
                <th className="py-3 px-3.5 font-semibold text-center">Beralih Akun (Simulasi)</th>
                {isSuperadmin && <th className="py-3 px-3.5 font-semibold text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {users.map((u) => {
                const assignedProj = projects.find(p => p.id === u.assignedProjectId);

                return (
                  <tr key={u.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 px-3.5 font-semibold text-neutral-900 dark:text-neutral-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold">
                          {u.name.charAt(0)}
                        </div>
                        <span>{u.name}</span>
                        {u.id === currentUser.id && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                            Aktif Sekarang
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-neutral-500">{u.email}</td>
                    <td className="py-3 px-3.5">
                      {isSuperadmin && u.id !== currentUser.id ? (
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value as UserRole, u.assignedProjectId)}
                          className="p-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs font-semibold"
                        >
                          <option value="superadmin">Superadmin</option>
                          <option value="admin">Admin</option>
                          <option value="user">User</option>
                        </select>
                      ) : (
                        <span className="font-semibold capitalize text-neutral-800 dark:text-neutral-200">
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-neutral-600 dark:text-neutral-400">
                      {u.role === 'user' ? (
                        isSuperadmin ? (
                          <select
                            value={u.assignedProjectId || ''}
                            onChange={(e) => updateUserRole(u.id, u.role, e.target.value)}
                            className="p-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-[11px]"
                          >
                            {projects.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span>Proyek: {assignedProj ? assignedProj.name : 'Belum ditentukan'}</span>
                        )
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Semua Proyek (Global)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <button
                        onClick={() => setCurrentUser(u)}
                        disabled={u.id === currentUser.id}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
                      >
                        {u.id === currentUser.id ? 'Sedang Dipakai' : 'Login Sebagai User Ini'}
                      </button>
                    </td>
                    {isSuperadmin && (
                      <td className="py-3 px-3.5 text-center">
                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus pengguna ${u.name}?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Pengguna */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Tambah Akun Pengguna Baru
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Fajar Kurniawan, S.T."
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Email Akun <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="fajar@civiltrack.id"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full p-2 font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tingkatan Login (Role) <span className="text-red-500">*</span>
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 font-semibold"
                >
                  <option value="user">User (Hanya Proyek Tertentu)</option>
                  <option value="admin">Admin (Semua Proyek)</option>
                  <option value="superadmin">Superadmin (Akses Penuh & Kelola User)</option>
                </select>
              </div>

              {newUserRole === 'user' && (
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tugaskan ke Proyek:
                  </label>
                  <select
                    value={newUserAssignedProject}
                    onChange={(e) => setNewUserAssignedProject(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-lg shadow-xs"
                >
                  Buat Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
