import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Project, 
  WorkItem, 
  Worker, 
  AttendanceRecord, 
  StaffVisitLog, 
  SPBSubmission, 
  PettyCashTransaction, 
  MaterialStock, 
  MaterialStockMovement,
  EquipmentItem, 
  UserAccount, 
  UserRole 
} from '../types';
import { 
  INITIAL_PROJECTS, 
  INITIAL_USERS, 
  INITIAL_WORK_ITEMS, 
  INITIAL_WORKERS, 
  INITIAL_ATTENDANCE, 
  INITIAL_STAFF_VISITS, 
  INITIAL_SPB, 
  INITIAL_PETTY_CASH, 
  INITIAL_MATERIAL_STOCKS, 
  INITIAL_EQUIPMENT_ITEMS 
} from '../utils/initialData';

interface AppContextType {
  // Theme & Edit Mode
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  editMode: boolean; // Toggle "Ubah Data"
  setEditMode: (val: boolean) => void;

  // Active User & Permissions
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  users: UserAccount[];
  addUser: (user: Omit<UserAccount, 'id'>) => void;
  updateUserRole: (userId: string, newRole: UserRole, assignedProjectId?: string) => void;
  deleteUser: (userId: string) => void;

  // Projects
  projects: Project[];
  activeProject: Project;
  setActiveProject: (project: Project) => void;
  addProject: (proj: Omit<Project, 'id'>) => void;
  updateProject: (proj: Project) => void;
  deleteProject: (id: string) => void;

  // Tab 2: List Pekerjaan
  workItems: WorkItem[];
  addWorkItem: (item: Omit<WorkItem, 'id' | 'estimatedPrice' | 'realizedValue'>) => void;
  updateWorkItem: (item: WorkItem) => void;
  deleteWorkItem: (id: string) => void;
  importWorkItems: (items: any[]) => void;

  // Tab 3: SDM / Tenaga Kerja
  workers: Worker[];
  addWorker: (worker: Omit<Worker, 'id'>) => void;
  updateWorker: (worker: Worker) => void;
  deleteWorker: (id: string) => void;
  importWorkers: (workers: any[]) => void;

  // Tab 4: Absensi
  attendanceRecords: AttendanceRecord[];
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  updateAttendanceRecord: (record: AttendanceRecord) => void;
  batchMarkAttendance: (date: string, status: AttendanceRecord['status'], workerIds: string[]) => void;
  staffVisits: StaffVisitLog[];
  addStaffVisit: (visit: Omit<StaffVisitLog, 'id'>) => void;
  deleteStaffVisit: (id: string) => void;

  // Tab 5a: SPB (Pengajuan Alat dan Bahan)
  spbList: SPBSubmission[];
  addSPB: (spb: Omit<SPBSubmission, 'id' | 'spbNumber' | 'totalAmount'>) => void;
  updateSPB: (spb: SPBSubmission) => void;
  deleteSPB: (id: string) => void;
  approveSPB: (spbId: string, role: 'logistik' | 'pj', notes?: string) => void;

  // Tab 5b: Kas Kecil
  pettyCashList: PettyCashTransaction[];
  addPettyCashTransaction: (tx: Omit<PettyCashTransaction, 'id'>) => void;
  deletePettyCashTransaction: (id: string) => void;

  // Tab 6: Stok Bahan
  materialStocks: MaterialStock[];
  addMaterial: (mat: Omit<MaterialStock, 'id' | 'movements'>) => void;
  updateMaterial: (mat: MaterialStock) => void;
  deleteMaterial: (id: string) => void;
  addStockMovement: (materialId: string, movement: Omit<MaterialStockMovement, 'id'>) => void;
  deleteStockMovement: (materialId: string, movementId: string) => void;
  importMaterials: (items: any[]) => void;

  // Tab 7: Stok Alat
  equipmentList: EquipmentItem[];
  addEquipment: (item: Omit<EquipmentItem, 'id'>) => void;
  updateEquipment: (item: EquipmentItem) => void;
  deleteEquipment: (id: string) => void;
  importEquipment: (items: any[]) => void;

