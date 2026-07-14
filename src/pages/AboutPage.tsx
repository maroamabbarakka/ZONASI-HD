import {
  Activity,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  ClipboardList,
  Droplets,
  HeartPulse,
  Lightbulb,
  MonitorCheck,
  ShieldCheck,
  Sparkles,
  Target,
  UserRoundCog,
  Users,
} from 'lucide-react';

const identity = [
  { label: 'Nama inovasi', value: 'ZONASI-HD' },
  { label: 'Kepanjangan', value: 'Zona Akurasi Sistematik Indikator Hemodialisis' },
  { label: 'Kategori', value: 'Kesehatan / Pelayanan Publik Digital' },
  { label: 'Instansi', value: 'Unit Hemodialisis RSUD Andi Makkasau Kota Parepare' },
  { label: 'Tahun', value: '2026' },
];

const acronym = [
  ['ZON', 'Zona', 'Area pemantauan tindakan dan risiko pasien hemodialisis.'],
  ['A', 'Akurasi', 'Ketepatan pengukuran berat badan, perhitungan IDWG, dan tindak lanjut.'],
  ['S', 'Sistematik', 'Dilakukan teratur, terdokumentasi, dan sesuai prosedur unit.'],
  ['I', 'Indikator', 'Tolok ukur yang membantu petugas membaca risiko pasien.'],
  ['HD', 'Hemodialisis', 'Fokus layanan cuci darah dan manajemen cairan pasien.'],
];

const problemCards = [
  {
    title: 'Data terpecah',
    text: 'Catatan berat badan sering tersebar di berkas manual sehingga tren kenaikan cairan sulit dibaca cepat.',
  },
  {
    title: 'Respons terlambat',
    text: 'Tim sering baru bertindak saat pasien sudah sesak atau masuk kondisi berisiko tinggi.',
  },
  {
    title: 'Hitung manual',
    text: 'Perhitungan IDWG secara manual menambah beban kerja dan membuka peluang salah hitung.',
  },
  {
    title: 'Pasien sulit memahami angka',
    text: 'Angka kilogram atau persen sering tidak memberi gambaran bahaya yang mudah dipahami pasien.',
  },
];

const zones = [
  {
    zone: 'HIJAU',
    range: 'IDWG < 3%',
    level: 'Risiko rendah',
    action: 'Edukasi rutin, apresiasi kepatuhan, dan pantau pola cairan.',
  },
  {
    zone: 'KUNING',
    range: 'IDWG 3-5%',
    level: 'Risiko sedang',
    action: 'Monitoring lebih ketat, edukasi pembatasan cairan, dan evaluasi target ultrafiltrasi.',
  },
  {
    zone: 'MERAH',
    range: 'IDWG > 5%',
    level: 'Risiko tinggi',
    action: 'Aktifkan protokol unit, lakukan kolaborasi klinis, dan prioritaskan tindak lanjut.',
  },
];

const workflow = [
  'Petugas memilih pasien atau menambahkan pasien baru bila belum ada di daftar.',
  'Berat badan sebelum hemodialisis dimasukkan bersama data sesi yang diperlukan.',
  'Aplikasi menghitung IDWG dan langsung menampilkan zona warna.',
  'Petugas melihat checklist tindak lanjut sesuai zona dan jenis akses.',
  'Sesi disimpan agar riwayat, peringatan, dan laporan mutu ikut diperbarui.',
];

const benefits = [
  'Membantu menggeser budaya kerja dari reaktif menjadi preventif.',
  'Membuat risiko cairan lebih cepat terlihat oleh perawat, dokter, dan pasien.',
  'Mengurangi variasi tindakan karena tindak lanjut dipandu oleh zona risiko.',
  'Mendukung edukasi pasien dengan bahasa visual Hijau, Kuning, dan Merah.',
  'Memudahkan pemantauan tren dan laporan mutu layanan hemodialisis.',
];

