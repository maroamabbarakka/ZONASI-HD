import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createDemoData } from '../data/demoData';
import type { Alert, AppData, DataMode, HDSession, Patient, PatientInput, SessionFormData, User, UserRole } from '../types';
import { calculateIDWG, calculateYellowStreak, getZone } from '../utils/zonasiCalculator';
import { normalizeRole } from '../lib/permissions';

const DATA_KEY = 'zonasi-hd-demo-data-v1';
const USER_KEY = 'zonasi-hd-demo-user-v1';

const demoUsers: Record<UserRole, User> = {
  PERAWAT: { uid: 'demo-perawat', email: 'perawat@demo.local', displayName: 'Perawat Demo', role: 'PERAWAT', unit: 'Hemodialisis' },
  SUPERVISOR: { uid: 'demo-supervisor', email: 'supervisor@demo.local', displayName: 'Supervisor Klinis', role: 'SUPERVISOR', unit: 'Hemodialisis' },
  DOKTER: { uid: 'demo-dokter', email: 'dokter@demo.local', displayName: 'Dokter DPJP', role: 'DOKTER', unit: 'Hemodialisis' },
  ADMIN: { uid: 'demo-admin', email: 'admin@demo.local', displayName: 'Administrator', role: 'ADMIN', unit: 'Hemodialisis' },
};

