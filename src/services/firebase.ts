import { FirebaseError, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, type Auth, type User as FirebaseUser } from 'firebase/auth';
import {
  collection, collectionGroup, doc, getDoc, initializeFirestore, memoryLocalCache,
  onSnapshot, runTransaction, serverTimestamp, setDoc, updateDoc,
  type DocumentData, type Firestore, type QueryDocumentSnapshot, type Unsubscribe,
} from 'firebase/firestore';
import { getFunctions, httpsCallable, type Functions } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { normalizeRole } from '../lib/permissions';
import type { Alert, AppData, HDSession, Patient, PatientInput, SessionFormData, User } from '../types';
import { calculateIDWG, calculateIDWGRaw, getZone } from '../utils/zonasiCalculator';

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
export let functions: Functions | null = null;
export const trustedBackendEnabled = import.meta.env.VITE_TRUSTED_BACKEND_ENABLED === 'true';

if (firebaseEnabled) {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY;
  if (appCheckSiteKey) initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
  db = initializeFirestore(firebaseApp, { localCache: memoryLocalCache() });
  functions = getFunctions(firebaseApp, 'asia-southeast2');
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
    bb_kering: Number(value.bb_kering ?? 0), latest_session_date: iso(value.latest_session_date), latest_session_id: value.latest_session_id,
    latest_pre_weight: value.latest_pre_weight == null ? undefined : Number(value.latest_pre_weight),
    latest_idwg_pct: value.latest_idwg_pct == null ? undefined : Number(value.latest_idwg_pct),
    latest_zone: value.latest_zone, yellow_streak: Number(value.yellow_streak ?? 0),
    latest_session_status: value.latest_session_status,
    risk_level: value.risk_level ?? 'low', is_active: value.is_active !== false, notes: value.notes,
    created_at: iso(value.created_at), created_by: value.created_by, updated_at: iso(value.updated_at),
  };
};

const sessionFromValue = (id: string, value: DocumentData): HDSession => {
  return {
    id, submission_id: String(value.submission_id ?? id), patient_id: String(value.patient_id), session_date: iso(value.session_date) ?? new Date().toISOString(),
    shift: value.shift ?? 'Pagi', pre_weight: Number(value.pre_weight), post_weight: value.post_weight == null ? undefined : Number(value.post_weight),
    idwg_pct: Number(value.idwg_pct), idwg_raw_pct: value.idwg_raw_pct == null ? undefined : Number(value.idwg_raw_pct), zone: value.zone, interventions: value.interventions ?? [],
    dry_weight_used_kg: Number(value.dry_weight_used_kg ?? value.dry_weight_used ?? 0), dry_weight_version: Number(value.dry_weight_version ?? 1),
    formula_version: value.formula_version ?? 'IDWG_V1', threshold_version: value.threshold_version ?? 'ZONE_2026_V1', protocol_version: value.protocol_version ?? 'HD_FLUID_V1',
    status: value.status ?? 'VERIFIED', calculation_authority: value.calculation_authority === 'TRUSTED_API_V1' ? 'TRUSTED_API_V1' : value.calculation_authority === 'RULES_VERIFIED_CLIENT_V1' ? 'RULES_VERIFIED_CLIENT_V1' : 'CLIENT_MVP',
    uf_goal: value.uf_goal == null ? undefined : Number(value.uf_goal), notes: value.notes,
    nurse_uid: String(value.nurse_uid), nurse_name: String(value.nurse_name ?? ''), created_at: iso(value.created_at) ?? new Date().toISOString(),
  };
};

const sessionFromDoc = (snap: QueryDocumentSnapshot<DocumentData>): HDSession => sessionFromValue(snap.id, snap.data());

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

async function userProfile(firebaseUser: FirebaseUser, fallbackEmail = ''): Promise<User> {
  if (!db) throw new Error('Firestore belum tersedia.');
  const profile = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (!profile.exists()) throw new Error('Profil pengguna belum dibuat pada collection users.');
  const value = profile.data();
  if (value.is_active === false) throw new Error('Akun pengguna telah dinonaktifkan. Hubungi administrator unit.');
  const role = normalizeRole(value.role);
  if (!role) throw new Error('Role pengguna tidak valid.');
  return { uid: firebaseUser.uid, email: firebaseUser.email ?? fallbackEmail, displayName: String(value.displayName || firebaseUser.displayName || fallbackEmail), role, unit: String(value.unit || 'Hemodialisis') };
}

