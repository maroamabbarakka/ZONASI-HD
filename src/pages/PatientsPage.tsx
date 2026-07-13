import { FileUp, Pencil, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PatientImport } from '../components/forms/PatientImport';
import { PatientForm } from '../components/forms/PatientForm';
import { PatientDetail } from '../components/patient/PatientDetail';
import { Modal } from '../components/ui/Modal';
import ZoneBadge from '../components/ui/ZoneBadge';
import { useApp } from '../context/AppContext';
import { canImportPatients, canManagePatients } from '../lib/permissions';
import type { Patient } from '../types';

export function PatientsPage() {
  const { data, user, dataMode, dataError, createPatient, updatePatient, importPatients } = useApp();
  const [query, setQuery] = useState(''); const [selected, setSelected] = useState<Patient | null>(null); const [editing, setEditing] = useState<Patient | 'new' | null>(null); const [importing, setImporting] = useState(false);
  const patients = useMemo(() => data.patients.filter((patient) => `${patient.nama} ${patient.rm}`.toLowerCase().includes(query.toLowerCase())), [data.patients, query]);
  return <><header className="page-header"><div><span className="eyebrow">Data pasien dan riwayat · {dataMode === 'firebase' ? 'Tersambung' : 'Latihan lokal'}</span><h1>Daftar pasien</h1><p>Nomor RM menjadi pembeda utama; pasien dengan nama sama tetap dapat dicatat sebagai orang berbeda.</p></div><div className="header-actions">{canImportPatients(user?.role) && <button className="button secondary" onClick={() => setImporting(true)}><FileUp /> Impor Excel</button>}{canManagePatients(user?.role) && <button className="button primary" onClick={() => setEditing('new')}><Plus /> Tambah pasien</button>}</div></header>
    {dataError && <div className="notice danger">Data pusat: {dataError}</div>}
    <label className="search search-wide"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau nomor rekam medis…" /></label>
    <div className="table-wrap panel"><table><thead><tr><th>Pasien</th><th>BB Kering</th><th>IDWG terakhir</th><th>Zona</th><th>Kuning beruntun</th>{canManagePatients(user?.role) && <th>Aksi</th>}</tr></thead><tbody>{patients.map((patient) => <tr key={patient.id} className="clickable" onClick={() => setSelected(patient)}><td><strong>{patient.nama}</strong><small>{patient.rm}</small></td><td>{patient.bb_kering.toFixed(1)} kg</td><td>{patient.latest_idwg_pct?.toFixed(1) ?? '—'}%</td><td>{patient.latest_zone && <ZoneBadge zone={patient.latest_zone} size="sm" />}</td><td>{patient.yellow_streak}</td>{canManagePatients(user?.role) && <td><button className="icon-button" aria-label={`Edit ${patient.nama}`} onClick={(event) => { event.stopPropagation(); setEditing(patient); }}><Pencil /></button></td>}</tr>)}</tbody></table></div>
    {selected && <Modal title="Detail pasien & Kartu Kendali" onClose={() => setSelected(null)} wide><PatientDetail patient={selected} /></Modal>}
    {editing && <Modal title={editing === 'new' ? 'Tambah pasien' : 'Edit pasien'} onClose={() => setEditing(null)}><PatientForm patient={editing === 'new' ? undefined : editing} onCancel={() => setEditing(null)} onSave={async (input) => { if (editing === 'new') await createPatient(input); else await updatePatient(editing.id, input); setEditing(null); }} /></Modal>}
    {importing && <Modal title="Impor banyak pasien dari Excel" onClose={() => setImporting(false)} wide><PatientImport existingRms={data.patients.map((patient) => patient.rm)} onImport={importPatients} onDone={() => setImporting(false)} /></Modal>}
  </>;
}
