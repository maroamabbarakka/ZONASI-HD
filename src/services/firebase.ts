import { FirebaseError, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, type Auth } from 'firebase/auth';
import {
  collection, collectionGroup, doc, getDoc, initializeFirestore, memoryLocalCache,
  onSnapshot, runTransaction, serverTimestamp, setDoc, updateDoc,
  type DocumentData, type Firestore, type QueryDocumentSnapshot, type Unsubscribe,
} from 'firebase/firestore';
import { normalizeRole } from '../lib/permissions';
import type { Alert, AppData, HDSession, Patient, PatientInput, SessionFormData, User } from '../types';
import { calculateIDWG, getZone } from '../utils/zonasiCalculator';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseEnabled = import.meta.env.VITE_FIREBASE_ENABLED === 'true' && Object.values(firebaseConfig).every(Boolean);
export let firebaseApp: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;

if (firebaseEnabled) {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  db = initializeFirestore(firebaseApp, { localCache: memoryLocalCache() });
}

const iso = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value && 'toDate' in value) return (value as { toDate: () => Date }).toDate().toISOString();
  return undefined;
};

const patientFromDoc = (snap: QueryDocumentSnapshot<DocumentData>): Patient => {
  const value = snap.data();
  return {
    id: snap.id, rm: String(value.rm ?? ''), nama: String(value.nama ?? ''),
    tanggal_lahir: String(value.tanggal_lahir ?? ''), jenis_kelamin: value.jenis_kelamin === 'P' ? 'P' : 'L',
    bb_kering: Number(value.bb_kering ?? 0), latest_session_date: iso(value.latest_session_date),
    latest_pre_weight: value.latest_pre_weight == null ? undefined : Number(value.latest_pre_weight),
    latest_idwg_pct: value.latest_idwg_pct == null ? undefined : Number(value.latest_idwg_pct),
    latest_zone: value.latest_zone, yellow_streak: Number(value.yellow_streak ?? 0),
    risk_level: value.risk_level ?? 'low', is_active: value.is_active !== false, notes: value.notes,
    created_at: iso(value.created_at), created_by: value.created_by, updated_at: iso(value.updated_at),
  };
};

const sessionFromDoc = (snap: QueryDocumentSnapshot<DocumentData>): HDSession => {
  const value = snap.data();
  return {
    id: snap.id, patient_id: String(value.patient_id), session_date: iso(value.session_date) ?? new Date().toISOString(),
    shift: value.shift ?? 'Pagi', pre_weight: Number(value.pre_weight), post_weight: value.post_weight == null ? undefined : Number(value.post_weight),
    idwg_pct: Number(value.idwg_pct), zone: value.zone, interventions: value.interventions ?? [],
    uf_goal: value.uf_goal == null ? undefined : Number(value.uf_goal), notes: value.notes,
    nurse_uid: String(value.nurse_uid), nurse_name: String(value.nurse_name ?? ''), created_at: iso(value.created_at) ?? new Date().toISOString(),
  };
};

const alertFromDoc = (snap: QueryDocumentSnapshot<DocumentData>): Alert => {
  const value = snap.data();
  return {
    id: snap.id, patient_id: String(value.patient_id), patient_name: String(value.patient_name), type: value.type,
    triggered_at: iso(value.triggered_at) ?? new Date().toISOString(), acknowledged: Boolean(value.acknowledged),
    acknowledged_by: value.acknowledged_by, acknowledged_at: iso(value.acknowledged_at), message: String(value.message),
  };
};

function requireFirebase() {
  if (!auth || !db || !auth.currentUser) throw new Error('Sesi Firebase belum siap. Silakan login ulang.');
  return { auth, db };
}

