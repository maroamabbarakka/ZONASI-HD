import { CalendarDays, Droplets, HeartPulse, Loader2, Scale, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { PublicPatientCard, Zone } from '../types';
import ZoneBadge from '../components/ui/ZoneBadge';

const patientAdvice: Record<Zone, { title: string; message: string; steps: string[] }> = {
  HIJAU: {
    title: 'Risiko cairan rendah',
    message: 'Hasil terakhir masih dalam batas baik. Pertahankan kebiasaan yang sudah membantu.',
    steps: ['Ikuti batas minum yang diberikan petugas.', 'Batasi makanan asin agar tidak mudah haus.', 'Tetap hadir sesuai jadwal hemodialisis.'],
  },
  KUNING: {
    title: 'Perlu perhatian lebih',
    message: 'Kenaikan berat antar sesi mulai meningkat. Edukasi cairan perlu diperkuat.',
    steps: ['Kurangi asupan cairan bertahap sesuai arahan.', 'Kurangi garam, makanan instan, dan makanan tinggi natrium.', 'Sampaikan keluhan bengkak atau sesak kepada petugas.'],
  },
  MERAH: {
    title: 'Prioritas tinggi',
    message: 'Hasil terakhir menunjukkan risiko kelebihan cairan tinggi. Ikuti arahan tim medis.',
    steps: ['Segera laporkan sesak, bengkak, atau dada terasa berat.', 'Jangan menunda kontrol atau sesi hemodialisis.', 'Ikuti instruksi petugas terkait pembatasan cairan dan tindak lanjut.'],
  },
};

function formatDate(value?: string) {
  if (!value) return 'Belum ada sesi';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(value));
}

export function PublicPatientCardPage() {
  const { patientId } = useParams();
  const [card, setCard] = useState<PublicPatientCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!patientId) { setError('Tautan kartu tidak lengkap.'); setLoading(false); return; }
    void import('../services/firebase').then(({ getPublicPatientCard }) => getPublicPatientCard(patientId)).then((result) => {
      if (cancelled) return;
      setCard(result);
      setError(result ? '' : 'Kartu pasien tidak ditemukan, sudah diarsipkan, atau belum dipublikasikan.');
      setLoading(false);
    }).catch((err) => {
      if (cancelled) return;
      setError(err instanceof Error ? err.message : 'Kartu belum dapat dibuka.');
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [patientId]);

  const advice = card?.latest_zone ? patientAdvice[card.latest_zone] : undefined;

  return <main className="public-card-page">
    <section className="public-card-shell">
      <header className="public-card-header">
        <img src="/logo-zonasi-hd-color.png" alt="ZONASI-HD" />
        <div><span>Kartu Kendali Pasien</span><strong>Ringkasan Pemantauan Cairan</strong></div>
      </header>

      {loading && <div className="public-card-state"><Loader2 className="spin" /><strong>Memuat kartu pasien…</strong></div>}
      {!loading && error && <div className="public-card-state"><ShieldCheck /><strong>{error}</strong><p>Silakan hubungi petugas hemodialisis bila QR berasal dari kartu kendali resmi.</p><Link to="/">Buka ZONASI-HD</Link></div>}
      {!loading && card && <div className="public-card-content">
        <div className="public-patient-title">
          <span><HeartPulse /> Identitas pasien</span>
          <h1>{card.nama}</h1>
          <p>No. Rekam Medis {card.rm} · {card.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
        </div>

        <div className={`public-zone-card ${card.latest_zone ? `public-zone-${card.latest_zone.toLowerCase()}` : ''}`}>
          <span>Status IDWG terakhir</span>
          <strong>{card.latest_idwg_pct?.toFixed(1) ?? '—'}%</strong>
          {card.latest_zone ? <ZoneBadge zone={card.latest_zone} size="lg" /> : <em>Belum ada data sesi</em>}
          <small>{formatDate(card.latest_session_date)}</small>
        </div>

        <div className="public-info-grid">
          <article><Scale /><span>BB Kering</span><strong>{card.bb_kering.toFixed(1)} kg</strong></article>
          <article><Droplets /><span>BB Pre-HD terakhir</span><strong>{card.latest_pre_weight?.toFixed(1) ?? '—'} kg</strong></article>
          <article><CalendarDays /><span>Diperbarui</span><strong>{formatDate(card.updated_at)}</strong></article>
        </div>

        <section className="public-advice">
          <span>Panduan pasien</span>
          <h2>{advice?.title ?? 'Menunggu hasil pemantauan'}</h2>
          <p>{advice?.message ?? 'Ringkasan edukasi akan tampil setelah petugas memasukkan hasil sesi hemodialisis.'}</p>
          {advice && <ol>{advice.steps.map((step) => <li key={step}>{step}</li>)}</ol>}
        </section>

        <footer className="public-card-note">
          Kartu ini membantu pasien memahami warna risiko cairan. Keputusan klinis tetap mengikuti arahan dokter, perawat, dan SPO unit hemodialisis.
        </footer>
      </div>}
    </section>
  </main>;
}
