# Visi, Ruang Lingkup, dan Prinsip Produk ZONASI-HD

## 1. Visi produk

ZONASI-HD menjadi platform pemantauan dan tindak lanjut pengendalian cairan pasien hemodialisis yang:

- cepat dipakai saat pelayanan;
- membantu petugas mengenali pasien yang memerlukan perhatian;
- memberi riwayat longitudinal yang dapat diaudit;
- menghubungkan perawat, supervisor, dokter, ahli gizi, manajemen, pasien, dan keluarga;
- menyediakan rapor pasien yang mudah dipahami;
- mengurangi kesalahan input dan salah identifikasi pasien;
- tetap menjaga privasi dan keamanan data kesehatan.

## 2. Masalah utama yang diselesaikan

### 2.1 Untuk unit HD

- Data IDWG tersebar di lembar manual atau sistem yang tidak memberi peringatan.
- Petugas sulit melihat tren pasien lintas sesi.
- Alert tidak memiliki alur eskalasi dan penyelesaian yang jelas.
- Perubahan berat kering tidak selalu terdokumentasi dengan baik.
- Manajemen sulit memperoleh indikator mutu yang konsisten.

### 2.2 Untuk pasien

- Pasien hanya menerima penjelasan lisan dan sulit mengingat hasil sesi.
- Pasien tidak memiliki akses mudah ke tren IDWG dan edukasi personal.
- Jadwal dan pengingat dapat terlewat.
- Keluarga yang membantu perawatan tidak memiliki akses resmi dan terbatas.

### 2.3 Untuk pengelola sistem

- Input massal pasien tidak memiliki template baku.
- Tidak ada audit lengkap terhadap perubahan dan ekspor.
- Data dapat dimuat terlalu luas dan tidak tersegmentasi per unit.
- Mode demo dan produksi berpotensi tertukar.

## 3. Batas produk

ZONASI-HD harus memilih salah satu dari dua posisi berikut.

### Opsi A — Sistem monitoring IDWG terfokus

Fitur inti:

- master pasien minimum;
- pencatatan berat dan sesi;
- perhitungan IDWG;
- zonasi;
- alert;
- tindak lanjut edukasi;
- rapor pasien;
- laporan mutu.

Data klinis lain tetap berada di SIMRS/rekam medis utama.

### Opsi B — Modul pelayanan HD lebih lengkap

Tambahan:

- tanda vital;
- akses vaskular;
- mesin dan dialyzer;
- komplikasi intradialisis;
- UF aktual;
- durasi;
- obat tertentu sesuai kebijakan;
- discharge status;
- dokumentasi multidisiplin.

> Rekomendasi: mulai dari **Opsi A yang kuat dan terintegrasi**, lalu memperluas secara bertahap. Jangan membuat sistem rekam medis penuh tanpa tata kelola, sumber daya, dan integrasi yang memadai.

## 4. Modul target

### 4.1 ZONASI-HD Clinical

Untuk perawat, supervisor, dokter, dan ahli gizi.

- daftar pasien hari ini;
- check-in dan identifikasi;
- input sesi;
- kalkulasi dan alert;
- riwayat pasien;
- tindak lanjut;
- koreksi terkontrol;
- handover;
- visite dokter;
- konseling gizi.

### 4.2 ZONASI-HD Management

Untuk kepala unit, mutu, manajemen, dan auditor.

- dashboard mutu;
- indikator per unit/shift/periode;
- waktu respons alert;
- kualitas data;
- laporan agregat;
- audit ekspor;
- pemantauan penggunaan sistem.

### 4.3 ZONASI-HD Patient

Untuk pasien dan keluarga yang diberi akses.

- rapor cairan;
- zona dan tren;
- jadwal berikutnya;
- edukasi personal;
- notifikasi;
- PDF rapor;
- QR aman;
- akses delegasi keluarga;
- laporan gejala non-darurat secara terstruktur.

### 4.4 ZONASI-HD Administration

- organisasi dan unit;
- akun dan role;
- konfigurasi shift;
- template intervensi;
- versi protokol;
- impor data;
- retensi dan audit;
- integrasi eksternal.

## 5. Prinsip pengalaman pengguna

### 5.1 Cepat saat pelayanan

- satu sesi dapat dimulai dalam maksimal tiga interaksi utama;
- pencarian mendukung nama, RM, QR, dan jadwal;
- form menampilkan nilai lama yang relevan;
- keyboard dan tablet harus didukung;
- tombol tindakan utama konsisten.

### 5.2 Kesalahan harus terlihat jelas

Sistem membedakan:

- data kosong;
- data belum tersedia;
- data tidak valid;
- data gagal dimuat;
- perangkat offline;
- sinkronisasi tertunda;
- hak akses ditolak.

### 5.3 Dua identitas sebelum tindakan

Sebelum membuat sesi:

- nama pasien;
- tanggal lahir atau RM;
- foto bila disetujui;
- jadwal hari itu.

### 5.4 Informasi sesuai peran

- pasien tidak melihat catatan internal;
- manajemen melihat agregat secara default;
- admin teknis tidak mengubah konfigurasi klinis tanpa persetujuan;
- keluarga hanya melihat data yang didelegasikan pasien.

## 6. Prinsip data klinis

- Nilai final dihitung di backend.
- Setiap sesi menyimpan `dry_weight_used`.
- Setiap sesi menyimpan versi formula dan threshold.
- Tanggal dan waktu final berasal dari server.
- Pencatatan memakai idempotency key.
- Summary pasien hanya ditulis backend.
- Alert dibuat backend dari data yang tervalidasi.
- Koreksi tidak menghapus rekam asli.
- Perubahan berat kering memiliki riwayat dan alasan.

## 7. Prinsip keamanan

- least privilege;
- pemisahan unit dan organisasi;
- MFA untuk role sensitif;
- audit akses dan ekspor;
- token QR acak dan dapat dicabut;
- tidak ada PII dalam QR;
- session timeout pada perangkat bersama;
- perangkat dan sesi dapat dicabut;
- demo tidak pernah memakai data nyata;
- data klinis tidak masuk cache umum service worker.

## 8. Indikator keberhasilan produk

### Operasional

- waktu rata-rata pencatatan sesi;
- persentase sesi lengkap;
- penurunan duplikasi input;
- penurunan kesalahan identifikasi;
- waktu respons alert;
- jumlah alert yang selesai sesuai SLA.

### Klinis dan edukasi

- persentase sesi zona hijau;
- tren rata-rata IDWG;
- pasien yang mendapat tindak lanjut setelah streak kuning;
- penyelesaian edukasi;
- kepatuhan jadwal sesuai definisi fasilitas.

### Pasien

- persentase pasien mengaktifkan portal;
- frekuensi akses rapor;
- keberhasilan login QR;
- kepuasan dan pemahaman pasien;
- jumlah akses keluarga yang sah.

### Teknis

- uptime;
- error rate;
- latency;
- keberhasilan backup dan restore;
- insiden keamanan;
- hasil pengujian rules dan penetrasi.