interface AppContextValue {
  data: AppData;
  user: User | null;
  login: (role: UserRole) => void;
  loginFirebase: (email: string, password: string) => Promise<void>;
  logout: () => void;
  saveSession: (patient: Patient, form: SessionFormData) => Promise<HDSession>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  resetDemo: () => void;
  sessionsFor: (patientId: string) => HDSession[];
  dataMode: DataMode;
  dataError: string;
  dataLoading: boolean;
  dataUpdatedAt: string;
  createPatient: (input: PatientInput) => Promise<Patient>;
  updatePatient: (patientId: string, input: PatientInput) => Promise<void>;
  importPatients: (rows: PatientInput[]) => Promise<{ imported: number; failed: Array<{ rm: string; message: string }> }>;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadData(): AppData {
  try {
    const saved = localStorage.getItem(DATA_KEY);
    return saved ? JSON.parse(saved) as AppData : createDemoData();
  } catch {
    return createDemoData();
  }
}

function loadUser(): User | null {
  try {
    const saved = localStorage.getItem(USER_KEY);
    if (!saved) return null;
    const value = JSON.parse(saved) as User & { role: unknown }; const role = normalizeRole(value.role);
    return role && value.uid.startsWith('demo-') ? { ...value, role } : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);
  const [user, setUser] = useState<User | null>(loadUser);
  const [dataError, setDataError] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [dataUpdatedAt, setDataUpdatedAt] = useState('');
  const dataMode: DataMode = user && !user.uid.startsWith('demo-') ? 'firebase' : 'demo';

  useEffect(() => { if (dataMode === 'demo') localStorage.setItem(DATA_KEY, JSON.stringify(data)); }, [data, dataMode]);
  useEffect(() => {
    if (user?.uid.startsWith('demo-')) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    void import('../services/firebase').then(({ restoreFirebaseSession }) => restoreFirebaseSession()).then((restored) => {
      if (!cancelled && restored) setUser((current) => current ?? restored);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === DATA_KEY && event.newValue) setData(JSON.parse(event.newValue) as AppData);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    if (!user || dataMode !== 'firebase') { setDataError(''); setDataLoading(false); return; }
    setDataLoading(true);
    let unsubscribe: (() => void) | undefined; let cancelled = false;
    void import('../services/firebase').then(async ({ waitForFirebaseAuth, subscribeClinicalData }) => {
      await waitForFirebaseAuth(user.uid); if (cancelled) return;
      unsubscribe = subscribeClinicalData((next) => { setData(next); setDataError(''); setDataLoading(false); setDataUpdatedAt(new Date().toISOString()); }, (message) => { setDataError(message); setDataLoading(false); });
    }).catch((error) => { setDataError(error instanceof Error ? error.message : 'Gagal menghubungkan data Firestore.'); setDataLoading(false); });
    return () => { cancelled = true; unsubscribe?.(); };
  }, [user, dataMode]);

  const login = useCallback((role: UserRole) => setUser(demoUsers[role]), []);
  const loginFirebase = useCallback(async (email: string, password: string) => {
    const { signInWithFirebase } = await import('../services/firebase');
    setUser(await signInWithFirebase(email, password));
  }, []);
  const logout = useCallback(() => {
    void import('../services/firebase').then(({ signOutFirebase }) => signOutFirebase());
    setUser(null);
  }, []);

  const saveSession = useCallback(async (patient: Patient, form: SessionFormData) => {
    if (!user) throw new Error('Pengguna belum masuk');
    if (user.role === 'DOKTER' || user.role === 'ADMIN') throw new Error('Peran ini tidak memiliki izin input sesi');
    if (dataMode === 'firebase') {
      const { saveSessionFirestore } = await import('../services/firebase');
      return saveSessionFirestore(patient, form, user);
    }
    const existing = data.sessions.find((item) => item.patient_id === patient.id && item.submission_id === form.submission_id);
    if (existing) return existing;
    const idwgPct = calculateIDWG(form.pre_weight, patient.bb_kering);
    const zone = getZone(idwgPct);
    const now = new Date().toISOString();
    const session: HDSession = {
      id: form.submission_id, submission_id: form.submission_id, patient_id: patient.id, session_date: now,
      shift: form.shift, pre_weight: form.pre_weight, post_weight: form.post_weight,
      idwg_pct: idwgPct, zone, dry_weight_used_kg: patient.bb_kering, dry_weight_version: 1,
      formula_version: 'IDWG_V1', threshold_version: 'ZONE_2026_V1', protocol_version: 'HD_FLUID_V1',
      status: 'VERIFIED', calculation_authority: 'CLIENT_MVP', interventions: form.interventions,
      uf_goal: form.uf_goal, notes: form.notes, nurse_uid: user.uid,
      nurse_name: user.displayName, created_at: now,
    };
    setData((current) => {
      const patientSessions = [session, ...current.sessions.filter((item) => item.patient_id === patient.id)]
        .sort((a, b) => b.session_date.localeCompare(a.session_date));
      const yellowStreak = calculateYellowStreak(patientSessions);
      const updatedPatient: Patient = {
        ...patient, latest_session_date: now, latest_pre_weight: form.pre_weight,
        latest_idwg_pct: idwgPct, latest_zone: zone, yellow_streak: yellowStreak,
        risk_level: zone === 'MERAH' ? 'high' : yellowStreak >= 3 ? 'medium' : 'low',
      };
      const alerts = [...current.alerts];
      if (yellowStreak >= 3 && !alerts.some((alert) => alert.patient_id === patient.id && alert.type === 'YELLOW_STREAK_3' && !alert.acknowledged)) {
        alerts.unshift({
          id: crypto.randomUUID(), patient_id: patient.id, patient_name: patient.nama,
          type: 'YELLOW_STREAK_3', triggered_at: now, acknowledged: false,
          message: `${patient.nama} berada di Zona Kuning selama ${yellowStreak} sesi berturut-turut.`,
        });
      }
      if (zone === 'MERAH') {
        alerts.unshift({
          id: crypto.randomUUID(), patient_id: patient.id, patient_name: patient.nama,
          type: 'RECENT_RED', triggered_at: now, acknowledged: false,
          message: `${patient.nama} baru tercatat di Zona Merah (${idwgPct.toFixed(1)}%).`,
        });
      }
      return {
        patients: current.patients.map((item) => item.id === patient.id ? updatedPatient : item),
        sessions: [session, ...current.sessions], alerts,
      };
    });
    return session;
  }, [user, dataMode, data.sessions]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    if (!user || !['SUPERVISOR', 'DOKTER', 'ADMIN'].includes(user.role)) return;
    if (dataMode === 'firebase') { const { acknowledgeAlertFirestore } = await import('../services/firebase'); await acknowledgeAlertFirestore(alertId, user); return; }
    setData((current) => ({ ...current, alerts: current.alerts.map((alert): Alert => alert.id === alertId ? {
      ...alert, acknowledged: true, acknowledged_by: user.displayName, acknowledged_at: new Date().toISOString(),
    } : alert) }));
  }, [user, dataMode]);

  const createPatient = useCallback(async (input: PatientInput) => {
    if (!user || !['SUPERVISOR', 'ADMIN'].includes(user.role)) throw new Error('Anda tidak memiliki izin mengelola pasien.');
    if (dataMode === 'firebase') { const { createPatientFirestore } = await import('../services/firebase'); return createPatientFirestore(input); }
    if (data.patients.some((item) => item.rm.toUpperCase().replace(/[^A-Z0-9]/g, '') === input.rm.toUpperCase().replace(/[^A-Z0-9]/g, ''))) throw new Error(`Nomor RM ${input.rm} sudah digunakan.`);
    const patient: Patient = { id: crypto.randomUUID(), ...input, yellow_streak: 0, risk_level: 'low', is_active: true, created_at: new Date().toISOString(), created_by: user.uid };
    setData((current) => ({ ...current, patients: [patient, ...current.patients] })); return patient;
  }, [user, dataMode, data.patients]);

  const updatePatient = useCallback(async (patientId: string, input: PatientInput) => {
    if (!user || !['SUPERVISOR', 'ADMIN'].includes(user.role)) throw new Error('Anda tidak memiliki izin mengelola pasien.');
    if (dataMode === 'firebase') { const { updatePatientFirestore } = await import('../services/firebase'); await updatePatientFirestore(patientId, input); return; }
    if (data.patients.some((item) => item.id !== patientId && item.rm.toUpperCase().replace(/[^A-Z0-9]/g, '') === input.rm.toUpperCase().replace(/[^A-Z0-9]/g, ''))) throw new Error(`Nomor RM ${input.rm} sudah digunakan.`);
    setData((current) => ({ ...current, patients: current.patients.map((item) => item.id === patientId ? { ...item, ...input, updated_at: new Date().toISOString() } : item) }));
  }, [user, dataMode, data.patients]);

  const importPatients = useCallback(async (rows: PatientInput[]) => {
    if (!user || user.role !== 'ADMIN') throw new Error('Bulk import hanya dapat dilakukan Administrator.');
    if (dataMode === 'firebase') { const { importPatientsFirestore } = await import('../services/firebase'); return importPatientsFirestore(rows); }
    const failed: Array<{ rm: string; message: string }> = []; let imported = 0;
    for (const row of rows) { try { await createPatient(row); imported++; } catch (error) { failed.push({ rm: row.rm, message: error instanceof Error ? error.message : 'Gagal mengimpor.' }); } }
    return { imported, failed };
  }, [user, dataMode, createPatient]);

  const resetDemo = useCallback(() => setData(createDemoData()), []);
  const sessionsFor = useCallback((patientId: string) => data.sessions
    .filter((session) => session.patient_id === patientId)
    .sort((a, b) => b.session_date.localeCompare(a.session_date)), [data.sessions]);

  const value = useMemo(() => ({ data, user, login, loginFirebase, logout, saveSession, acknowledgeAlert, resetDemo, sessionsFor, dataMode, dataError, dataLoading, dataUpdatedAt, createPatient, updatePatient, importPatients }),
    [data, user, login, loginFirebase, logout, saveSession, acknowledgeAlert, resetDemo, sessionsFor, dataMode, dataError, dataLoading, dataUpdatedAt, createPatient, updatePatient, importPatients]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp harus digunakan di dalam AppProvider');
  return context;
}
