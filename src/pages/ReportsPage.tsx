import { Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function ReportsPage() {
  const { data } = useApp();
  const active = data.patients.filter((p) => p.is_active);
  const green = active.filter((p) => p.latest_zone === 'HIJAU').length;
  const redSessions = data.sessions.filter((s) => s.zone === 'MERAH').length;
  const average = data.sessions.length ? data.sessions.reduce((sum, s) => sum + s.idwg_pct, 0) / data.sessions.length : 0;
  const download = () => {
    const rows = [['RM', 'Nama', 'BB Kering', 'IDWG Terakhir', 'Zona', 'Streak Kuning'], ...active.map((p) => [p.rm, p.nama, p.bb_kering, p.latest_idwg_pct ?? '', p.latest_zone ?? '', p.yellow_streak])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })); link.download = `laporan-zonasi-hd-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(link.href);
  };
  return <><header className="page-header"><div><span className="eyebrow">Evaluasi mutu</span><h1>Laporan ringkas</h1><p>Indikator demo dihitung dari seluruh sesi yang tersimpan di browser.</p></div><button className="button primary" onClick={download}><Download /> Ekspor CSV</button></header><section className="report-grid"><article><span>Proporsi Zona Hijau</span><strong>{active.length ? Math.round(green / active.length * 100) : 0}%</strong><p>Target utama peningkatan kepatuhan cairan.</p></article><article><span>Rerata IDWG</span><strong>{average.toFixed(1)}%</strong><p>Dari {data.sessions.length} sesi tercatat.</p></article><article><span>Kejadian Merah</span><strong>{redSessions}</strong><p>Total pada data demo saat ini.</p></article></section><section className="panel"><div className="section-heading"><div><span className="eyebrow">Distribusi status terbaru</span><h2>Komposisi zona pasien</h2></div></div><div className="distribution">{(['HIJAU', 'KUNING', 'MERAH'] as const).map((zone) => { const count = active.filter((p) => p.latest_zone === zone).length; return <div key={zone}><div><span>{zone}</span><b>{count} pasien</b></div><div className="bar"><span className={`bar-${zone.toLowerCase()}`} style={{ width: `${active.length ? count / active.length * 100 : 0}%` }} /></div></div>; })}</div></section></>;
}
