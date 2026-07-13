import { Plus, Save, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { buildFirebaseAuthEmail } from '../lib/authIdentifier';
import { roleLabels } from '../lib/permissions';
import type { User, UserRole } from '../types';

const usernameDomain = import.meta.env.VITE_AUTH_USERNAME_DOMAIN ?? 'zonasi-hd.local';
const emptyUser: User = { uid: '', email: '', username: '', displayName: '', role: 'PERAWAT', unit: 'Hemodialisis' };

function editableProfile(user: User): User {
  return { ...user, username: user.username ?? '', email: user.email ?? '', unit: user.unit || 'Hemodialisis' };
}

export function UsersPage() {
  const { user, dataMode, updateOwnProfile } = useApp();
  const isAdmin = user?.role === 'ADMIN';
  const [users, setUsers] = useState<User[]>([]);
  const [draft, setDraft] = useState<User>(() => user ? editableProfile(user) : emptyUser);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) setDraft(editableProfile(user));
  }, [isAdmin, user]);

  useEffect(() => {
    if (dataMode !== 'firebase' || !isAdmin) return;
    let unsubscribe: (() => void) | undefined;
    void import('../services/firebase').then(({ subscribeUserProfiles }) => { unsubscribe = subscribeUserProfiles(setUsers, setError); });
    return () => unsubscribe?.();
  }, [dataMode, isAdmin]);

  if (!user) return null;

  const save = async () => {
    if (!draft.displayName.trim()) {
      setError('Nama wajib diisi.');
      return;
    }
    if (isAdmin && !draft.uid.trim()) {
      setError('Kode akun wajib diisi untuk pengelolaan pengguna.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (isAdmin && draft.uid !== user.uid) {
        const { saveUserProfile } = await import('../services/firebase');
        await saveUserProfile(draft);
        setDraft(emptyUser);
      } else {
        await updateOwnProfile({
          displayName: draft.displayName,
          email: draft.email,
          username: draft.username,
          unit: draft.unit,
        });
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Profil gagal disimpan.');
    } finally {
      setSaving(false);
    }
  };

  const authEmailPreview = draft.username ? buildFirebaseAuthEmail(draft.username, usernameDomain) : '';

  return <>
    <header className="page-header">
      <div>
        <span className="eyebrow">{isAdmin ? 'Kelola akses petugas' : 'Profil akun'}</span>
        <h1>{isAdmin ? 'Pengguna dan akses' : 'Akun saya'}</h1>
        <p>{isAdmin ? 'Admin dapat membuat profil, mengatur jenis akses, dan membantu sinkronisasi ID pengguna.' : 'Ubah data profil sendiri. Jenis akses hanya dapat diubah oleh Administrator.'}</p>
      </div>
      {isAdmin && <button className="button primary" onClick={() => setDraft(emptyUser)}><Plus /> Profil baru</button>}
    </header>
    {dataMode !== 'firebase' && <div className="notice warning">Masuk menggunakan akun petugas resmi untuk mengelola profil.</div>}
    {error && <div className="notice danger">{error}</div>}
    <section className="user-admin-grid">
      {isAdmin && <div className="panel">
        <div className="section-heading"><h2><Users /> Daftar pengguna</h2></div>
        <div className="user-profile-list">{users.map((profile) => <button key={profile.uid} onClick={() => setDraft(editableProfile(profile))}><span><strong>{profile.displayName || 'Tanpa nama'}</strong><small>{profile.username ? `@${profile.username}` : profile.email || profile.uid}</small></span><b>{roleLabels[profile.role]}</b></button>)}</div>
      </div>}
      <div className="panel">
        <div className="section-heading"><h2>{isAdmin ? draft.uid ? 'Edit profil' : 'Profil baru' : 'Data akun saya'}</h2></div>
        <label className="field"><span>Kode akun *</span><input value={draft.uid} disabled={!isAdmin || users.some((item) => item.uid === draft.uid)} onChange={(e) => setDraft({ ...draft, uid: e.target.value })} /></label>
        <label className="field"><span>ID pengguna</span><input value={draft.username ?? ''} onChange={(e) => setDraft({ ...draft, username: e.target.value.toLowerCase().replace(/\s/g, '') })} placeholder="contoh: perawat1" /></label>
        {authEmailPreview && <div className="notice warning">ID ini terhubung dengan alamat masuk <code>{authEmailPreview}</code>. Jika ID berubah, admin perlu menyesuaikan akun masuknya juga.</div>}
        <label className="field"><span>Nama *</span><input value={draft.displayName} onChange={(e) => setDraft({ ...draft, displayName: e.target.value })} /></label>
        <label className="field"><span>Email akun</span><input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder={authEmailPreview || 'nama@domain'} /></label>
        <label className="field"><span>Unit</span><input value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} /></label>
        <label className="field"><span>Jenis akses</span><select value={draft.role} disabled={!isAdmin} onChange={(e) => setDraft({ ...draft, role: e.target.value as UserRole })}>{(Object.keys(roleLabels) as UserRole[]).map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></label>
        <button className="button primary" disabled={saving || dataMode !== 'firebase'} onClick={save}><Save />{saving ? 'Menyimpan…' : 'Simpan profil'}</button>
      </div>
    </section>
  </>;
}
