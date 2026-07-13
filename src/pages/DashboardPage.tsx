import { AlertTriangle, BellRing, Check, Droplets, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Patient } from '../types';
import { PatientZoneCard } from '../components/dashboard/PatientZoneCard';
import { Modal } from '../components/ui/Modal';
import { SessionInputForm } from '../components/forms/SessionInputForm';
import { PatientDetail } from '../components/patient/PatientDetail';
import { canHandleAlerts, canInputSession } from '../lib/permissions';

export function DashboardPage() {
  const { data, user, saveSession, acknowledgeAlert } = useApp();
  const [selected, setSelected] = useState<Patient | null>(null);
  const [inspected, setInspected] = useState<Patient | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [chooseQuery, setChooseQuery] = useState('');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const active = data.patients.filter((patient) => patient.is_active);
  const visible = useMemo(() => active.filter((patient) => `${patient.nama} ${patient.rm}`.toLowerCase().includes(query.toLowerCase())), [active, query]);
  const counts = { HIJAU: active.filter((p) => p.latest_zone === 'HIJAU').length, KUNING: active.filter((p) => p.latest_zone === 'KUNING').length, MERAH: active.filter((p) => p.latest_zone === 'MERAH').length };
  const openAlerts = data.alerts.filter((alert) => !alert.acknowledged);
  const canInput = canInputSession(user?.role);
  const now = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  return <>
    <header className="page-header"><div><span className="eyebrow">Command Center · {now}</span><h1>Situasi pasien terkini</h1><p>Prioritaskan Kuning dan Merah, lalu tindak lanjuti Early Warning.</p></div>{canInput && <button className="button primary" onClick={() => setChoosing(true)}><Plus /> Input sesi baru</button>}</header>
    {toast && <div className="toast"><Check />{toast}<button onClick={() => setToast('')}>×</button></div>}
    {openAlerts.length > 0 && <section className="alert-stack"><div className="section-heading"><div><span className="eyebrow"><BellRing /> Early Warning</span><h2>{openAlerts.length} pasien memerlukan perhatian</h2></div></div>{openAlerts.map((alert) => <div className={`alert-item ${alert.type === 'RECENT_RED' ? 'urgent' : ''}`} key={alert.id}><AlertTriangle /><div><strong>{alert.patient_name}</strong><p>{alert.message}</p></div>{canHandleAlerts(user?.role) && <button className="button small secondary" onClick={() => void acknowledgeAlert(alert.id)}>Tandai ditindaklanjuti</button>}</div>)}</section>}
    <section className="stats-grid">
      <div className="stat-card neutral"><Droplets /><div><span>Pasien aktif</span><strong>{active.length}</strong><small>Status terbaru seluruh pasien</small></div></div>
      <div className="stat-card green"><span className="stat-dot" /><div><span>Zona Hijau</span><strong>{counts.HIJAU}</strong><small>{active.length ? Math.round(counts.HIJAU / active.length * 100) : 0}% dari pasien aktif</small></div></div>
      <div className="stat-card yellow"><span className="stat-dot" /><div><span>Zona Kuning</span><strong>{counts.KUNING}</strong><small>Perlu monitoring lebih ketat</small></div></div>
      <div className="stat-card red"><span className="stat-dot" /><div><span>Zona Merah</span><strong>{counts.MERAH}</strong><small>Perlu asesmen dan eskalasi</small></div></div>
    </section>
    <section><div className="section-heading"><div><span className="eyebrow">Peta risiko visual</span><h2>Seluruh pasien aktif</h2></div><label className="search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau RM…" /></label></div><div className="patient-grid">{visible.map((patient) => <PatientZoneCard key={patient.id} patient={patient} onClick={() => canInput ? setSelected(patient) : setInspected(patient)} />)}</div></section>
    {choosing && <Modal title="Pilih pasien untuk sesi baru" onClose={() => setChoosing(false)}><label className="search search-picker"><Search /><input autoFocus value={chooseQuery} onChange={(event) => setChooseQuery(event.target.value)} placeholder="Cari nama atau RM…" /></label><div className="patient-picker">{active.filter((patient) => `${patient.nama} ${patient.rm}`.toLowerCase().includes(chooseQuery.toLowerCase())).map((patient) => <button key={patient.id} onClick={() => { setChoosing(false); setSelected(patient); }}><span><strong>{patient.nama}</strong><small>{patient.rm} · BB Kering {patient.bb_kering.toFixed(1)} kg</small></span><b>{patient.latest_idwg_pct?.toFixed(1) ?? '—'}%</b></button>)}</div></Modal>}
    {selected && <Modal title="Input sesi hemodialisis" onClose={() => setSelected(null)} wide><SessionInputForm patient={data.patients.find((p) => p.id === selected.id) ?? selected} role={user!.role} onCancel={() => setSelected(null)} onSave={async (form) => { const result = await saveSession(selected, form); setSelected(null); setToast(`Sesi ${selected.nama} tersimpan: ${result.idwg_pct.toFixed(1)}% · Zona ${result.zone}`); }} /></Modal>}
    {inspected && <Modal title="Detail pasien & Kartu Kendali" onClose={() => setInspected(null)} wide><PatientDetail patient={inspected} /></Modal>}
  </>;
}