export async function signInWithFirebase(email: string, password: string): Promise<User> {
  if (!auth || !db) throw new Error('Firebase belum dikonfigurasi.');
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getDoc(doc(db, 'users', credential.user.uid));
    if (!profile.exists()) { await signOut(auth); throw new Error('Profil pengguna belum dibuat pada collection users.'); }
    const value = profile.data();
    const role = normalizeRole(value.role);
    if (!role) { await signOut(auth); throw new Error('Role pengguna tidak valid.'); }
    return { uid: credential.user.uid, email: credential.user.email ?? email, displayName: String(value.displayName || credential.user.displayName || email), role, unit: String(value.unit || 'Hemodialisis') };
  } catch (error) {
    if (!(error instanceof FirebaseError)) throw error;
    if (error.code === 'auth/invalid-credential') throw new Error('Email atau kata sandi tidak sesuai.');
    if (error.code === 'auth/operation-not-allowed') throw new Error('Login Email/Password belum diaktifkan di Firebase Console.');
    if (error.code === 'auth/too-many-requests') throw new Error('Terlalu banyak percobaan login. Coba kembali beberapa saat lagi.');
    if (error.code === 'auth/network-request-failed') throw new Error('Firebase tidak dapat dijangkau. Periksa koneksi internet.');
    if (error.code === 'permission-denied') throw new Error('Firestore menolak pembacaan profil pengguna. Periksa Security Rules.');
    throw new Error(`Login Firebase gagal (${error.code}).`);
  }
}

export async function waitForFirebaseAuth(uid: string): Promise<void> {
  if (!auth) throw new Error('Firebase Auth tidak tersedia.');
  if (auth.currentUser?.uid === uid) return;
  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => { unsubscribe(); reject(new Error('Sesi Firebase kedaluwarsa. Silakan login ulang.')); }, 8000);
    const unsubscribe = onAuthStateChanged(auth!, (current) => {
      if (current?.uid === uid) { window.clearTimeout(timeout); unsubscribe(); resolve(); }
      else if (current === null) { window.clearTimeout(timeout); unsubscribe(); reject(new Error('Sesi Firebase tidak ditemukan. Silakan login ulang.')); }
    });
  });
}

export async function signOutFirebase(): Promise<void> { if (auth?.currentUser) await signOut(auth); }

export function subscribeClinicalData(onData: (data: AppData) => void, onError: (message: string) => void): Unsubscribe {
  const { db } = requireFirebase();
  let patients: Patient[] = []; let sessions: HDSession[] = []; let alerts: Alert[] = [];
  const emit = () => onData({ patients, sessions, alerts });
  const fail = (error: Error) => onError(error.message);
  const unsubs = [
    onSnapshot(collection(db, 'patients'), (snap) => { patients = snap.docs.map(patientFromDoc); emit(); }, fail),
    onSnapshot(collectionGroup(db, 'sessions'), (snap) => { sessions = snap.docs.map(sessionFromDoc); emit(); }, fail),
    onSnapshot(collection(db, 'alerts'), (snap) => { alerts = snap.docs.map(alertFromDoc); emit(); }, fail),
  ];
  return () => unsubs.forEach((unsubscribe) => unsubscribe());
}

export function normalizeRM(value: string): string { return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''); }

export async function createPatientFirestore(input: PatientInput): Promise<Patient> {
  const { auth, db } = requireFirebase(); const rmKey = normalizeRM(input.rm);
  const currentUid = auth.currentUser!.uid;
  if (!rmKey) throw new Error('Nomor RM wajib diisi.');
  const patientRef = doc(collection(db, 'patients')); const keyRef = doc(db, 'patient_keys', rmKey); const now = new Date().toISOString();
  await runTransaction(db, async (transaction) => {
    if ((await transaction.get(keyRef)).exists()) throw new Error(`Nomor RM ${input.rm} sudah digunakan.`);
    transaction.set(keyRef, { patient_id: patientRef.id, rm: input.rm.trim(), created_at: serverTimestamp() });
    transaction.set(patientRef, { ...input, rm: input.rm.trim(), nama: input.nama.trim(), yellow_streak: 0, risk_level: 'low', is_active: true, created_at: serverTimestamp(), created_by: currentUid, updated_at: serverTimestamp() });
  });
  return { id: patientRef.id, ...input, rm: input.rm.trim(), nama: input.nama.trim(), yellow_streak: 0, risk_level: 'low', is_active: true, created_at: now, created_by: currentUid };
}

