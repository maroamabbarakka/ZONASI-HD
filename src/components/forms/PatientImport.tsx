import { Download, FileSpreadsheet, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PatientImportRow, PatientInput } from '../../types';
import { downloadPatientTemplate } from '../../utils/patientTemplate';

const text = (value: unknown) => value == null ? '' : String(value).trim();
const number = (value: unknown) => Number(String(value ?? '').replace(',', '.')) || 0;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ROWS = 2000;
const rmKey = (value: string) => value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
const isoDate = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(Date.UTC(1899, 11, 30) + Math.round(value) * 86400000);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
  }
  const raw = text(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const match = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  return match ? `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}` : raw;
};
const genderCode = (value: unknown): PatientImportRow['jenis_kelamin'] => {
  const raw = text(value).toUpperCase();
  if (['L', 'LAKI-LAKI', 'LAKI LAKI', 'MALE'].includes(raw)) return 'L';
  if (['P', 'PEREMPUAN', 'FEMALE'].includes(raw)) return 'P';
  return '';
};
const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && date <= new Date();
};

export function PatientImport({ existingRms, onImport, onDone }: { existingRms: string[]; onImport: (rows: PatientInput[]) => Promise<{ imported: number; failed: Array<{ rm: string; message: string }> }>; onDone: () => void }) {
  const [rows, setRows] = useState<PatientImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const parse = async (file: File) => {
    setMessage('');
    setFileName(file.name);
    setRows([]);
    if (!file.name.toLowerCase().endsWith('.xlsx')) throw new Error('Hanya file .xlsx tanpa macro yang dapat diproses.');
    if (file.size > MAX_FILE_BYTES) throw new Error('Ukuran file melebihi batas 5 MB. Pecah file menjadi beberapa bagian.');
    const { readSheet } = await import('read-excel-file/browser');
    const sheet = await readSheet(file);
    const headerAt = sheet.findIndex((row) => row.some((cell) => /nama\s*(pasien)?/i.test(text(cell))));
    if (headerAt < 0) throw new Error('Kolom Nama Pasien tidak ditemukan.');
    const headers = sheet[headerAt].map((cell) => text(cell).toLowerCase());
    const find = (patterns: RegExp[]) => headers.findIndex((header) => patterns.some((pattern) => pattern.test(header)));
    const nameIndex = find([/^nama/, /patient/]);
    const rmIndex = find([/^rm$/, /rekam medis/, /no.*rm/]);
    const dryIndex = find([/bb kering/, /dry weight/]);
    const birthIndex = find([/tanggal lahir/, /tgl lahir/]);
    const genderIndex = find([/jenis kelamin/, /^jk$/]);
    if ([nameIndex, rmIndex, dryIndex, birthIndex, genderIndex].some((index) => index < 0)) throw new Error('Header wajib: RM, Nama Pasien, Tanggal Lahir, Jenis Kelamin, dan BB Kering.');
    const parsed = sheet.slice(headerAt + 1).map((row, index): PatientImportRow | null => {
      const values = row.map(text);
      if (values.every((value) => !value)) return null;
      return { rowNumber: headerAt + index + 2, rm: text(row[rmIndex]), nama: text(row[nameIndex]), tanggal_lahir: isoDate(row[birthIndex]), jenis_kelamin: genderCode(row[genderIndex]), bb_kering: number(row[dryIndex]), notes: '', errors: [] };
    }).filter((row): row is PatientImportRow => Boolean(row));
    if (!parsed.length) throw new Error('Tidak ada baris pasien yang dapat dibaca.');
    if (parsed.length > MAX_ROWS) throw new Error(`File berisi ${parsed.length} baris. Batas dry run browser adalah ${MAX_ROWS} baris.`);
    setRows(parsed);
  };

  const update = (index: number, patch: Partial<PatientImportRow>) => setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  const validation = useMemo(() => {
    const keys = rows.map((row) => rmKey(row.rm));
    const databaseKeys = new Set(existingRms.map(rmKey));
    return rows.map((row, index) => {
      const errors: string[] = [];
      if (!row.rm.trim()) errors.push('RM kosong');
      else if (!keys[index]) errors.push('RM tidak valid');
      else if (keys.filter((key) => key === keys[index]).length > 1) errors.push('RM duplikat di file');
      else if (databaseKeys.has(keys[index])) errors.push('RM sudah ada');
      if (row.nama.trim().length < 2 || row.nama.length > 150 || /[\u0000-\u001f\u007f]/.test(row.nama)) errors.push('Nama tidak valid');
      if (!isValidDate(row.tanggal_lahir)) errors.push('Tanggal lahir tidak valid');
      if (!row.jenis_kelamin) errors.push('Jenis kelamin tidak valid');
      if (row.bb_kering < 20 || row.bb_kering > 250) errors.push('BB Kering di luar 20–250 kg');
      return errors;
    });
  }, [rows, existingRms]);
  const invalid = validation.filter((errors) => errors.length).length;
  const submit = async () => {
    setLoading(true);
    setMessage('');
    try {
      const payload = rows.map(({ rowNumber: _row, errors: _errors, ...row }) => ({ ...row, jenis_kelamin: row.jenis_kelamin as 'L' | 'P' }));
      const result = await onImport(payload);
      setMessage(`${result.imported} pasien berhasil diimpor${result.failed.length ? `, ${result.failed.length} gagal.` : '.'}`);
      if (!result.failed.length) window.setTimeout(onDone, 1200);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Import gagal.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="patient-import">
    <div className="import-helper">
      <div><strong>Gunakan template resmi</strong><p>Isi kolom wajib sesuai contoh agar proses impor lebih cepat dan minim koreksi.</p></div>
      <button type="button" className="button secondary" onClick={downloadPatientTemplate}><Download /> Unduh template</button>
    </div>
    <label className="upload-box"><FileSpreadsheet /><strong>Pilih file Excel</strong><span>File dibaca di perangkat ini dan tidak disimpan sebagai berkas mentah.</span><input type="file" accept=".xlsx" onChange={(event) => { const file = event.target.files?.[0]; if (file) void parse(file).catch((error) => setMessage(error.message)); }} /></label>
    {fileName && <p className="import-summary"><b>Dry run: {fileName}</b> · {rows.length} baris · {rows.length - invalid} valid · {invalid} konflik/error</p>}
    {rows.length > 0 && <div className="table-wrap import-table"><table><thead><tr><th>Baris</th><th>RM *</th><th>Nama</th><th>Tanggal lahir *</th><th>JK</th><th>BB Kering</th><th>Status</th></tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.rowNumber}-${index}`}><td>{row.rowNumber}</td><td><input value={row.rm} onChange={(event) => update(index, { rm: event.target.value })} /></td><td>{row.nama}</td><td><input type="date" value={row.tanggal_lahir} onChange={(event) => update(index, { tanggal_lahir: event.target.value })} /></td><td><select value={row.jenis_kelamin} onChange={(event) => update(index, { jenis_kelamin: event.target.value as '' | 'L' | 'P' })}><option value="">Pilih</option><option value="L">L</option><option value="P">P</option></select></td><td><input type="number" step="0.1" value={row.bb_kering} onChange={(event) => update(index, { bb_kering: Number(event.target.value) })} /></td><td>{validation[index].length ? <span className="import-error">{validation[index].join(', ')}</span> : <span className="import-ok">Siap</span>}</td></tr>)}</tbody></table></div>}
    {message && <div className="notice warning">{message}</div>}
    <div className="modal-actions"><button className="button secondary" onClick={onDone}>Tutup</button><button className="button primary" disabled={!rows.length || invalid > 0 || loading} onClick={submit}><Upload />{loading ? 'Mengimpor…' : `Konfirmasi impor ${rows.length} pasien`}</button></div>
  </div>;
}
