import { Activity, CalendarDays, Droplets, Hash, HeartPulse, Printer, Scale, ShieldCheck, UserRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Patient } from '../../types';
import { IDWGTrendChart } from '../charts/IDWGTrendChart';
import ZoneBadge from '../ui/ZoneBadge';

export function PatientDetail({ patient }: { patient: Patient }) {
  const { sessionsFor } = useApp();
  const sessions = sessionsFor(patient.id);
  const latestSession = sessions[0];
  const printedAt = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(new Date());
  const birthDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(`${patient.tanggal_lahir}T00:00:00`));

  return <div className="patient-detail" id="print-card">
    <header className="control-card-header">
      <div className="control-card-brand"><img src="/logo-zonasi-hd-color.png" alt="ZONASI-HD" /><div><span>Kartu Kendali Pasien</span><small>Smart Fluid Monitoring · Safe Heart</small></div></div>
      <div className="control-card-document"><span>Dokumen Pemantauan</span><strong>HEMODIALISIS</strong></div>
    </header>

    <section className="detail-hero">
      <div className="patient-identity">
        <span className="eyebrow"><HeartPulse /> Identitas pasien</span>
        <h2>{patient.nama}</h2>
        <div className="identity-grid">
          <span><Hash /><small>No. Rekam Medis</small><strong>{patient.rm}</strong></span>
          <span><CalendarDays /><small>Tanggal Lahir</small><strong>{birthDate}</strong></span>
          <span><UserRound /><small>Jenis Kelamin</small><strong>{patient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</strong></span>
          <span><Scale /><small>BB Kering</small><strong>{patient.bb_kering.toFixed(1)} kg</strong></span>
        </div>
      </div>
      <div className={`zone-summary ${patient.latest_zone ? `zone-summary-${patient.latest_zone.toLowerCase()}` : ''}`}>
        <span>Status IDWG Terakhir</span>
        <strong>{patient.latest_idwg_pct?.toFixed(1) ?? '—'}<small>%</small></strong>
        {patient.latest_zone ? <ZoneBadge zone={patient.latest_zone} size="lg" /> : <em>Belum ada data</em>}
        <small>{latestSession ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(latestSession.session_date)) : 'Belum ada sesi HD'}</small>
      </div>
    </section>

    <div className="detail-metrics">
      <div><span className="metric-icon"><Droplets /></span><span>IDWG terakhir</span><strong>{patient.latest_idwg_pct?.toFixed(1) ?? '—'}%</strong><small>Target aman &lt;3%</small></div>
      <div><span className="metric-icon"><Activity /></span><span>Streak Kuning</span><strong>{patient.yellow_streak} sesi</strong><small>Pantauan berturut-turut</small></div>
      <div><span className="metric-icon"><ShieldCheck /></span><span>Total riwayat</span><strong>{sessions.length} sesi</strong><small>Rekaman tersedia</small></div>
    </div>

    <section className="detail-section control-section"><div className="section-heading"><div><span className="section-number">01</span><div><h3>Tren IDWG</h3><p>Pergerakan 12 sesi hemodialisis terakhir</p></div></div><div className="chart-legend"><span className="legend-yellow" />Batas 3%<span className="legend-red" />Batas 5%</div></div><IDWGTrendChart sessions={sessions} /></section>
    <section className="detail-section control-section history-section"><div className="section-heading"><div><span className="section-number">02</span><div><h3>Riwayat sesi</h3><p>Catatan pengukuran dan zona pasien</p></div></div></div><div className="table-wrap control-history"><table><thead><tr><th>Tanggal</th><th>Pre-HD</th><th>Post-HD</th><th>IDWG</th><th>Zona</th><th>Perawat</th></tr></thead><tbody>{sessions.slice(0, 12).map((session) => <tr key={session.id}><td data-label="Tanggal">{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(session.session_date))}</td><td data-label="Pre-HD">{session.pre_weight.toFixed(1)} kg</td><td data-label="Post-HD">{session.post_weight?.toFixed(1) ?? '—'} kg</td><td data-label="IDWG"><strong>{session.idwg_pct.toFixed(1)}%</strong></td><td data-label="Zona"><ZoneBadge zone={session.zone} size="sm" /></td><td data-label="Perawat">{session.nurse_name}</td></tr>)}</tbody></table>{sessions.length === 0 && <div className="empty-state">Belum ada riwayat sesi.</div>}</div></section>
    <section className="education-card"><div className="education-heading"><span className="section-number">03</span><div><h3>Panduan warna IDWG</h3><p>Gunakan panduan ini bersama edukasi dari tim hemodialisis.</p></div></div><div className="education-zones"><article className="education-green"><i /><div><strong>HIJAU <span>&lt;3%</span></strong><p>Pertahankan pembatasan cairan dan kebiasaan baik Anda.</p></div></article><article className="education-yellow"><i /><div><strong>KUNING <span>3–5%</span></strong><p>Kurangi cairan dan garam, ikuti edukasi petugas.</p></div></article><article className="education-red"><i /><div><strong>MERAH <span>&gt;5%</span></strong><p>Risiko tinggi. Segera ikuti arahan tim medis.</p></div></article></div></section>

    <footer className="control-card-footer">
      <div className="footer-brand"><img src="/logo-zonasi-hd-square.png" alt="" /><div><strong>ZONASI-HD</strong><span>Pemantauan cairan yang mudah dipahami</span></div></div>
      <div className="footer-meta"><span>Dicetak {printedAt}</span><small>Dokumen ini mendukung edukasi dan pemantauan; keputusan klinis tetap oleh tenaga kesehatan.</small></div>
      <div className="signature"><span>Paraf petugas</span><strong>________________</strong></div>
    </footer>
    <div className="control-card-actions no-print"><button className="button primary" onClick={() => window.print()}><Printer /> Cetak Kartu Kendali</button></div>
  </div>;
}
