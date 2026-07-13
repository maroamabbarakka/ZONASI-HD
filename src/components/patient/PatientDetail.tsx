import { Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Patient } from '../../types';
import { IDWGTrendChart } from '../charts/IDWGTrendChart';
import ZoneBadge from '../ui/ZoneBadge';

export function PatientDetail({ patient }: { patient: Patient }) {
  const { sessionsFor } = useApp();
  const sessions = sessionsFor(patient.id);
  return <div className="patient-detail" id="print-card">
    <div className="detail-hero"><div><span className="eyebrow">Kartu Kendali ZONASI-HD</span><h2>{patient.nama}</h2><p>{patient.rm} · BB Kering {patient.bb_kering.toFixed(1)} kg</p></div>{patient.latest_zone && <ZoneBadge zone={patient.latest_zone} size="lg" />}</div>
    <div className="detail-metrics"><div><span>IDWG terakhir</span><strong>{patient.latest_idwg_pct?.toFixed(1) ?? '—'}%</strong></div><div><span>Streak Kuning</span><strong>{patient.yellow_streak} sesi</strong></div><div><span>Total riwayat</span><strong>{sessions.length} sesi</strong></div></div>
    <section className="detail-section"><div className="section-heading"><h3>Tren 12 sesi terakhir</h3></div><IDWGTrendChart sessions={sessions} /></section>
    <section className="detail-section"><div className="section-heading"><h3>Riwayat sesi</h3></div><div className="table-wrap"><table><thead><tr><th>Tanggal</th><th>Pre-HD</th><th>Post-HD</th><th>IDWG</th><th>Zona</th><th>Perawat</th></tr></thead><tbody>{sessions.slice(0, 12).map((session) => <tr key={session.id}><td>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(session.session_date))}</td><td>{session.pre_weight.toFixed(1)} kg</td><td>{session.post_weight?.toFixed(1) ?? '—'} kg</td><td><strong>{session.idwg_pct.toFixed(1)}%</strong></td><td><ZoneBadge zone={session.zone} size="sm" /></td><td>{session.nurse_name}</td></tr>)}</tbody></table></div></section>
    <section className="education-card"><h3>Kenali warna Anda</h3><div><p><b className="text-green">Hijau &lt;3%</b> Pertahankan pembatasan cairan.</p><p><b className="text-yellow">Kuning 3–5%</b> Kurangi cairan dan garam, ikuti edukasi petugas.</p><p><b className="text-red">Merah &gt;5%</b> Risiko tinggi, segera ikuti arahan tim medis.</p></div></section>
    <div className="print-footer"><span>Dicetak {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date())}</span><span>Paraf petugas: __________________</span></div>
    <button className="button primary no-print" onClick={() => window.print()}><Printer /> Cetak Kartu Kendali</button>
  </div>;
}
