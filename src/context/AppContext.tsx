import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createDemoData } from '../data/demoData';
import type { Alert, AppData, HDSession, Patient, SessionFormData, User, UserRole } from '../types';
import { calculateIDWG, calculateYellowStreak, getZone } from '../utils/zonasiCalculator';

const DATA_KEY = 'zonasi-hd-demo-data-v1';
const USER_KEY = 'zonasi-hd-demo-user-v1';

const demoUsers: Record<UserRole, User> = {
  PK_II: { uid: 'demo-pk2', email: 'pkii@demo.local', displayName: 'Perawat PK II', role: 'PK_II', unit: 'Hemodialisis' },
  PK_III: { uid: 'demo-pk3', email: 'pkiii@demo.local', displayName: 'Perawat PK III', role: 'PK_III', unit: 'Hemodialisis' },
  DOKTER: { uid: 'demo-dokter', email: 'dokter@demo.local', displayName: 'Dokter DPJP', role: 'DOKTER', unit: 'Hemodialisis' },
  ADMIN: { uid: 'demo-admin', email: 'admin@demo.local', displayName: 'Administrator', role: 'ADMIN', unit: 'Hemodialisis' },
};

interface AppContextValue {
  data: AppData;
  user: User | null;
  login: (role: UserRole) => void;
  loginFirebase: (email: string, password: string) => Promise<void>;
  logout: () => void;
  saveSession: (patient: Patient, form: SessionFormData) => HDSession;
  acknowledgeAlert: (alertId: string) => void;
  resetDemo: () => void;
  sessionsFor: (patientId: string) => HDSession[];
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
    return saved ? JSON.parse(saved) as User : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);
  const [user, setUser] = useState<User | null>(loadUser);

  useEffect(() => localStorage.setItem(DATA_KEY, JSON.stringify(data)), [data]);
  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === DATA_KEY && event.newValue) setData(JSON.parse(event.newValue) as AppData);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const login = useCallback((role: UserRole) => setUser(demoUsers[role]), []);
  const loginFirebase = useCallback(async (email: string, password: string) => {
    const { signInWithFirebase } = await import('../services/firebase');
    setUser(await signInWithFirebase(email, password));
  }, []);
  const logout = useCallback(() => {
    void import('../services/firebase').then(({ signOutFirebase }) => signOutFirebase());
    setUser(null);
  }, []);

  const saveSession = useCallback((patient: Patient, form: SessionFormData) => {
    if (!user) throw new Error('Pengguna belum masuk');
    if (user.role === 'DOKTER' || user.role === 'ADMIN') throw new Error('Peran ini tidak memiliki izin input sesi');
    const idwgPct = calculateIDWG(form.pre_weight, patient.bb_kering);
    const zone = getZone(idwgPct);
    const now = new Date().toISOString();
    const session: HDSession = {
      id: crypto.randomUUID(), patient_id: patient.id, session_date: now,
      shift: form.shift, pre_weight: form.pre_weight, post_weight: form.post_weight,
      idwg_pct: idwgPct, zone, interventions: form.interventions,
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
  }, [user]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    if (!user || !['PK_III', 'DOKTER', 'ADMIN'].includes(user.role)) return;
    setData((current) => ({ ...current, alerts: current.alerts.map((alert): Alert => alert.id === alertId ? {
      ...alert, acknowledged: true, acknowledged_by: user.displayName, acknowledged_at: new Date().toISOString(),
    } : alert) }));
  }, [user]);

  const resetDemo = useCallback(() => setData(createDemoData()), []);
  const sessionsFor = useCallback((patientId: string) => data.sessions
    .filter((session) => session.patient_id === patientId)
    .sort((a, b) => b.session_date.localeCompare(a.session_date)), [data.sessions]);

  const value = useMemo(() => ({ data, user, login, loginFirebase, logout, saveSession, acknowledgeAlert, resetDemo, sessionsFor }),
    [data, user, login, loginFirebase, logout, saveSession, acknowledgeAlert, resetDemo, sessionsFor]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp harus digunakan di dalam AppProvider');
  return context;
}
