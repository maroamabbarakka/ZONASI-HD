import { FileSpreadsheet, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PatientImportRow, PatientInput } from '../../types';

const text = (value: unknown) => value == null ? '' : String(value).trim();
const number = (value: unknown) => Number(String(value ?? '').replace(',', '.')) || 0;

export function PatientImport({ onImport, onDone }: { onImport: (rows: PatientInput[]) => Promise<{ imported: number; failed: Array<{ rm: string; message: string }> }>; onDone: () => void }) {
  const [rows, setRows] = useState<PatientImportRow[]>([]); const [fileName, setFileName] = useState(''); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(false);
  const parse = async (file: File) => {
    setMessage(''); setFileName(file.name);
    const { readSheet } = await import('read-excel-file/browser'); const sheet = await readSheet(file);
    const headerAt = sheet.findIndex((row) => row.some((cell) => /nama\s*(pasien)?/i.test(text(cell))));
    if (headerAt < 0) throw new Error('Kolom Nama Pasien tidak ditemukan.');
    const headers = sheet[headerAt].map((cell) => text(cell).toLowerCase());
    const find = (patterns: RegExp[]) => headers.findIndex((header) => patterns.some((pattern) => pattern.test(header)));
    const nameIndex = find([/^nama/, /patient/]); const rmIndex = find([/^rm$/, /rekam medis/, /no.*rm/]); const dryIndex = find([/bb kering/, /dry weight/]); const birthIndex = find([/tanggal lahir/, /tgl lahir/]); const genderIndex = find([/jenis kelamin/, /^jk$/]);
    const parsed = sheet.slice(headerAt + 1).map((row, index): PatientImportRow | null => {
      const nama = text(row[nameIndex]); if (!nama) return null; const gender = text(row[genderIndex]).toUpperCase();
      return { rowNumber: headerAt + index + 2, rm: rmIndex >= 0 ? text(row[rmIndex]) : '', nama, tanggal_lahir: birthIndex >= 0 ? text(row[birthIndex]) : '', jenis_kelamin: gender.startsWith('P') ? 'P' : 'L', bb_kering: dryIndex >= 0 ? number(row[dryIndex]) : 0, notes: '', errors: [] };
    }).filter((row): row is PatientImportRow => Boolean(row));
    if (!parsed.length) throw new Error('Tidak ada baris pasien yang dapat dibaca.'); setRows(parsed);
  };
  const update = (index: number, patch: Partial<PatientImportRow>) => setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  const validation = useMemo(() => { const keys = rows.map((row) => row.rm.toUpperCase().replace(/[^A-Z0-9]/g, '')); return rows.map((row, index) => { const errors: string[] = []; if (!row.rm.trim()) errors.push('RM kosong'); else if (keys.filter((key) => key === keys[index]).length > 1) errors.push('RM duplikat'); if (!row.nama.trim()) errors.push('Nama kosong'); if (!/^\d{4}-\d{2}-\d{2}$/.test(row.tanggal_lahir)) errors.push('Tanggal lahir'); if (row.bb_kering < 20 || row.bb_kering > 250) errors.push('BB Kering'); return errors; }); }, [rows]);
  const invalid = validation.filter((errors) => errors.length).length;
  const submit = async () => { setLoading(true); setMessage(''); try { const result = await onImport(rows.map(({ rowNumber: _row, errors: _errors, ...row }) => row)); setMessage(`${result.imported} pasien berhasil diimpor${result.failed.length ? `, ${result.failed.length} gagal.` : '.'}`); if (!result.failed.length) window.setTimeout(onDone, 1200); } catch (error) { setMessage(error instanceof Error ? error.message : 'Import gagal.'); } finally { setLoading(false); } };
  return <div><label className="upload-box"><FileSpreadsheet /><strong>Pilih file XLSX</strong><span>File diproses di browser dan tidak disimpan sebagai berkas mentah.</span><input type="file" accept=".xlsx" onChange={(event) => { const file = event.target.files?.[0]; if (file) void parse(file).catch((error) => setMessage(error.message)); }} /></label>
    {fileName && <p className="import-summary"><b>{fileName}</b> · {rows.length} baris · {invalid} perlu dilengkapi</p>}
    {rows.length > 0 && <div className="table-wrap import-table"><table><thead><tr><th>Baris</th><th>RM *</th><th>Nama</th><th>Tanggal lahir *</th><th>JK</th><th>BB Kering</th><th>Status</th></tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.rowNumber}-${index}`}><td>{row.rowNumber}</td><td><input value={row.rm} onChange={(e) => update(index, { rm: e.target.value })} /></td><td>{row.nama}</td><td><input type="date" value={row.tanggal_lahir} onChange={(e) => update(index, { tanggal_lahir: e.target.value })} /></td><td><select value={row.jenis_kelamin} onChange={(e) => update(index, { jenis_kelamin: e.target.value as 'L' | 'P' })}><option value="L">L</option><option value="P">P</option></select></td><td><input type="number" step="0.1" value={row.bb_kering} onChange={(e) => update(index, { bb_kering: Number(e.target.value) })} /></td><td>{validation[index].length ? <span className="import-error">{validation[index].join(', ')}</span> : <span className="import-ok">Siap</span>}</td></tr>)}</tbody></table></div>}
    {message && <div className="notice warning">{message}</div>}<div className="modal-actions"><button className="button secondary" onClick={onDone}>Tutup</button><button className="button primary" disabled={!rows.length || invalid > 0 || loading} onClick={submit}><Upload />{loading ? 'Mengimpor…' : `Impor ${rows.length} pasien`}</button></div>
  </div>;
}