export async function updatePatientFirestore(patientId: string, input: PatientInput): Promise<void> {
  const { db } = requireFirebase(); const patientRef = doc(db, 'patients', patientId); const newKey = normalizeRM(input.rm);
  await runTransaction(db, async (transaction) => {
    const current = await transaction.get(patientRef); if (!current.exists()) throw new Error('Pasien tidak ditemukan.');
    const oldKey = normalizeRM(String(current.data().rm));
    if (newKey !== oldKey) {
      const nextKeyRef = doc(db, 'patient_keys', newKey); if ((await transaction.get(nextKeyRef)).exists()) throw new Error(`Nomor RM ${input.rm} sudah digunakan.`);
      transaction.delete(doc(db, 'patient_keys', oldKey)); transaction.set(nextKeyRef, { patient_id: patientId, rm: input.rm.trim(), created_at: serverTimestamp() });
    }
    transaction.update(patientRef, { ...input, rm: input.rm.trim(), nama: input.nama.trim(), updated_at: serverTimestamp() });
  });
}

export async function saveSessionFirestore(patient: Patient, form: SessionFormData, user: User): Promise<HDSession> {
  const { db } = requireFirebase(); const patientRef = doc(db, 'patients', patient.id); const sessionRef = doc(collection(db, 'patients', patient.id, 'sessions'));
  const idwg = calculateIDWG(form.pre_weight, patient.bb_kering); const zone = getZone(idwg); const now = new Date().toISOString();
  const session: HDSession = { id: sessionRef.id, patient_id: patient.id, session_date: now, shift: form.shift, pre_weight: form.pre_weight, post_weight: form.post_weight, idwg_pct: idwg, zone, interventions: form.interventions, uf_goal: form.uf_goal, notes: form.notes, nurse_uid: user.uid, nurse_name: user.displayName, created_at: now };
  await runTransaction(db, async (transaction) => {
    const current = await transaction.get(patientRef); if (!current.exists()) throw new Error('Pasien tidak ditemukan.');
    const yellowStreak = zone === 'KUNING' ? Number(current.data().yellow_streak ?? 0) + 1 : 0;
    transaction.set(sessionRef, { ...session, session_date: serverTimestamp(), created_at: serverTimestamp() });
    transaction.update(patientRef, { latest_session_date: serverTimestamp(), latest_pre_weight: form.pre_weight, latest_idwg_pct: idwg, latest_zone: zone, yellow_streak: yellowStreak, risk_level: zone === 'MERAH' ? 'high' : yellowStreak >= 3 ? 'medium' : 'low', updated_at: serverTimestamp() });
    if (yellowStreak === 3 || zone === 'MERAH') {
      const alertRef = doc(collection(db, 'alerts')); transaction.set(alertRef, { patient_id: patient.id, patient_name: patient.nama, type: zone === 'MERAH' ? 'RECENT_RED' : 'YELLOW_STREAK_3', triggered_at: serverTimestamp(), acknowledged: false, message: zone === 'MERAH' ? `${patient.nama} baru tercatat di Zona Merah (${idwg.toFixed(1)}%).` : `${patient.nama} berada di Zona Kuning selama 3 sesi berturut-turut.` });
    }
  });
  return session;
}

export async function acknowledgeAlertFirestore(alertId: string, user: User): Promise<void> {
  const { db } = requireFirebase(); await updateDoc(doc(db, 'alerts', alertId), { acknowledged: true, acknowledged_by: user.displayName, acknowledged_at: serverTimestamp() });
}

export async function importPatientsFirestore(rows: PatientInput[]) {
  const failed: Array<{ rm: string; message: string }> = []; let imported = 0;
  for (const row of rows) { try { await createPatientFirestore(row); imported++; } catch (error) { failed.push({ rm: row.rm, message: error instanceof Error ? error.message : 'Gagal mengimpor.' }); } }
  return { imported, failed };
}

export function subscribeUserProfiles(onData: (users: User[]) => void, onError: (message: string) => void): Unsubscribe {
  const { db } = requireFirebase();
  return onSnapshot(collection(db, 'users'), (snapshot) => onData(snapshot.docs.map((item) => {
    const value = item.data(); const role = normalizeRole(value.role);
    return { uid: item.id, email: String(value.email ?? ''), displayName: String(value.displayName ?? ''), role: role ?? 'PERAWAT', unit: String(value.unit ?? 'Hemodialisis') };
  })), (error) => onError(error.message));
}

export async function saveUserProfile(profile: User): Promise<void> {
  const { db } = requireFirebase();
  await setDoc(doc(db, 'users', profile.uid.trim()), { email: profile.email.trim(), displayName: profile.displayName.trim(), role: profile.role, unit: profile.unit || 'Hemodialisis', updated_at: serverTimestamp() }, { merge: true });
}
