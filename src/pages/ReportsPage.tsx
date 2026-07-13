import { Download } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { canExportReports } from '../lib/permissions';
import { toCsvCell } from '../utils/csv';

type Period = '30' | '90' | 'ALL';

export function ReportsPage() {
  const { data, user, dataMode } = useApp();
  const [period, setPeriod] = useState<Period>('30');
  const active = data.patients.filter((p) => p.is_active);
  const sessions = useMemo(() => {
    if (period === 'ALL') return data.sessions;
    const cutoff = Date.now() - Number(period) * 86400000;
    return data.sessions.filter((session) => new Date(session.session_date).getTime() >= cutoff);
  }, [data.sessions, period]);
  const greenSessions = sessions.filter((s) => s.zone === 'HIJAU').length;
  const redSessions = sessions.filter((s) => s.zone === 'MERAH').length;
  const average = sessions.length ? sessions.reduce((sum, s) => sum + s.idwg_pct, 0) / sessions.length : 0;
  const periodLabel = period === 'ALL' ? 'Seluruh data' : `${period} hari terakhir`;
  const download = () => {
    const rows = [['Periode', periodLabel], ['Dibuat', new Date().toISOString()], [], ['RM', 'Nama', 'BB Kering', 'IDWG Terakhir', 'Zona', 'Streak Kuning'], ...active.map((p) => [p.rm, p.nama, p.bb_kering, p.latest_idwg_pct ?? '', p.latest_zone ?? '', p.yellow_streak])];
    const csv = rows.map((row) => row.map(toCsvCell).join(',')).join('\r\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })); link.download = `laporan-zonasi-hd-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(link.href);
  };
  return <><header className="page-header"><div><span className="eyebrow">Evaluasi mutu · {dataMode === 'firebase' ? 'Firestore' : 'Demo'}</span><h1>Laporan ringkas</h1><p>Periode dan denominator ditampilkan agar indikator dapat ditafsirkan dengan benar.</p></div><div className="header-actions"><label className="field report-period"><span>Periode</span><select value={period} onChange={(event) => setPeriod(event.target.value as Period)}><option value="30">30 hari</option><option value="90">90 hari</option><option value="ALL">Seluruh data</option></select></label>{canExportReports(user?.role) && <button className="button primary" onClick={download}><Download /> Ekspor CSV aman</button>}</div></header><section className="report-grid"><article><span>Proporsi Sesi Hijau</span><strong>{sessions.length ? Math.round(greenSessions / sessions.length * 100) : 0}%</strong><p>{greenSessions} dari {sessions.length} sesi · {periodLabel}.</p></article><article><span>Rerata IDWG</span><strong>{average.toFixed(1)}%</strong><p>Denominator: {sessions.length} sesi valid.</p></article><article><span>Kejadian Merah</span><strong>{redSessions}</strong><p>{periodLabel} · berbasis sesi, bukan pasien.</p></article></section><section className="panel"><div className="section-heading"><div><span className="eyebrow">Distribusi status terbaru</span><h2>Komposisi zona pasien</h2></div></div><div className="distribution">{(['HIJAU', 'KUNING', 'MERAH'] as const).map((zone) => { const count = active.filter((p) => p.latest_zone === zone).length; const withResult = active.filter((p) => p.latest_zone).length; return <div key={zone}><div><span>{zone}</span><b>{count} dari {withResult} pasien dengan hasil</b></div><div className="bar"><span className={`bar-${zone.toLowerCase()}`} style={{ width: `${withResult ? count / withResult * 100 : 0}%` }} /></div></div>; })}</div></section></>;
}