export async function signInWithFirebase(email: string, password: string): Promise<User> {
  if (!auth || !db) throw new Error('Firebase belum dikonfigurasi.');
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    try { return await userProfile(credential.user, email); }
    catch (error) { await signOut(auth); throw error; }
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

export async function restoreFirebaseSession(): Promise<User | null> {
  if (!auth || !db) return null;
  const current = await new Promise<FirebaseUser | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth!, (value) => { unsubscribe(); resolve(value); });
  });
  if (!current) return null;
  try { return await userProfile(current); }
  catch { await signOut(auth); return null; }
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
const withoutUndefined = <T extends object>(value: T): Partial<T> => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as Partial<T>;

export async function createPatientFirestore(input: PatientInput): Promise<Patient> {
  const { auth, db } = requireFirebase(); const rmKey = normalizeRM(input.rm);
  const currentUid = auth.currentUser!.uid;
  if (!rmKey) throw new Error('Nomor RM wajib diisi.');
  const patientRef = doc(collection(db, 'patients')); const keyRef = doc(db, 'patient_keys', rmKey); const now = new Date().toISOString();
  await runTransaction(db, async (transaction) => {
    if ((await transaction.get(keyRef)).exists()) throw new Error(`Nomor RM ${input.rm} sudah digunakan.`);
    transaction.set(keyRef, { patient_id: patientRef.id, rm: input.rm.trim(), created_at: serverTimestamp() });
    transaction.set(patientRef, { ...withoutUndefined(input), rm: input.rm.trim(), nama: input.nama.trim(), yellow_streak: 0, risk_level: 'low', is_active: true, current_dry_weight_version: 1, created_at: serverTimestamp(), created_by: currentUid, updated_at: serverTimestamp() });
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
    const previousWeight = Number(current.data().bb_kering);
    const previousVersion = Number(current.data().current_dry_weight_version ?? 1);
    transaction.update(patientRef, { ...withoutUndefined(input), rm: input.rm.trim(), nama: input.nama.trim(), current_dry_weight_version: input.bb_kering === previousWeight ? previousVersion : previousVersion + 1, updated_at: serverTimestamp() });
  });
}

