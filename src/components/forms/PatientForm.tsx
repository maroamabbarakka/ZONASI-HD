import { CalendarDays, FileText, Scale, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { Patient, PatientInput } from '../../types';

export function PatientForm({ patient, onSave, onCancel }: { patient?: Patient; onSave: (input: PatientInput) => Promise<void>; onCancel: () => void }) {
  const [values, setValues] = useState<PatientInput>({ rm: patient?.rm ?? '', nama: patient?.nama ?? '', tanggal_lahir: patient?.tanggal_lahir ?? '', jenis_kelamin: patient?.jenis_kelamin ?? 'L', bb_kering: patient?.bb_kering ?? 0, notes: patient?.notes ?? '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const change = <K extends keyof PatientInput>(key: K, value: PatientInput[K]) => setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!values.rm.trim() || !values.nama.trim() || !values.tanggal_lahir || values.bb_kering <= 0) {
      setError('Nomor RM, nama, tanggal lahir, dan BB Kering wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...values, rm: values.rm.trim(), nama: values.nama.trim(), notes: values.notes?.trim() });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Data pasien gagal disimpan.');
    } finally {
      setSaving(false);
    }
  };

  return <form onSubmit={submit} className="patient-form">
    <div className="patient-form-intro">
      <span><UserRound /></span>
      <div>
        <strong>{patient ? 'Perbarui identitas pasien' : 'Lengkapi identitas pasien baru'}</strong>
        <p>Gunakan nomor rekam medis yang benar karena menjadi pembeda utama pada data dan riwayat hemodialisis.</p>
      </div>
    </div>

    <div className="patient-form-grid">
      <label className="field field-rm">
        <span>Nomor Rekam Medis *</span>
        <input value={values.rm} onChange={(event) => change('rm', event.target.value.toUpperCase())} autoFocus placeholder="Contoh: DM-012" />
        <small>Wajib unik. Dapat menggunakan angka, huruf, atau tanda hubung.</small>
      </label>
      <label className="field field-name">
        <span>Nama lengkap *</span>
        <input value={values.nama} onChange={(event) => change('nama', event.target.value)} placeholder="Nama sesuai identitas pasien" />
      </label>
      <label className="field">
        <span><CalendarDays /> Tanggal lahir *</span>
        <input type="date" value={values.tanggal_lahir} onChange={(event) => change('tanggal_lahir', event.target.value)} />
      </label>
      <label className="field">
        <span><UserRound /> Jenis kelamin *</span>
        <select value={values.jenis_kelamin} onChange={(event) => change('jenis_kelamin', event.target.value as 'L' | 'P')}>
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </select>
      </label>
      <label className="field">
        <span><Scale /> BB Kering (kg) *</span>
        <input type="number" inputMode="decimal" min="20" max="250" step="0.1" value={values.bb_kering || ''} onChange={(event) => change('bb_kering', Number(event.target.value))} placeholder="Contoh: 55.5" />
        <small>Rentang aman input: 20–250 kg.</small>
      </label>
      <label className="field field-notes">
        <span><FileText /> Catatan</span>
        <textarea rows={4} value={values.notes} onChange={(event) => change('notes', event.target.value)} placeholder="Catatan singkat, misalnya kondisi akses vaskular atau informasi penting lain…" />
      </label>
    </div>

    {error && <div className="notice danger">{error}</div>}
    <div className="modal-actions">
      <button type="button" className="button secondary" onClick={onCancel}>Batal</button>
      <button className="button primary" disabled={saving}>{saving ? 'Menyimpan…' : patient ? 'Simpan perubahan' : 'Tambah pasien'}</button>
    </div>
  </form>;
}
