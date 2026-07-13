import { useState, type FormEvent } from 'react';
import type { Patient, PatientInput } from '../../types';

export function PatientForm({ patient, onSave, onCancel }: { patient?: Patient; onSave: (input: PatientInput) => Promise<void>; onCancel: () => void }) {
  const [values, setValues] = useState<PatientInput>({ rm: patient?.rm ?? '', nama: patient?.nama ?? '', tanggal_lahir: patient?.tanggal_lahir ?? '', jenis_kelamin: patient?.jenis_kelamin ?? 'L', bb_kering: patient?.bb_kering ?? 0, notes: patient?.notes ?? '' });
  const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const change = <K extends keyof PatientInput>(key: K, value: PatientInput[K]) => setValues((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    if (!values.rm.trim() || !values.nama.trim() || !values.tanggal_lahir || values.bb_kering <= 0) { setError('RM, nama, tanggal lahir, dan BB Kering wajib diisi.'); return; }
    setSaving(true); try { await onSave(values); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Data pasien gagal disimpan.'); } finally { setSaving(false); }
  };
  return <form onSubmit={submit} className="session-form"><div className="form-grid">
    <label className="field"><span>Nomor Rekam Medis *</span><input value={values.rm} onChange={(e) => change('rm', e.target.value)} autoFocus placeholder="Contoh: 00123456" /></label>
    <label className="field"><span>Nama lengkap *</span><input value={values.nama} onChange={(e) => change('nama', e.target.value)} /></label>
    <label className="field"><span>Tanggal lahir *</span><input type="date" value={values.tanggal_lahir} onChange={(e) => change('tanggal_lahir', e.target.value)} /></label>
    <label className="field"><span>Jenis kelamin *</span><select value={values.jenis_kelamin} onChange={(e) => change('jenis_kelamin', e.target.value as 'L' | 'P')}><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></label>
    <label className="field"><span>BB Kering (kg) *</span><input type="number" min="20" max="250" step="0.1" value={values.bb_kering || ''} onChange={(e) => change('bb_kering', Number(e.target.value))} /></label>
  </div><label className="field"><span>Catatan</span><textarea rows={3} value={values.notes} onChange={(e) => change('notes', e.target.value)} /></label>
    {error && <div className="notice danger">{error}</div>}<div className="modal-actions"><button type="button" className="button secondary" onClick={onCancel}>Batal</button><button className="button primary" disabled={saving}>{saving ? 'Menyimpan…' : patient ? 'Simpan perubahan' : 'Tambah pasien'}</button></div>
  </form>;
}