export async function saveSessionFirestore(patient: Patient, form: SessionFormData, user: User): Promise<HDSession> {
  if (trustedBackendEnabled) {
    if (!functions) throw new Error('Trusted backend belum tersedia. Silakan login ulang.');
    try {
      const createSession = httpsCallable<{
        patientId: string;
        submissionId: string;
        preWeight: number;
        postWeight?: number;
        ufGoal?: number;
        notes?: string;
        shift: SessionFormData['shift'];
        interventions: string[];
      }, { session: DocumentData; idempotentReplay: boolean }>(functions, 'createClinicalSession');
      const payload = Object.fromEntries(Object.entries({
        patientId: patient.id,
        submissionId: form.submission_id,
        preWeight: form.pre_weight,
        postWeight: form.post_weight,
        ufGoal: form.uf_goal,
        notes: form.notes,
        shift: form.shift,
        interventions: form.interventions,
      }).filter(([, value]) => value !== undefined));
      const result = await createSession(payload as Parameters<typeof createSession>[0]);
      return sessionFromValue(String(result.data.session.id), result.data.session);
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'functions/unauthenticated') throw new Error('Sesi login berakhir. Silakan login kembali.');
        if (error.code === 'functions/permission-denied') throw new Error('Anda tidak memiliki izin input sesi.');
        if (error.code === 'functions/not-found') throw new Error('Pasien tidak ditemukan.');
        if (error.code === 'functions/failed-precondition' || error.code === 'functions/invalid-argument') throw new Error(error.message);
      }
      throw new Error('Sesi belum dapat disimpan oleh server. Coba kembali; ID pengiriman yang sama akan mencegah duplikasi.');
    }
  }
  const { db } = requireFirebase(); const patientRef = doc(db, 'patients', patient.id); const sessionRef = doc(db, 'patients', patient.id, 'sessions', form.submission_id);
  return runTransaction(db, async (transaction) => {
    const duplicate = await transaction.get(sessionRef);
    if (duplicate.exists()) return sessionFromValue(duplicate.id, duplicate.data());
    const current = await transaction.get(patientRef); if (!current.exists()) throw new Error('Pasien tidak ditemukan.');
    if (current.data().is_active === false) throw new Error('Pasien nonaktif tidak dapat memiliki sesi baru.');
    const dryWeight = Number(current.data().bb_kering); const dryWeightVersion = Number(current.data().current_dry_weight_version ?? 1);
    const idwgRaw = calculateIDWGRaw(form.pre_weight, dryWeight); const idwg = calculateIDWG(form.pre_weight, dryWeight); const zone = getZone(idwgRaw); const now = new Date().toISOString();
    const session: HDSession = { id: sessionRef.id, submission_id: form.submission_id, patient_id: patient.id, session_date: now, shift: form.shift, pre_weight: form.pre_weight, post_weight: form.post_weight, idwg_raw_pct: idwgRaw, idwg_pct: idwg, zone, dry_weight_used_kg: dryWeight, dry_weight_version: dryWeightVersion, formula_version: 'IDWG_V1', threshold_version: 'ZONE_2026_V1', protocol_version: 'HD_FLUID_V1', status: 'RECORDED', calculation_authority: 'RULES_VERIFIED_CLIENT_V1', interventions: form.interventions, uf_goal: form.uf_goal, notes: form.notes, nurse_uid: user.uid, nurse_name: user.displayName, created_at: now };
    const yellowStreak = zone === 'KUNING' ? Number(current.data().yellow_streak ?? 0) + 1 : 0;
    const storedSession = Object.fromEntries(Object.entries(session).filter(([, value]) => value !== undefined));
    transaction.set(sessionRef, { ...storedSession, session_date: serverTimestamp(), created_at: serverTimestamp() });
    transaction.update(patientRef, { latest_session_id: form.submission_id, latest_session_date: serverTimestamp(), latest_session_status: 'RECORDED', latest_pre_weight: form.pre_weight, latest_idwg_pct: idwg, latest_zone: zone, yellow_streak: yellowStreak, risk_level: zone === 'MERAH' ? 'high' : yellowStreak >= 3 ? 'medium' : 'low', updated_at: serverTimestamp() });
    if (yellowStreak === 3 || zone === 'MERAH') {
      const alertType = zone === 'MERAH' ? 'RECENT_RED' : 'YELLOW_STREAK_3';
      const alertRef = doc(db, 'alerts', `${form.submission_id}_${alertType}`); transaction.set(alertRef, { patient_id: patient.id, patient_name: String(current.data().nama), type: alertType, status: 'OPEN', severity: zone === 'MERAH' ? 'HIGH' : 'MEDIUM', trigger_session_id: form.submission_id, dedupe_key: `${form.submission_id}_${alertType}`, protocol_version: 'HD_FLUID_V1', triggered_at: serverTimestamp(), acknowledged: false, message: zone === 'MERAH' ? `${String(current.data().nama)} baru tercatat di Zona Merah (${idwg.toFixed(1)}%).` : `${String(current.data().nama)} berada di Zona Kuning selama 3 sesi berturut-turut.` });
    }
    transaction.set(doc(db, 'audit_logs', `session_${form.submission_id}`), { actor_uid: user.uid, actor_role: user.role, actor_unit: user.unit, action: 'CREATE_CLINICAL_SESSION', resource_path: sessionRef.path, request_id: form.submission_id, patient_id: patient.id, outcome: 'SUCCESS', clinical_result: { zone, idwg_pct: idwg }, created_at: serverTimestamp() });
    return session;
  });
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
  await setDoc(doc(db, 'users', profile.uid.trim()), { email: profile.email.trim(), displayName: profile.displayName.trim(), role: profile.role, unit: profile.unit || 'Hemodialisis', is_active: true, updated_at: serverTimestamp() }, { merge: true });
}
