import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';

const firebaseEnabled = import.meta.env.VITE_FIREBASE_ENABLED === 'true';

const roles: Array<{ role: UserRole; title: string; description: string }> = [
  { role: 'PERAWAT', title: 'Perawat', description: 'Input sesi, edukasi, dan monitoring pasien' },
  { role: 'SUPERVISOR', title: 'Supervisor Klinis', description: 'Master pasien, protokol Merah, dan tindak lanjut alert' },
  { role: 'DOKTER', title: 'Dokter DPJP', description: 'Supervisi klinis, protokol, dan laporan' },
  { role: 'ADMIN', title: 'Administrator', description: 'Akses demo untuk konfigurasi dan laporan' },
];

export function LoginPage() {
  const { user, login, loginFirebase } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const submitFirebase = async (event: FormEvent) => {
    event.preventDefault();
    setError(''); setLoading(true);
    try { await loginFirebase(email.trim(), password); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Login Firebase gagal.'); }
    finally { setLoading(false); }
  };

  return <main className="login-page"><section className="login-hero">
    <div className="brand-logo brand-logo-login" aria-label="ZONASI-HD — Smart Fluid Monitoring. Safe Heart."><img src="/logo-zonasi-hd-white.png" alt="Logo ZONASI-HD" /></div>
    <div><span className="eyebrow light">Unit Hemodialisis</span><h1>Risiko cairan terlihat.<br />Tindakan menjadi cepat.</h1><p>Command Center visual untuk kalkulasi IDWG, triase warna, Early Warning, dan edukasi pasien.</p></div>
    <blockquote>“Cepat, Akurat, dan Selamat.”</blockquote>
  </section><section className="login-panel"><div className="login-box">
    <ShieldCheck className="login-icon" /><span className="eyebrow">Firebase terhubung · Mode data dummy</span><h2>Masuk ke ZONASI-HD</h2>
    {firebaseEnabled && <form className="firebase-login" onSubmit={submitFirebase}><div className="login-method"><LockKeyhole /><div><strong>Akun petugas Firebase</strong><small>Email/Password dan role Firestore</small></div></div><label className="field"><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required /></label><label className="field"><span>Kata sandi</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" minLength={6} required /></label>{error && <div className="notice danger">{error}</div>}<button className="button primary" type="submit" disabled={loading}>{loading ? 'Memverifikasi…' : 'Masuk dengan Firebase'}</button></form>}
    <div className="login-divider"><span>atau coba role demo</span></div><p>Pilih peran untuk menguji batas akses. Seluruh nama dan nomor RM di aplikasi adalah data dummy.</p>
    <div className="role-grid">{roles.map((item) => <button key={item.role} onClick={() => login(item.role)}><strong>{item.title}</strong><span>{item.description}</span></button>)}</div>
    <div className="notice warning">Firebase Auth sudah terhubung, tetapi data pasien masih memakai penyimpanan demo lokal. Jangan masukkan data pasien nyata.</div>
  </div></section></main>;
}
