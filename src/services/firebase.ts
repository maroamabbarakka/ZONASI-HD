import { initializeApp, type FirebaseApp } from 'firebase/app';
import { FirebaseError } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, type Auth } from 'firebase/auth';
import { doc, getDoc, initializeFirestore, memoryLocalCache, type Firestore } from 'firebase/firestore';
import type { User, UserRole } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseEnabled = import.meta.env.VITE_FIREBASE_ENABLED === 'true'
  && Object.values(firebaseConfig).every(Boolean);

export let firebaseApp: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;

if (firebaseEnabled) {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  db = initializeFirestore(firebaseApp, {
    localCache: memoryLocalCache(),
  });
}

const allowedRoles: UserRole[] = ['PK_II', 'PK_III', 'DOKTER', 'ADMIN'];

export async function signInWithFirebase(email: string, password: string): Promise<User> {
  if (!auth || !db) throw new Error('Firebase belum dikonfigurasi.');
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getDoc(doc(db, 'users', credential.user.uid));
    if (!profile.exists()) {
      await signOut(auth);
      throw new Error('Profil pengguna belum dibuat pada collection users.');
    }
    const value = profile.data();
    if (!allowedRoles.includes(value.role as UserRole)) {
      await signOut(auth);
      throw new Error('Role pengguna tidak valid.');
    }
    return {
      uid: credential.user.uid,
      email: credential.user.email ?? email,
      displayName: String(value.displayName || credential.user.displayName || email),
      role: value.role as UserRole,
      unit: String(value.unit || 'Hemodialisis'),
    };
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

export async function signOutFirebase(): Promise<void> {
  if (auth?.currentUser) await signOut(auth);
}
