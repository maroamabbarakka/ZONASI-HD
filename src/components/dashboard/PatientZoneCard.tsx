import { Clock3 } from 'lucide-react';
import type { Patient } from '../../types';
import ZoneBadge from '../ui/ZoneBadge';

export function PatientZoneCard({ patient, onClick }: { patient: Patient; onClick: () => void }) {
  const zone = patient.latest_zone ?? 'HIJAU';
  return <button className={`patient-zone-card card-${zone.toLowerCase()}`} onClick={onClick}>
    <div className="patient-card-top"><div><strong>{patient.nama}</strong><span>{patient.rm}</span></div><ZoneBadge zone={zone} size="sm" /></div>
    <div className="patient-idwg"><b>{patient.latest_idwg_pct?.toFixed(1) ?? '—'}<small>%</small></b><span>IDWG terakhir</span></div>
    <div className="patient-card-bottom"><span><Clock3 />{patient.latest_session_date ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(patient.latest_session_date)) : 'Belum ada sesi'}</span>{patient.yellow_streak >= 3 && <em>{patient.yellow_streak}× Kuning</em>}</div>
  </button>;
}
