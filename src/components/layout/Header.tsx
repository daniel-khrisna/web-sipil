import React, { useState } from 'react';
import { 
  Building2, 
  ChevronDown, 
  Sun, 
  Moon, 
  Lock, 
  Edit3, 
  ShieldCheck, 
  ShieldAlert, 
  User, 
  Plus, 
  Menu,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenNewProjectModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenNewProjectModal
}) => {
  const {
    theme,
    toggleTheme,
    editMode,
    setEditMode,
    currentUser,
    setCurrentUser,
    users,
    projects,
    activeProject,
    setActiveProject
  } = useApp();

  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Filter allowed projects based on role
  const isSuperadminOrAdmin = currentUser.role === 'superadmin' || currentUser.role === 'admin';
  const visibleProjects = isSuperadminOrAdmin
    ? projects
    : projects.filter(p => !currentUser.assignedProjectId || p.id === currentUser.assignedProjectId);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return { label: 'Superadmin', bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' };
      case 'admin':
        return { label: 'Admin', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 'user':
        return { label: 'User Proyek', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <header className="h-16 px-4 md:px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors">
      {/* Zone 1 (Left): Hamburger toggle & Active Project Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Toggle Sidebar Menu"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Project Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left max-w-[220px] sm:max-w-xs md:max-w-md"
          >
            <div className="w-8 h-8 rounded-md bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
                <span>{activeProject.code}</span>
                <span>·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium">{activeProject.status}</span>
              </div>
              <div className="text-xs md:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {activeProject.name}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 ml-1" />
          </button>

          {projectDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProjectDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-1.5 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 p-1.5 overflow-hidden">
                <div className="px-3 py-2 text-[11px] font-semibold text-neutral-400 border-b border-neutral-100 dark:border-neutral-800/80 uppercase tracking-wider">
                  Daftar Proyek Aktif
                </div>
                <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
                  {visibleProjects.map(proj => (
                    <button
                      key={proj.id}
                      onClick={() => {
                        setActiveProject(proj);
                        setProjectDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors ${
                        proj.id === activeProject.id
                          ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 font-medium'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-semibold truncate">{proj.name}</div>
                        <div className="text-[11px] text-neutral-500 truncate">
                          {proj.location} · {proj.code}
                        </div>
                      </div>
                      {proj.id === activeProject.id && (
                        <Check className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {isSuperadminOrAdmin && (
                  <div className="pt-1 mt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      onClick={() => {
                        setProjectDropdownOpen(false);
                        onOpenNewProjectModal();
                      }}
                      className="w-full flex items-center gap-2 p-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Proyek Baru
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Zone 2 (Right): Edit Mode Toggle, Theme Toggle, User Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Toggle Mode Ubah Data */}
        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800/80 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md transition-all ${
              editMode
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
            }`}
            title={editMode ? 'Mode Ubah Data Aktif (Input/Edit diizinkan)' : 'Mode View Saja (Semua data terkunci)'}
          >
            {editMode ? (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ubah Data ON</span>
                <span className="sm:hidden">Edit ON</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Saja (Kunci)</span>
                <span className="sm:hidden">Kunci</span>
              </>
            )}
          </button>
        </div>

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700/60 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-xs font-semibold text-neutral-800 dark:text-neutral-200 shadow-xs cursor-pointer"
          title={`Klik untuk ubah ke ${theme === 'dark' ? 'Mode Terang (Light)' : 'Mode Gelap (Dark)'}`}
          aria-label="Toggle tema gelap dan terang"
        >
          {theme === 'dark' ? (
            <>
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Light</span>
            </>
          )}
        </button>

        {/* User Account / Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 text-xs font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 max-w-[120px] truncate">
                {currentUser.name}
              </div>
              <div className={`text-[10px] font-medium px-1 rounded inline-block border ${badge.bg}`}>
                {badge.label}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {userDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 p-2 overflow-hidden">
                <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{currentUser.name}</div>
                  <div className="text-[11px] text-neutral-500 truncate">{currentUser.email}</div>
                  <div className="mt-1 text-[11px] text-neutral-600 dark:text-neutral-400">
                    Tingkat Akses: <span className="font-semibold capitalize">{currentUser.role}</span>
                  </div>
                </div>

                <div className="p-1">
                  <div className="px-2 py-1.5 text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                    Ganti Profil Simulasi Login:
                  </div>
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        u.id === currentUser.id
                          ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 font-medium'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-[10px] text-neutral-500 capitalize">{u.role}</div>
                      </div>
                      {u.id === currentUser.id && (
                        <Check className="w-4 h-4 text-amber-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
