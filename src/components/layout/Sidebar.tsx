import React from 'react';
import { 
  LayoutDashboard, 
  ListChecks, 
  Users, 
  CalendarCheck2, 
  FileCheck, 
  Wallet, 
  Package, 
  Truck, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  HardHat,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type TabKey = 
  | 'dashboard'
  | 'pekerjaan'
  | 'sdm'
  | 'absensi'
  | 'spb'
  | 'kaskecil'
  | 'stokbahan'
  | 'stokalat'
  | 'roles';

interface SidebarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { spbList, materialStocks, equipmentList, activeProject } = useApp();

  // Pending SPBs for badge
  const pendingSpbCount = spbList.filter(
    s => s.projectId === activeProject.id && (!s.logisticsApproval.approved || !s.pjApproval.approved)
  ).length;

  // Low stock materials
  const lowStockCount = materialStocks.filter(
    m => {
      if (m.projectId !== activeProject.id) return false;
      const inQty = m.movements.filter(mv => mv.type === 'Masuk').reduce((acc, c) => acc + c.quantity, 0);
      const outQty = m.movements.filter(mv => mv.type === 'Keluar').reduce((acc, c) => acc + c.quantity, 0);
      const current = m.initialStock + inQty - outQty;
      return current <= m.minimumStock;
    }
  ).length;

  // Equipment under repair
  const repairToolCount = equipmentList.filter(
    e => e.projectId === activeProject.id && (e.status === 'Rusak / Butuh Servis' || e.status === 'Sedang Diservis')
  ).length;

  const menuItems = [
    {
      key: 'dashboard' as TabKey,
      label: '1. Dashboard Proyek',
      shortLabel: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Rangkuman & Cetak Laporan'
    },
    {
      key: 'pekerjaan' as TabKey,
      label: '2. List Pekerjaan',
      shortLabel: 'Pekerjaan',
      icon: ListChecks,
      desc: 'Divisi, Bobot, Nilai & Progres'
    },
    {
      key: 'sdm' as TabKey,
      label: '3. SDM / Tenaga Kerja',
      shortLabel: 'Tenaga Kerja',
      icon: Users,
      desc: 'Ahli, Teknis, Harian, Borongan'
    },
    {
      key: 'absensi' as TabKey,
      label: '4. Absensi & Supervisi',
      shortLabel: 'Absensi',
      icon: CalendarCheck2,
      desc: 'Presensi Lapangan & Staf Teknis'
    },
    {
      key: 'spb' as TabKey,
      label: '5a. Pengajuan Alat & Bahan',
      shortLabel: 'Pengajuan SPB',
      icon: FileCheck,
      desc: 'Permintaan Bayar, TTD & Nota',
      badge: pendingSpbCount > 0 ? `${pendingSpbCount} Pending` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
    },
    {
      key: 'kaskecil' as TabKey,
      label: '5b. Kas Kecil Proyek',
      shortLabel: 'Kas Kecil',
      icon: Wallet,
      desc: 'Rekening Koran Kas Lapangan'
    },
    {
      key: 'stokbahan' as TabKey,
      label: '6. Stok Bahan (Gudang)',
      shortLabel: 'Stok Bahan',
      icon: Package,
      desc: 'Besi, Semen, Pasir, BBM, Listrik',
      badge: lowStockCount > 0 ? `${lowStockCount} Kritis` : undefined,
      badgeColor: 'bg-red-500/20 text-red-600 dark:text-red-400'
    },
    {
      key: 'stokalat' as TabKey,
      label: '7. Stok Alat & Mesin',
      shortLabel: 'Stok Alat',
      icon: Truck,
      desc: 'Excavator, Crane, Stamper, Genset',
      badge: repairToolCount > 0 ? `${repairToolCount} Servis` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
    },
    {
      key: 'roles' as TabKey,
      label: 'Pengaturan & Akses User',
      shortLabel: 'Akses & Role',
      icon: ShieldCheck,
      desc: 'Superadmin, Admin, User & Mode'
    }
  ];

  const handleSelectTab = (key: TabKey) => {
    setActiveTab(key);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand / Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-neutral-950 font-black shadow-md shrink-0">
              <HardHat className="w-5 h-5 text-neutral-950" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  Civil Track
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold">PRO</span>
                </div>
                <div className="text-[11px] text-neutral-500 truncate">
                  Sistem Monitoring Sipil
                </div>
              </div>
            )}
          </div>

          {/* Toggle sidebar button (desktop) / close button (mobile) */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 lg:hidden rounded-lg"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={isCollapsed ? 'Tampilkan teks menu' : 'Sembunyikan teks menu'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => handleSelectTab(item.key)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 font-medium'
                }`}
              >
                <div className="shrink-0 flex items-center justify-center">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-neutral-950' : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 truncate">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ml-1 ${
                            isActive
                              ? 'bg-neutral-950/20 text-neutral-950'
                              : item.badgeColor
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive
                          ? 'text-neutral-950/80 font-normal'
                          : 'text-neutral-400 dark:text-neutral-500'
                      }`}
                    >
                      {item.desc}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 shrink-0 text-xs">
          {!isCollapsed ? (
            <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 text-[11px]">
              <div className="font-semibold text-neutral-900 dark:text-neutral-100 mb-0.5">
                Mode Tampilan Fleksibel
              </div>
              <div className="text-[10px] text-neutral-500 leading-snug">
                Klik tombol panah di atas untuk menyembunyikan/menampilkan kolom tab.
              </div>
            </div>
          ) : (
            <div className="flex justify-center text-neutral-400 py-1" title="Civil Track v2.0">
              <HardHat className="w-4 h-4 opacity-40" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