  // Reset to initial
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'civil_track_v2_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_PREFIX + 'theme') as 'light' | 'dark') || 'dark';
  });

  // Edit Mode toggle: default true, user can toggle in header/settings to lock data
  const [editMode, setEditModeState] = useState<boolean>(() => {
    return loadFromStorage('edit_mode', true);
  });

  // Users
  const [users, setUsers] = useState<UserAccount[]>(() => {
    return loadFromStorage('users', INITIAL_USERS);
  });

  // Current User (default Superadmin for full preview access)
  const [currentUser, setCurrentUserState] = useState<UserAccount>(() => {
    const saved = loadFromStorage('current_user', INITIAL_USERS[0]);
    return saved;
  });

  // Projects
  const [projects, setProjects] = useState<Project[]>(() => {
    return loadFromStorage('projects', INITIAL_PROJECTS);
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return loadFromStorage('active_project_id', INITIAL_PROJECTS[0].id);
  });

  // Tables
  const [workItems, setWorkItems] = useState<WorkItem[]>(() => {
    return loadFromStorage('work_items', INITIAL_WORK_ITEMS);
  });

  const [workers, setWorkers] = useState<Worker[]>(() => {
    return loadFromStorage('workers', INITIAL_WORKERS);
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    return loadFromStorage('attendance', INITIAL_ATTENDANCE);
  });

  const [staffVisits, setStaffVisits] = useState<StaffVisitLog[]>(() => {
    return loadFromStorage('staff_visits', INITIAL_STAFF_VISITS);
  });

  const [spbList, setSpbList] = useState<SPBSubmission[]>(() => {
    return loadFromStorage('spb_list', INITIAL_SPB);
  });

  const [pettyCashList, setPettyCashList] = useState<PettyCashTransaction[]>(() => {
    return loadFromStorage('petty_cash', INITIAL_PETTY_CASH);
  });

  const [materialStocks, setMaterialStocks] = useState<MaterialStock[]>(() => {
    return loadFromStorage('material_stocks', INITIAL_MATERIAL_STOCKS);
  });

  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(() => {
    return loadFromStorage('equipment_list', INITIAL_EQUIPMENT_ITEMS);
  });

  // Apply dark class to document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setEditMode = (val: boolean) => {
    setEditModeState(val);
    saveToStorage('edit_mode', val);
  };

  const setCurrentUser = (user: UserAccount) => {
    setCurrentUserState(user);
    saveToStorage('current_user', user);

    // If user role is 'user', automatically restrict active project to assignedProjectId if exists
    if (user.role === 'user' && user.assignedProjectId) {
      setActiveProjectId(user.assignedProjectId);
      saveToStorage('active_project_id', user.assignedProjectId);
    }
  };

  // Sync state changes to storage
  useEffect(() => { saveToStorage('users', users); }, [users]);
  useEffect(() => { saveToStorage('projects', projects); }, [projects]);
  useEffect(() => { saveToStorage('active_project_id', activeProjectId); }, [activeProjectId]);
  useEffect(() => { saveToStorage('work_items', workItems); }, [workItems]);
  useEffect(() => { saveToStorage('workers', workers); }, [workers]);
  useEffect(() => { saveToStorage('attendance', attendanceRecords); }, [attendanceRecords]);
  useEffect(() => { saveToStorage('staff_visits', staffVisits); }, [staffVisits]);
  useEffect(() => { saveToStorage('spb_list', spbList); }, [spbList]);
  useEffect(() => { saveToStorage('petty_cash', pettyCashList); }, [pettyCashList]);
  useEffect(() => { saveToStorage('material_stocks', materialStocks); }, [materialStocks]);
  useEffect(() => { saveToStorage('equipment_list', equipmentList); }, [equipmentList]);

  // Derived active project
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || INITIAL_PROJECTS[0];

  const setActiveProject = (proj: Project) => {
    setActiveProjectId(proj.id);
    saveToStorage('active_project_id', proj.id);
  };

  // User Management
  const addUser = (u: Omit<UserAccount, 'id'>) => {
    const newUser: UserAccount = {
      ...u,
      id: `user-${Date.now()}`
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUserRole = (userId: string, newRole: UserRole, assignedProjectId?: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole, assignedProjectId };
      }
      return u;
    }));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Projects CRUD
  const addProject = (proj: Omit<Project, 'id'>) => {
    const newProj: Project = {
      ...proj,
      id: `proj-${Date.now()}`
    };
    setProjects(prev => [...prev, newProj]);
    setActiveProjectId(newProj.id);
  };

  const updateProject = (proj: Project) => {
    setProjects(prev => prev.map(p => p.id === proj.id ? proj : p));
  };

  const deleteProject = (id: string) => {
    if (projects.length <= 1) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) {
      const remaining = projects.filter(p => p.id !== id);
      setActiveProjectId(remaining[0].id);
    }
  };

  // Work Items CRUD
  const addWorkItem = (item: Omit<WorkItem, 'id' | 'estimatedPrice' | 'realizedValue'>) => {
    const estimatedPrice = Number(item.volume) * Number(item.unitPrice);
    const realizedValue = (Number(item.progressPct) / 100) * estimatedPrice;
    const newItem: WorkItem = {
      ...item,
      id: `wk-${Date.now()}`,
      estimatedPrice,
      realizedValue
    };
    setWorkItems(prev => [newItem, ...prev]);
  };

  const updateWorkItem = (item: WorkItem) => {
    const estimatedPrice = Number(item.volume) * Number(item.unitPrice);
    const realizedValue = (Number(item.progressPct) / 100) * estimatedPrice;
    const updated: WorkItem = {
      ...item,
      estimatedPrice,
      realizedValue
    };
    setWorkItems(prev => prev.map(w => w.id === item.id ? updated : w));
  };

  const deleteWorkItem = (id: string) => {
    setWorkItems(prev => prev.filter(w => w.id !== id));
  };

  const importWorkItems = (rows: any[]) => {
    const imported: WorkItem[] = rows.map((r, index) => {
      const vol = parseFloat(r['Volume'] || r['volume'] || 0) || 1;
      const price = parseFloat(r['Harga Satuan (Rp)'] || r['harga satuan'] || r['unitPrice'] || 0) || 0;
      const bobot = parseFloat(r['Bobot (%)'] || r['bobot'] || r['weightPct'] || 0) || 1;
      const prog = parseFloat(r['Progress (%)'] || r['progress'] || r['progressPct'] || 0) || 0;
      const est = vol * price;
      return {
        id: `wk-imp-${Date.now()}-${index}`,
        projectId: activeProject.id,
        division: (r['Divisi Pekerjaan'] || r['Divisi'] || 'Pekerjaan Struktur Beton & Baja') as any,
        subDivision: r['Sub Divisi'] || r['Pekerjaan'] || `Pekerjaan ${index + 1}`,
        volume: vol,
        unit: r['Satuan'] || r['unit'] || 'm³',
        unitPrice: price,
        estimatedPrice: est,
        weightPct: bobot,
        progressPct: prog,
        realizedValue: (prog / 100) * est,
        status: (prog >= 100 ? 'Selesai' : prog > 0 ? 'Sedang Berjalan' : 'Belum Mulai') as any,
        notes: r['Catatan'] || 'Impor dari Spreadsheet',
        updatedDate: new Date().toISOString().split('T')[0]
      };
    });
    setWorkItems(prev => [...imported, ...prev]);
  };

  // Workers CRUD
  const addWorker = (worker: Omit<Worker, 'id'>) => {
    const newWorker: Worker = {
      ...worker,
      id: `wkr-${Date.now()}`
    };
    setWorkers(prev => [newWorker, ...prev]);
  };

  const updateWorker = (worker: Worker) => {
    setWorkers(prev => prev.map(w => w.id === worker.id ? worker : w));
  };

  const deleteWorker = (id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
  };

  const importWorkers = (rows: any[]) => {
    const imported: Worker[] = rows.map((r, i) => ({
      id: `wkr-imp-${Date.now()}-${i}`,
      projectId: activeProject.id,
      name: r['Nama Tenaga Kerja'] || r['Nama'] || `Pekerja ${i + 1}`,
      position: r['Jabatan'] || 'Tenaga Lapangan',
      category: (r['Kategori'] || 'Tenaga Harian') as any,
      type: (r['Internal atau Vendor'] || r['Tipe'] || 'Internal') as any,
      vendorName: r['Nama Vendor / Subkon'] || '',
      phone: r['No Telepon / HP'] || r['HP'] || '-',
      dailyRate: parseFloat(r['Upah Harian (Rp)'] || r['upah'] || 0) || undefined,
      status: (r['Status'] || 'Aktif') as any,
      notes: r['Catatan'] || 'Impor dari Spreadsheet'
    }));
    setWorkers(prev => [...imported, ...prev]);
  };

  // Attendance
  const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id'>) => {
    const newRec: AttendanceRecord = {
      ...record,
      id: `att-${Date.now()}`
    };
    setAttendanceRecords(prev => [newRec, ...prev]);
  };

  const updateAttendanceRecord = (record: AttendanceRecord) => {
    setAttendanceRecords(prev => prev.map(r => r.id === record.id ? record : r));
  };

  const batchMarkAttendance = (date: string, status: AttendanceRecord['status'], workerIds: string[]) => {
    setAttendanceRecords(prev => {
      const updated = [...prev];
      workerIds.forEach(wId => {
        const worker = workers.find(w => w.id === wId);
        if (!worker) return;
        const existingIdx = updated.findIndex(r => r.projectId === activeProject.id && r.date === date && r.workerId === wId);
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            status,
            overtimeHours: status === 'Lembur' ? (updated[existingIdx].overtimeHours || 2) : 0
          };
        } else {
          updated.push({
            id: `att-${Date.now()}-${wId}`,
            projectId: activeProject.id,
            date,
            workerId: wId,
            workerName: worker.name,
            category: worker.category,
            status,
            overtimeHours: status === 'Lembur' ? 2 : 0,
            notes: 'Batch check-in'
          });
        }
      });
      return updated;
    });
  };

  const addStaffVisit = (visit: Omit<StaffVisitLog, 'id'>) => {
    const newVisit: StaffVisitLog = {
      ...visit,
      id: `vst-${Date.now()}`
    };
    setStaffVisits(prev => [newVisit, ...prev]);
  };

  const deleteStaffVisit = (id: string) => {
    setStaffVisits(prev => prev.filter(v => v.id !== id));
  };

  // SPB (Pengajuan Bahan & Alat)
  const addSPB = (spb: Omit<SPBSubmission, 'id' | 'spbNumber' | 'totalAmount'>) => {
    const totalAmount = spb.items.reduce((sum, item) => sum + (item.totalPrice || (item.volume * item.estimatedPrice)), 0);
    const dateStr = spb.submissionDate.replace(/-/g, '').slice(0, 6);
    const count = spbList.filter(s => s.projectId === activeProject.id).length + 1;
    const spbNumber = `SPB/${activeProject.code || 'PRJ'}/${dateStr}/${String(count).padStart(3, '0')}`;

    const newSpb: SPBSubmission = {
      ...spb,
      id: `spb-${Date.now()}`,
      spbNumber,
      totalAmount
    };
    setSpbList(prev => [newSpb, ...prev]);
  };

  const updateSPB = (spb: SPBSubmission) => {
    const totalAmount = spb.items.reduce((sum, item) => sum + (item.totalPrice || (item.volume * item.estimatedPrice)), 0);
    setSpbList(prev => prev.map(s => s.id === spb.id ? { ...spb, totalAmount } : s));
  };

  const deleteSPB = (id: string) => {
    setSpbList(prev => prev.filter(s => s.id !== id));
  };

  const approveSPB = (spbId: string, role: 'logistik' | 'pj', notes?: string) => {
    setSpbList(prev => prev.map(s => {
      if (s.id !== spbId) return s;
      const today = new Date().toISOString().split('T')[0];
      if (role === 'logistik') {
        return {
          ...s,
          logisticsApproval: {
            approved: true,
            officerName: activeProject.logisticsOfficer || currentUser.name,
            approvalDate: today,
            notes: notes || 'Disetujui oleh Petugas Logistik Lapangan'
          }
        };
      } else {
        return {
          ...s,
          pjApproval: {
            approved: true,
            officerName: activeProject.siteManager || currentUser.name,
            approvalDate: today,
            notes: notes || 'Disetujui oleh Penanggung Jawab Proyek (Site Manager)'
          }
        };
      }
    }));
  };

  // Petty Cash
  const addPettyCashTransaction = (tx: Omit<PettyCashTransaction, 'id'>) => {
    const newTx: PettyCashTransaction = {
      ...tx,
      id: `pc-${Date.now()}`
    };
    setPettyCashList(prev => [newTx, ...prev]);
  };

  const deletePettyCashTransaction = (id: string) => {
    setPettyCashList(prev => prev.filter(p => p.id !== id));
  };

  // Material Stock
  const addMaterial = (mat: Omit<MaterialStock, 'id' | 'movements'>) => {
    const newMat: MaterialStock = {
      ...mat,
      id: `mat-${Date.now()}`,
      movements: []
    };
    setMaterialStocks(prev => [newMat, ...prev]);
  };

  const updateMaterial = (mat: MaterialStock) => {
    setMaterialStocks(prev => prev.map(m => m.id === mat.id ? mat : m));
  };

  const deleteMaterial = (id: string) => {
    setMaterialStocks(prev => prev.filter(m => m.id !== id));
  };

  const addStockMovement = (materialId: string, movement: Omit<MaterialStockMovement, 'id'>) => {
    const newMovement: MaterialStockMovement = {
      ...movement,
      id: `mv-${Date.now()}`
    };
    setMaterialStocks(prev => prev.map(m => {
      if (m.id === materialId) {
        return {
          ...m,
          movements: [newMovement, ...m.movements]
        };
      }
      return m;
    }));
  };

  const deleteStockMovement = (materialId: string, movementId: string) => {
    setMaterialStocks(prev => prev.map(m => {
      if (m.id === materialId) {
        return {
          ...m,
          movements: m.movements.filter(mv => mv.id !== movementId)
        };
      }
      return m;
    }));
  };

  const importMaterials = (rows: any[]) => {
    const imported: MaterialStock[] = rows.map((r, i) => ({
      id: `mat-imp-${Date.now()}-${i}`,
      projectId: activeProject.id,
      materialName: r['Nama Bahan'] || r['Nama'] || `Material ${i + 1}`,
      category: (r['Kategori'] || 'Lainnya') as any,
      unit: r['Satuan'] || 'Unit',
      initialStock: parseFloat(r['Stok Awal'] || 0) || 0,
      minimumStock: parseFloat(r['Batas Minimum Stok'] || 10) || 10,
      notes: r['Catatan'] || 'Impor dari Spreadsheet',
      movements: []
    }));
    setMaterialStocks(prev => [...imported, ...prev]);
  };

  // Equipment List
  const addEquipment = (item: Omit<EquipmentItem, 'id'>) => {
    const newItem: EquipmentItem = {
      ...item,
      id: `eq-${Date.now()}`
    };
    setEquipmentList(prev => [newItem, ...prev]);
  };

  const updateEquipment = (item: EquipmentItem) => {
    setEquipmentList(prev => prev.map(e => e.id === item.id ? item : e));
  };

  const deleteEquipment = (id: string) => {
    setEquipmentList(prev => prev.filter(e => e.id !== id));
  };

  const importEquipment = (rows: any[]) => {
    const imported: EquipmentItem[] = rows.map((r, i) => ({
      id: `eq-imp-${Date.now()}-${i}`,
      projectId: activeProject.id,
      toolName: r['Nama Alat'] || r['Nama'] || `Alat ${i + 1}`,
      serialNumber: r['No Seri / Kode Aset'] || `EQ-AST-${i + 1}`,
      category: (r['Kategori'] || 'Power Tools') as any,
      ownership: (r['Kepemilikan'] || 'Milik Sendiri') as any,
      rentalVendor: r['Vendor Rental'] || '',
      rentalDailyRate: parseFloat(r['Tarif Harian (Rp)'] || 0) || undefined,
      entryDate: r['Tanggal Masuk'] || new Date().toISOString().split('T')[0],
      status: (r['Status'] || 'Siap Pakai') as any,
      assignedOperator: r['Operator Penanggung Jawab'] || '-',
      locationZone: r['Zona Lokasi'] || 'Gudang Alat',
      notes: r['Keterangan'] || 'Impor dari Spreadsheet'
    }));
    setEquipmentList(prev => [...imported, ...prev]);
  };

  const resetDemoData = () => {
    setUsers(INITIAL_USERS);
    setProjects(INITIAL_PROJECTS);
    setActiveProjectId(INITIAL_PROJECTS[0].id);
    setWorkItems(INITIAL_WORK_ITEMS);
    setWorkers(INITIAL_WORKERS);
    setAttendanceRecords(INITIAL_ATTENDANCE);
    setStaffVisits(INITIAL_STAFF_VISITS);
    setSpbList(INITIAL_SPB);
    setPettyCashList(INITIAL_PETTY_CASH);
    setMaterialStocks(INITIAL_MATERIAL_STOCKS);
    setEquipmentList(INITIAL_EQUIPMENT_ITEMS);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        editMode,
        setEditMode,
        currentUser,
        setCurrentUser,
        users,
        addUser,
        updateUserRole,
        deleteUser,
        projects,
        activeProject,
        setActiveProject,
        addProject,
        updateProject,
        deleteProject,
        workItems,
        addWorkItem,
        updateWorkItem,
        deleteWorkItem,
        importWorkItems,
        workers,
        addWorker,
        updateWorker,
        deleteWorker,
        importWorkers,
        attendanceRecords,
        addAttendanceRecord,
        updateAttendanceRecord,
        batchMarkAttendance,
        staffVisits,
        addStaffVisit,
        deleteStaffVisit,
        spbList,
        addSPB,
        updateSPB,
        deleteSPB,
        approveSPB,
        pettyCashList,
        addPettyCashTransaction,
        deletePettyCashTransaction,
        materialStocks,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        addStockMovement,
        deleteStockMovement,
        importMaterials,
        equipmentList,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        importEquipment,
        resetDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
