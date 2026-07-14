import { Activity, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';

const firebaseEnabled = import.meta.env.VITE_FIREBASE_ENABLED === 'true';
const demoEnabled = import.meta.env.VITE_ALLOW_DEMO === 'true' || !firebaseEnabled;

const roles: Array<{ role: UserRole; title: string; description: string }> = [
  { role: 'PERAWAT', title: 'Perawat Pelaksana', description: 'Input sesi, edukasi, dan monitoring pasien' },
  { role: 'SUPERVISOR', title: 'Perawat Mahir', description: 'Master pasien, protokol Merah, dan tindak lanjut alert' },
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

  return <main className="login-page">
    <section className="login-hero">
      <div className="brand-logo brand-logo-login" aria-label="ZONASI-HD — Smart Fluid Monitoring. Safe Heart.">
        <img src="/logo-zonasi-hd-color.png" alt="Logo berwarna ZONASI-HD" />
      </div>
      <div className="login-hero-copy">
        <span className="eyebrow light">Unit Hemodialisis</span>
        <h1>Risiko cairan terlihat. Tindakan menjadi cepat.</h1>
        <p>Pusat pantau visual untuk menghitung IDWG, melihat zona risiko, memberi peringatan dini, dan mendukung edukasi pasien.</p>
      </div>
      <div className="login-hero-metrics" aria-label="Fitur utama ZONASI-HD">
        <span><Activity /> Pantau IDWG</span>
        <span><ShieldCheck /> Zona risiko</span>
        <span><Sparkles /> Edukasi pasien</span>
      </div>
      <blockquote>“Cepat, Akurat, dan Selamat.”</blockquote>
    </section>

    <section className="login-panel">
      <div className="login-box">
        <div className="login-heading">
          <span className="login-icon"><ShieldCheck /></span>
          <span className="eyebrow">{firebaseEnabled ? 'Akses petugas resmi' : 'Mode latihan lokal'}</span>
          <h2>Masuk ke ZONASI-HD</h2>
          <p>Gunakan akun petugas yang telah diberi akses oleh administrator unit.</p>
        </div>

        {firebaseEnabled && <form className="firebase-login" onSubmit={submitFirebase}>
          <div className="login-method"><LockKeyhole /><div><strong>Akun petugas</strong><small>ID pendek atau email resmi unit</small></div></div>
          <label className="field"><span>ID pengguna atau email</span><input type="text" value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" placeholder="contoh: perawat1" required /></label>
          <label className="field"><span>Kata sandi</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" minLength={6} placeholder="Masukkan kata sandi" required /></label>
          {error && <div className="notice danger">{error}</div>}
          <button className="button primary" type="submit" disabled={loading}>{loading ? 'Memeriksa akses…' : 'Masuk'}</button>
        </form>}

        {demoEnabled && <>
          <div className="login-divider"><span>atau mode latihan</span></div>
          <p>Pilih peran untuk latihan penggunaan aplikasi. Data latihan tidak dipakai untuk pelayanan nyata.</p>
          <div className="role-grid">{roles.map((item) => <button key={item.role} onClick={() => login(item.role)}><strong>{item.title}</strong><span>{item.description}</span></button>)}</div>
        </>}
        <div className="notice warning">{demoEnabled ? 'Mode latihan hanya untuk belajar. Jangan masukkan data pasien nyata.' : 'Gunakan akun petugas yang telah diberi akses oleh admin unit.'}</div>
      </div>
    </section>
  </main>;
}
