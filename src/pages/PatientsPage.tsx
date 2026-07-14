import { Download, FileUp, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PatientImport } from '../components/forms/PatientImport';
import { PatientForm } from '../components/forms/PatientForm';
import { PatientDetail } from '../components/patient/PatientDetail';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import ZoneBadge from '../components/ui/ZoneBadge';
import { useApp } from '../context/AppContext';
import { canImportPatients, canManagePatients } from '../lib/permissions';
import type { Patient } from '../types';
import { downloadPatientTemplate } from '../utils/patientTemplate';

export function PatientsPage() {
  const { data, user, dataMode, dataError, createPatient, updatePatient, deletePatients, importPatients } = useApp();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Patient | null>(null);
  const [editing, setEditing] = useState<Patient | 'new' | null>(null);
  const [importing, setImporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string[] | null>(null);
  const canManage = canManagePatients(user?.role);
  const canImport = canImportPatients(user?.role);
  const patients = useMemo(() => data.patients.filter((patient) => `${patient.nama} ${patient.rm}`.toLowerCase().includes(query.toLowerCase())), [data.patients, query]);

  const toggleSelected = (patientId: string) => {
    setSelectedIds((current) => current.includes(patientId) ? current.filter((id) => id !== patientId) : [...current, patientId]);
  };

  const askDelete = (patientId?: string) => {
    const idsToDelete = patientId ? [patientId] : selectedIds;
    if (idsToDelete.length) setDeleteTarget(idsToDelete);
  };

  const confirmDelete = async () => {
    const idsToDelete = deleteTarget ?? [];
    if (!idsToDelete.length) return;
    await deletePatients(idsToDelete);
    setSelectedIds([]);
    setSelected(null);
    setDeleteTarget(null);
  };

  return <>
    <header className="page-header patient-page-header">
      <div>
        <span className="eyebrow">Data pasien dan riwayat · {dataMode === 'firebase' ? 'Tersambung' : 'Latihan lokal'}</span>
        <h1>Daftar pasien</h1>
        <p>Nomor RM menjadi pembeda utama; pasien dengan nama sama tetap dapat dicatat sebagai orang berbeda.</p>
      </div>
      <div className="header-actions patient-header-actions">
        {canImport && <button className="button secondary" onClick={downloadPatientTemplate}><Download /> Template Excel</button>}
        {canImport && <button className="button secondary" onClick={() => setImporting(true)}><FileUp /> Impor Excel</button>}
        {canManage && <button className="button primary" onClick={() => setEditing('new')}><Plus /> Tambah pasien</button>}
      </div>
    </header>

    {dataError && <div className="notice danger">Data pusat: {dataError}</div>}
    <label className="search search-wide"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau nomor rekam medis…" /></label>

    {canManage && selectedIds.length > 0 && <div className="selection-toolbar panel">
      <span>{selectedIds.length} pasien dipilih</span>
      <button className="button danger" onClick={() => askDelete()}><Trash2 /> Hapus terpilih</button>
    </div>}

    <div className="table-wrap panel">
      <table>
        <thead>
          <tr>
            {canManage && <th style={{ width: '2.5rem' }}><input type="checkbox" checked={patients.length > 0 && patients.every((patient) => selectedIds.includes(patient.id))} onChange={(event) => {
              if (event.target.checked) setSelectedIds([...new Set([...selectedIds, ...patients.map((patient) => patient.id)])]);
              else setSelectedIds((current) => current.filter((id) => !patients.some((patient) => patient.id === id)));
            }} /></th>}
            <th>Pasien</th><th>BB Kering</th><th>IDWG terakhir</th><th>Zona</th><th>Kuning beruntun</th>{canManage && <th>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => <tr key={patient.id} className="clickable" onClick={() => setSelected(patient)}>
            {canManage && <td><input type="checkbox" checked={selectedIds.includes(patient.id)} onChange={(event) => { event.stopPropagation(); toggleSelected(patient.id); }} /></td>}
            <td><strong>{patient.nama}</strong><small>{patient.rm}</small></td>
            <td>{patient.bb_kering.toFixed(1)} kg</td>
            <td>{patient.latest_idwg_pct?.toFixed(1) ?? '—'}%</td>
            <td>{patient.latest_zone && <ZoneBadge zone={patient.latest_zone} size="sm" />}</td>
            <td>{patient.yellow_streak}</td>
            {canManage && <td><div className="table-actions">
              <button className="icon-button" aria-label={`Edit ${patient.nama}`} onClick={(event) => { event.stopPropagation(); setEditing(patient); }}><Pencil /></button>
              <button className="icon-button danger" aria-label={`Hapus ${patient.nama}`} onClick={(event) => { event.stopPropagation(); askDelete(patient.id); }}><Trash2 /></button>
            </div></td>}
          </tr>)}
        </tbody>
      </table>
    </div>

    {selected && <Modal title="Detail pasien & Kartu Kendali" onClose={() => setSelected(null)} wide><PatientDetail patient={selected} /></Modal>}
    {editing && <Modal title={editing === 'new' ? 'Tambah pasien' : 'Edit pasien'} onClose={() => setEditing(null)}><PatientForm patient={editing === 'new' ? undefined : editing} onCancel={() => setEditing(null)} onSave={async (input) => { if (editing === 'new') await createPatient(input); else await updatePatient(editing.id, input); setEditing(null); }} /></Modal>}
    {importing && <Modal title="Impor banyak pasien dari Excel" onClose={() => setImporting(false)} wide><PatientImport existingRms={data.patients.map((patient) => patient.rm)} onImport={importPatients} onDone={() => setImporting(false)} /></Modal>}
    {deleteTarget && <ConfirmDialog title="Konfirmasi hapus pasien" message={`Data ${deleteTarget.length > 1 ? `${deleteTarget.length} pasien yang dipilih` : 'pasien ini'} akan dihapus dari daftar dan riwayat terkait. Tindakan ini tidak dapat dibatalkan.`} confirmLabel="Hapus data" cancelLabel="Batal" danger onCancel={() => setDeleteTarget(null)} onConfirm={() => void confirmDelete()} />}
  </>;
}
