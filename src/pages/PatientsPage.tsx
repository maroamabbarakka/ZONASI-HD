import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Patient } from '../types';
import ZoneBadge from '../components/ui/ZoneBadge';
import { Modal } from '../components/ui/Modal';
import { PatientDetail } from '../components/patient/PatientDetail';

export function PatientsPage() {
  const { data } = useApp(); const [query, setQuery] = useState(''); const [selected, setSelected] = useState<Patient | null>(null);
  const patients = useMemo(() => data.patients.filter((p) => `${p.nama} ${p.rm}`.toLowerCase().includes(query.toLowerCase())), [data.patients, query]);
  return <><header className="page-header"><div><span className="eyebrow">Master dan riwayat</span><h1>Daftar pasien</h1><p>Data pada prototype ini sepenuhnya dummy.</p></div></header><label className="search search-wide"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama atau nomor rekam medis…" /></label><div className="table-wrap panel"><table><thead><tr><th>Pasien</th><th>BB Kering</th><th>IDWG terakhir</th><th>Zona</th><th>Streak Kuning</th></tr></thead><tbody>{patients.map((patient) => <tr key={patient.id} className="clickable" onClick={() => setSelected(patient)}><td><strong>{patient.nama}</strong><small>{patient.rm}</small></td><td>{patient.bb_kering.toFixed(1)} kg</td><td>{patient.latest_idwg_pct?.toFixed(1) ?? '—'}%</td><td>{patient.latest_zone && <ZoneBadge zone={patient.latest_zone} size="sm" />}</td><td>{patient.yellow_streak}</td></tr>)}</tbody></table></div>{selected && <Modal title="Detail pasien & Kartu Kendali" onClose={() => setSelected(null)} wide><PatientDetail patient={selected} /></Modal>}</>;
}
