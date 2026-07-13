import { BookOpen, CircleHelp, HeartPulse, ShieldCheck, Sparkles, UserRoundCog } from 'lucide-react';

const faq = [
  {
    question: 'Apa fungsi utama ZONASI-HD?',
    answer: 'Aplikasi ini membantu petugas memantau kenaikan berat badan antar sesi hemodialisis, menandai zona risiko, dan mengingatkan pasien yang perlu perhatian lebih cepat.',
  },
  {
    question: 'Apa arti zona Hijau, Kuning, dan Merah?',
    answer: 'Hijau berarti kondisi cairan relatif aman, Kuning berarti perlu perhatian dan edukasi, sedangkan Merah berarti perlu tindak lanjut lebih serius sesuai protokol unit.',
  },
  {
    question: 'Siapa yang boleh mengubah data pasien?',
    answer: 'Pengelolaan data pasien dibatasi sesuai jenis akses. Admin dan Supervisor dapat mengelola data pasien, sedangkan petugas lain mengikuti izin yang diberikan unit.',
  },
  {
    question: 'Apakah semua petugas bisa mengubah jenis akses?',
    answer: 'Tidak. Setiap petugas dapat memperbarui profilnya sendiri, tetapi jenis akses hanya bisa diubah oleh Administrator.',
  },
  {
    question: 'Apakah aplikasi menggantikan keputusan klinis?',
    answer: 'Tidak. ZONASI-HD adalah alat bantu pemantauan dan dokumentasi. Keputusan klinis tetap mengikuti penilaian tenaga kesehatan dan SPO unit.',
  },
];

const manual = [
  'Masuk memakai ID pengguna atau email yang diberikan admin.',
  'Buka Pusat Pantau untuk melihat pasien yang perlu prioritas.',
  'Gunakan menu Pasien untuk mencari, menambah, atau memperbarui data pasien sesuai izin.',
  'Input sesi baru setelah pasien ditimbang sebelum hemodialisis.',
  'Periksa hasil zona dan checklist tindak lanjut sebelum menyimpan.',
  'Gunakan Laporan untuk melihat ringkasan mutu dan mengunduh data bila diperlukan.',
];

export function AboutPage() {
  return <>
    <header className="page-header">
      <div>
        <span className="eyebrow">Panduan dan informasi</span>
        <h1>Tentang ZONASI-HD</h1>
        <p>Ringkasan sederhana tentang tujuan aplikasi, cara pakai, pertanyaan umum, dan pengembang.</p>
      </div>
    </header>

    <section className="about-hero panel">
      <div>
        <span className="eyebrow"><HeartPulse /> Smart Fluid Monitoring</span>
        <h2>Risiko cairan terlihat. Tindakan menjadi cepat.</h2>
        <p>ZONASI-HD membantu unit hemodialisis memantau kenaikan berat badan antar dialisis atau IDWG, mengelompokkan pasien ke zona warna, dan menampilkan peringatan dini agar tindak lanjut lebih terarah.</p>
      </div>
      <div className="about-badge"><Sparkles /><strong>ZONASI-HD</strong><span>Hijau · Kuning · Merah</span></div>
    </section>

    <section className="about-grid">
      <article className="panel">
        <div className="section-heading"><h2><ShieldCheck /> Yang dijaga aplikasi</h2></div>
        <ul className="clean-list">
          <li>Data pasien dicatat dengan nomor RM sebagai pembeda utama.</li>
          <li>Hasil zona dihitung otomatis dari berat badan dan berat kering.</li>
          <li>Peringatan muncul saat pasien masuk zona Merah atau Kuning berulang.</li>
          <li>Jenis akses membatasi siapa yang boleh input, mengelola pasien, dan melihat laporan.</li>
        </ul>
      </article>

      <article className="panel">
        <div className="section-heading"><h2><BookOpen /> Manual singkat</h2></div>
        <ol className="manual-list">
          {manual.map((item) => <li key={item}>{item}</li>)}
        </ol>
      </article>
    </section>

    <section className="panel">
      <div className="section-heading"><h2><CircleHelp /> FAQ</h2></div>
      <div className="faq-list">
        {faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
      </div>
    </section>

    <section className="panel developer-card">
      <div>
        <span className="eyebrow"><UserRoundCog /> Developer</span>
        <h2>MAROA Project</h2>
        <p>Dikembangkan sebagai aplikasi pendukung pemantauan cairan pasien hemodialisis dengan pendekatan visual, sederhana, dan mudah dipakai oleh petugas unit.</p>
      </div>
      <strong>MAROA Project</strong>
    </section>
  </>;
}