const modules = [
  ['Pusat Pantau', 'Melihat situasi pasien terkini dan peringatan dini.'],
  ['Pasien', 'Mengelola master pasien, berat kering, dan riwayat sesi.'],
  ['Protokol', 'Menampilkan arahan tindak lanjut berdasarkan zona.'],
  ['Laporan', 'Meringkas capaian mutu, kejadian Merah, dan rerata IDWG.'],
  ['Akun', 'Mengatur profil petugas dan jenis akses sesuai kewenangan.'],
];

const manual = [
  'Masuk menggunakan ID pengguna atau email yang diberikan admin.',
  'Buka Pusat Pantau untuk melihat pasien yang perlu prioritas.',
  'Gunakan menu Pasien untuk mencari, menambah, mengubah, atau mengimpor data sesuai izin.',
  'Input sesi baru setelah pasien ditimbang sebelum hemodialisis.',
  'Periksa hasil zona, rekomendasi singkat, dan checklist tindak lanjut.',
  'Simpan sesi agar riwayat pasien, peringatan, dan laporan ikut diperbarui.',
  'Tandai peringatan sebagai sudah ditindaklanjuti setelah dilakukan penanganan sesuai SPO.',
  'Gunakan Laporan untuk evaluasi berkala dan bahan diskusi mutu layanan.',
];

const faq = [
  {
    question: 'Apa fungsi utama ZONASI-HD?',
    answer: 'ZONASI-HD membantu petugas memantau kenaikan berat badan antar sesi hemodialisis, menghitung IDWG, memberi warna risiko, dan menampilkan peringatan dini agar tindak lanjut lebih cepat.',
  },
  {
    question: 'Mengapa memakai warna Hijau, Kuning, dan Merah?',
    answer: 'Warna lebih mudah dipahami oleh petugas dan pasien. Hijau berarti risiko rendah, Kuning berarti perlu perhatian, dan Merah berarti perlu prioritas tindak lanjut.',
  },
  {
    question: 'Apakah ZONASI-HD menggantikan keputusan dokter atau perawat?',
    answer: 'Tidak. Aplikasi ini adalah alat bantu pemantauan, edukasi, dan dokumentasi. Keputusan klinis tetap mengikuti penilaian tenaga kesehatan dan SPO unit.',
  },
  {
    question: 'Siapa yang boleh mengubah data pasien?',
    answer: 'Pengelolaan data pasien dibatasi sesuai jenis akses. Admin dan Perawat Mahir dapat mengelola data pasien, sedangkan petugas lain mengikuti izin yang diberikan unit.',
  },
  {
    question: 'Siapa yang boleh mengubah jenis akses petugas?',
    answer: 'Jenis akses hanya dapat diubah oleh Administrator. Petugas biasa hanya dapat memperbarui profilnya sendiri.',
  },
  {
    question: 'Apa yang harus dilakukan bila pasien masuk Zona Merah?',
    answer: 'Petugas perlu memprioritaskan pasien tersebut, mengikuti protokol unit, melakukan kolaborasi klinis sesuai kewenangan, dan mendokumentasikan tindak lanjut.',
  },
  {
    question: 'Apakah data latihan boleh memakai data pasien nyata?',
    answer: 'Tidak. Mode latihan hanya untuk belajar alur aplikasi. Data pasien nyata hanya boleh dimasukkan saat unit sudah menyetujui penggunaan produksi dan tata kelola privasinya.',
  },
];

