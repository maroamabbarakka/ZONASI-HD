import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Patient, SessionFormData, UserRole, Zone } from '../../types';
import { calculateIDWG, calculateIDWGRaw, getQuickRecommendations, getZone, getZoneDescription } from '../../utils/zonasiCalculator';
import ZoneBadge from '../ui/ZoneBadge';
import { ProtocolChecklist } from '../features/ProtocolChecklist';

const optionalWeight = z.number().min(20, 'Nilai terlalu rendah').max(250, 'Nilai terlalu tinggi').optional();
const optionalUfGoal = z.number().min(0, 'Tidak boleh negatif').max(20, 'Maksimal 20 liter').optional();
const schema = z.object({
  pre_weight: z.number({ error: 'BB Pre-HD wajib diisi' }).positive().min(20, 'Nilai terlalu rendah').max(250, 'Nilai terlalu tinggi'),
  post_weight: optionalWeight,
  uf_goal: optionalUfGoal,
  notes: z.string().max(500, 'Maksimal 500 karakter').optional(),
  shift: z.enum(['Pagi', 'Siang', 'Sore', 'Malam']),
});
type Values = z.infer<typeof schema>;

export function SessionInputForm({ patient, role, onSave, onCancel }: { patient: Patient; role: UserRole; onSave: (data: SessionFormData) => Promise<void> | void; onCancel: () => void }) {
  const submissionId = useRef(crypto.randomUUID());
  const [interventions, setInterventions] = useState<string[]>([]);
  const [saveError, setSaveError] = useState('');
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema), defaultValues: { pre_weight: patient.latest_pre_weight ?? patient.bb_kering + 1.5, shift: 'Pagi', notes: '' },
  });
  const preWeight = watch('pre_weight');
  const calculation = useMemo(() => {
    try {
      const idwg = calculateIDWG(preWeight, patient.bb_kering);
      return { idwg, zone: getZone(calculateIDWGRaw(preWeight, patient.bb_kering)) };
    } catch { return null; }
  }, [preWeight, patient.bb_kering]);
  const submit = async (values: Values) => { setSaveError(''); try { await onSave({ ...values, interventions, submission_id: submissionId.current }); } catch (error) { setSaveError(error instanceof Error ? error.message : 'Sesi gagal disimpan.'); } };
  return (
    <form onSubmit={handleSubmit(submit)} className="session-form">
      <div className="patient-summary"><div><span className="eyebrow">Pasien terpilih</span><h2>{patient.nama}</h2><p>{patient.rm}</p></div><div><span className="eyebrow">BB Kering</span><strong>{patient.bb_kering.toFixed(1)} kg</strong></div></div>
      <div className="form-grid">
        <label className="field prominent"><span>Berat Badan Pre-HD (kg)</span><input type="number" step="0.1" autoFocus {...register('pre_weight', { valueAsNumber: true })} />{errors.pre_weight && <small className="error">{errors.pre_weight.message}</small>}</label>
        <label className="field"><span>Shift</span><select {...register('shift')}><option>Pagi</option><option>Siang</option><option>Sore</option><option>Malam</option></select></label>
        <label className="field"><span>BB Post-HD (opsional)</span><input type="number" step="0.1" {...register('post_weight', { setValueAs: (value) => value === '' ? undefined : Number(value) })} /></label>
        <label className="field"><span>Target UF (L, opsional)</span><input type="number" step="0.1" {...register('uf_goal', { setValueAs: (value) => value === '' ? undefined : Number(value) })} /></label>
      </div>
      {calculation && <div className={`live-result panel-${calculation.zone.toLowerCase()}`}>
        <div><span className="eyebrow">IDWG terhitung otomatis</span><div className="idwg-number">{calculation.idwg.toFixed(1)}<small>%</small></div></div>
        <ZoneBadge zone={calculation.zone} size="xl" />
        <p>{getZoneDescription(calculation.zone)}</p>
        {preWeight < patient.bb_kering && <div className="notice warning">BB Pre-HD lebih rendah dari BB Kering. Verifikasi hasil penimbangan dan target BB Kering sebelum menyimpan.</div>}
        <ul>{getQuickRecommendations(calculation.zone, role).map((item) => <li key={item}>{item}</li>)}</ul>
      </div>}
      {calculation && <ProtocolChecklist zone={calculation.zone as Zone} role={role} selected={interventions} onChange={setInterventions} />}
      <label className="field"><span>Catatan perawat</span><textarea rows={3} placeholder="Kondisi klinis atau edukasi yang diberikan…" {...register('notes')} />{errors.notes && <small className="error">{errors.notes.message}</small>}</label>
      {saveError && <div className="notice danger">{saveError}</div>}<div className="modal-actions"><button type="button" className="button secondary" onClick={onCancel}>Batal</button><button type="submit" className="button primary" disabled={!calculation || isSubmitting}>Simpan sesi &amp; perbarui zona</button></div>
    </form>
  );
}
