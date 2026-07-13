# Pengujian, UAT, dan Kriteria Terima

## 1. Strategi pengujian

Lapisan:

1. unit test;
2. schema validation;
3. backend integration;
4. security rules/authorization;
5. end-to-end;
6. accessibility;
7. performance;
8. resilience;
9. security testing;
10. clinical UAT.

## 2. Unit test kalkulasi

- batas 2,9; 3,0; 5,0; 5,1;
- pembulatan;
- floating-point;
- nilai negatif;
- dry weight nol;
- nilai ekstrem;
- perubahan versi threshold;
- yellow streak urut;
- sesi terkoreksi;
- sesi duplikat;
- session out-of-order.

## 3. Backend session tests

- client memalsukan zone;
- client memalsukan IDWG;
- backend membaca dry weight terbaru;
- stale form menghasilkan conflict;
- idempotency mencegah duplikasi;
- timestamp server;
- patient nonaktif ditolak;
- user dari unit lain ditolak;
- correction recalculates summary.

## 4. Authorization tests

Untuk setiap role:

- read allowed;
- read denied;
- write allowed;
- write denied;
- cross-unit denied;
- inactive account denied;
- expired assignment denied;
- patient portal cannot access another patient;
- delegate scope enforced.

## 5. QR security tests

- token tidak dapat ditebak;
- revoked token;
- expired token;
- PIN brute force;
- OTP replay;
- session fixation;
- token bocor di referrer;
- cache control;
- QR fotokopi;
- phishing awareness;
- domain typo.

## 6. XLSX tests

- RM dengan nol awal;
- tanggal serial Excel;
- tanggal string;
- gender invalid;
- baris kosong;
- header salah;
- duplicate in file;
- duplicate database;
- file besar;
- macro file;
- formula cell;
- partial failure;
- retry;
- checksum duplicate job.

## 7. PDF tests

- A4 print;
- browser print;
- server PDF rendering;
- footer setiap halaman;
- tabel panjang;
- page number;
- QR scan dari layar;
- QR scan setelah print/fotokopi;
- grayscale;
- metadata;
- no hidden internal notes;
- language and disclaimer.

## 8. Alert tests

- trigger merah;
- trigger yellow streak;
- dedupe;
- transition invalid;
- SLA;
- reassignment;
- correction voids alert;
- handover;
- resolve requires outcome;
- audit timeline.

## 9. End-to-end scenarios

### Perawat

1. login;
2. pilih shift;
3. scan QR pasien;
4. verifikasi dua identitas;
5. input sesi;
6. lihat preview;
7. finalisasi;
8. alert dibuat;
9. handover.

### Dokter

1. buka prioritas;
2. review tren;
3. buat rencana;
4. set review date;
5. catatan tampil internal;
6. pesan terpilih tampil pasien.

### Pasien

1. scan QR;
2. PIN;
3. lihat rapor;
4. unduh PDF;
5. beri akses keluarga;
6. cabut perangkat;
7. token dicabut petugas.

## 10. Performance

Target harus disepakati. Contoh:

- dashboard awal < 3 detik pada koneksi standar;
- aksi save mendapat respons < 2 detik pada p95;
- daftar 1.000 pasien tetap responsif dengan pagination;
- tidak ada load seluruh session;
- PDF 2–5 halaman dihasilkan dalam batas yang disepakati;
- import 10.000 baris diproses sebagai job, bukan membekukan browser.

## 11. Resilience

- jaringan putus saat input;
- retry;
- browser refresh;
- dua tab;
- dua petugas edit pasien;
- backend timeout;
- notification provider gagal;
- PDF generation gagal;
- import worker restart;
- backup restore.

## 12. Accessibility

- WCAG target disepakati;
- keyboard-only;
- screen reader;
- focus modal;
- label form;
- error summary;
- kontras;
- grafik alternatif;
- ukuran teks;
- bahasa sederhana.

## 13. Clinical UAT

Peserta:

- perawat tiap shift;
- supervisor;
- dokter;
- ahli gizi;
- admin;
- pasien dengan variasi usia/literasi;
- keluarga;
- tim mutu.

UAT memakai data sintetis atau terdeidentifikasi sesuai kebijakan.

### Pertanyaan UAT

- apakah petugas menemukan pasien dengan cepat?
- apakah zona dan peringatan dipahami?
- apakah istilah membingungkan?
- apakah alert mendorong tindakan?
- apakah koreksi dapat dilakukan tanpa takut merusak data?
- apakah pasien memahami rapor tanpa bantuan?
- apakah QR mudah dipindai?
- apakah footer terbaca saat dicetak?

## 14. Go-live exit criteria

- P0 selesai;
- tidak ada critical/high defect terbuka;
- clinical sign-off;
- security sign-off;
- privacy sign-off;
- backup dan restore diuji;
- incident runbook tersedia;
- monitoring aktif;
- support roster tersedia;
- training selesai;
- rollback plan diuji;
- data migration tervalidasi.

## 15. Defect severity

- Critical: kebocoran data, salah pasien, salah hitung final, kehilangan data.
- High: alur klinis terblokir, alert tidak dibuat, akses salah.
- Medium: laporan salah non-klinis, UX berat.
- Low: kosmetik tanpa dampak fungsi.