export function AboutPage() {
  return <>
    <header className="page-header">
      <div>
        <span className="eyebrow">Panduan dan informasi</span>
        <h1>Tentang ZONASI-HD</h1>
        <p>Profil lengkap aplikasi, latar belakang inovasi, cara kerja zona, manual penggunaan, FAQ, dan pengembang.</p>
      </div>
    </header>

    <section className="about-hero panel">
      <div>
        <span className="eyebrow"><HeartPulse /> Zona Akurasi Sistematik Indikator Hemodialisis</span>
        <h2>Risiko cairan terlihat. Tindakan menjadi cepat.</h2>
        <p>ZONASI-HD adalah sistem pemantauan risiko kelebihan cairan pasien hemodialisis yang mengubah data berat badan menjadi zona warna. Tujuannya sederhana: membantu petugas menemukan risiko lebih awal, memberi edukasi yang mudah dipahami, dan menstandarkan tindak lanjut sebelum pasien jatuh ke kondisi kritis.</p>
      </div>
      <div className="about-badge"><Sparkles /><strong>ZONASI-HD</strong><span>Hijau - Kuning - Merah</span></div>
    </section>

    <section className="about-identity panel">
      <div className="section-heading"><h2><ClipboardList /> Identitas inovasi</h2></div>
      <div className="identity-grid">
        {identity.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}
      </div>
    </section>

    <section className="about-grid">
      <article className="panel">
        <div className="section-heading"><h2><Lightbulb /> Makna nama ZONASI-HD</h2></div>
        <div className="acronym-list">
          {acronym.map(([code, title, text]) => <div key={code}><b>{code}</b><span><strong>{title}</strong><small>{text}</small></span></div>)}
        </div>
      </article>

      <article className="panel">
        <div className="section-heading"><h2><Target /> Tujuan utama</h2></div>
        <ul className="clean-list">
          <li>Meningkatkan akurasi pemantauan risiko kelebihan cairan.</li>
          <li>Membantu deteksi dini pasien berisiko sebelum terjadi kegawatan.</li>
          <li>Menyediakan bahasa visual yang mudah dipahami pasien dan keluarga.</li>
          <li>Mendorong tindak lanjut yang lebih seragam sesuai zona risiko.</li>
          <li>Mendukung penurunan komplikasi akibat kelebihan cairan.</li>
        </ul>
      </article>
    </section>

    <section className="panel">
      <div className="section-heading"><h2><Activity /> Masalah yang dijawab</h2></div>
      <div className="problem-grid">
        {problemCards.map((item) => <article key={item.title}><strong>{item.title}</strong><p>{item.text}</p></article>)}
      </div>
    </section>

    <section className="panel">
      <div className="section-heading"><h2><Droplets /> Cara membaca zona risiko</h2></div>
      <div className="zone-explain-grid">
        {zones.map((item) => <article className={`zone-explain zone-${item.zone.toLowerCase()}`} key={item.zone}>
          <span>{item.zone}</span>
          <strong>{item.range}</strong>
          <b>{item.level}</b>
          <p>{item.action}</p>
        </article>)}
      </div>
    </section>

    <section className="about-grid">
      <article className="panel">
        <div className="section-heading"><h2><MonitorCheck /> Alur kerja aplikasi</h2></div>
        <ol className="manual-list">
          {workflow.map((item) => <li key={item}>{item}</li>)}
        </ol>
      </article>

      <article className="panel">
        <div className="section-heading"><h2><CheckCircle2 /> Manfaat yang diharapkan</h2></div>
        <ul className="clean-list">
          {benefits.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </article>
    </section>

    <section className="panel">
      <div className="section-heading"><h2><Users /> Menu dan kegunaan</h2></div>
      <div className="module-grid">
        {modules.map(([title, text]) => <article key={title}><strong>{title}</strong><p>{text}</p></article>)}
      </div>
    </section>

    <section className="panel">
      <div className="section-heading"><h2><BookOpen /> Manual penggunaan</h2></div>
      <ol className="manual-list manual-list-wide">
        {manual.map((item) => <li key={item}>{item}</li>)}
      </ol>
    </section>

    <section className="panel">
      <div className="section-heading"><h2><ShieldCheck /> Batasan keselamatan</h2></div>
      <div className="safety-note">
        <p>ZONASI-HD tidak menggantikan penilaian klinis tenaga kesehatan. Aplikasi ini membantu menghitung, memberi tanda risiko, mengingatkan tindak lanjut, dan mencatat riwayat. Semua tindakan tetap mengikuti SPO, kewenangan profesi, kondisi pasien, dan keputusan klinis unit.</p>
      </div>
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
        <p>Dikembangkan sebagai aplikasi pendukung pemantauan cairan pasien hemodialisis dengan pendekatan visual, preventif, dan mudah digunakan oleh petugas unit.</p>
      </div>
      <strong>MAROA Project</strong>
    </section>
  </>;
}
