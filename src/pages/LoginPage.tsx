import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';

const firebaseEnabled = import.meta.env.VITE_FIREBASE_ENABLED === 'true';
const demoEnabled = import.meta.env.VITE_ALLOW_DEMO === 'true' || !firebaseEnabled;

const roles: Array<{ role: UserRole; title: string; description: string }> = [
  { role: 'PERAWAT', title: 'Perawat', description: 'Input sesi, edukasi, dan monitoring pasien' },
  { role: 'SUPERVISOR', title: 'Supervisor Klinis', description: 'Master pasien, protokol Merah, dan tindak lanjut alert' },
  { role: 'DOKTER', title: 'Dokter DPJP', description: 'Supervisi klinis, protokol, dan laporan' },
  { role: 'ADMIN', title: 'Administrator', description: 'Mengatur pengguna, data, dan laporan' },
];

export function LoginPage() {
  const { user, login, loginFirebase } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const submitFirebase = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginFirebase(identifier.trim(), password);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Gagal masuk. Periksa ID pengguna dan kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  return <main className="login-page"><section className="login-hero">
    <div className="brand-logo brand-logo-login" aria-label="ZONASI-HD — Smart Fluid Monitoring. Safe Heart."><img src="/logo-zonasi-hd-color.png" alt="Logo berwarna ZONASI-HD" /></div>
    <div><span className="eyebrow light">Unit Hemodialisis</span><h1>Risiko cairan terlihat.<br />Tindakan menjadi cepat.</h1><p>Pusat pantau visual untuk menghitung IDWG, melihat zona risiko, memberi peringatan dini, dan mendukung edukasi pasien.</p></div>
    <blockquote>“Cepat, Akurat, dan Selamat.”</blockquote>
  </section><section className="login-panel"><div className="login-box">
    <ShieldCheck className="login-icon" /><span className="eyebrow">{firebaseEnabled ? 'Akses petugas resmi' : 'Mode latihan lokal'}</span><h2>Masuk ke ZONASI-HD</h2>
    {firebaseEnabled && <form className="firebase-login" onSubmit={submitFirebase}><div className="login-method"><LockKeyhole /><div><strong>Akun petugas</strong><small>Gunakan ID pendek atau email yang diberikan admin</small></div></div><label className="field"><span>ID pengguna atau email</span><input type="text" value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" placeholder="contoh: perawat1" required /></label><label className="field"><span>Kata sandi</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" minLength={6} required /></label>{error && <div className="notice danger">{error}</div>}<button className="button primary" type="submit" disabled={loading}>{loading ? 'Memeriksa akses…' : 'Masuk'}</button></form>}
    {demoEnabled && <><div className="login-divider"><span>atau mode latihan</span></div><p>Pilih peran untuk latihan penggunaan aplikasi. Data latihan tidak dipakai untuk pelayanan nyata.</p><div className="role-grid">{roles.map((item) => <button key={item.role} onClick={() => login(item.role)}><strong>{item.title}</strong><span>{item.description}</span></button>)}</div></>}
    <div className="notice warning">{demoEnabled ? 'Mode latihan hanya untuk belajar. Jangan masukkan data pasien nyata.' : 'Gunakan akun petugas yang telah diberi akses oleh admin unit.'}</div>
  </div></section></main>;
}
