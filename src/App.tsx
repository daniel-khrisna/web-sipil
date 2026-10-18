import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, TabKey } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardTab } from './components/tabs/DashboardTab';
import { PekerjaanTab } from './components/tabs/PekerjaanTab';
import { SdmTab } from './components/tabs/SdmTab';
import { AbsensiTab } from './components/tabs/AbsensiTab';
import { SpbTab } from './components/tabs/SpbTab';
import { KasKecilTab } from './components/tabs/KasKecilTab';
import { StokBahanTab } from './components/tabs/StokBahanTab';
import { StokAlatTab } from './components/tabs/StokAlatTab';
import { RoleManagementTab } from './components/tabs/RoleManagementTab';
import { NewProjectModal } from './components/common/NewProjectModal';
import { Lock, AlertCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { editMode, activeProject } = useApp();

  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab onNavigateTab={(tab) => setActiveTab(tab)} />;
      case 'pekerjaan':
        return <PekerjaanTab />;
      case 'sdm':
        return <SdmTab />;
      case 'absensi':
        return <AbsensiTab />;
      case 'spb':
        return <SpbTab />;
      case 'kaskecil':
        return <KasKecilTab />;
      case 'stokbahan':
        return <StokBahanTab />;
      case 'stokalat':
        return <StokAlatTab />;
      case 'roles':
        return <RoleManagementTab />;
      default:
        return <DashboardTab onNavigateTab={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <Header
          onToggleSidebar={() => {
            if (window.innerWidth >= 1024) {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            } else {
              setIsMobileSidebarOpen(!isMobileSidebarOpen);
            }
          }}
          onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
        />

        {/* Safe Read-Only Mode Banner if editMode is OFF */}
        {!editMode && (
          <div className="no-print bg-neutral-800 text-neutral-200 px-4 py-2 text-xs flex items-center justify-between border-b border-neutral-700">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                <strong>Mode View Saja:</strong> Data tidak dapat ditambah atau diubah. Aktifkan toggle <strong>&quot;Ubah Data&quot;</strong> di pojok kanan atas jika ingin melakukan perubahan.
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 hidden sm:inline">Proteksi Data Aktif</span>
          </div>
        )}

        {/* Tab Viewport */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
