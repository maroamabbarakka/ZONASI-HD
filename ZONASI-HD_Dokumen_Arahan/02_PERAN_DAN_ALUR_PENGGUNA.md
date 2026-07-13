# Peran dan Alur Pengguna ZONASI-HD

## 1. Matriks peran

| Peran | Fokus | Data yang dapat dilihat | Tindakan utama |
|---|---|---|---|
| Perawat | Pelayanan sesi | Pasien unit, jadwal, riwayat relevan | Input sesi, observasi, intervensi, handover |
| Supervisor | Pengendalian mutu shift | Seluruh data unit | Review, koreksi, eskalasi, penyelesaian alert |
| Dokter/DPJP | Keputusan klinis | Riwayat longitudinal dan alert | Review, rencana tindak lanjut, persetujuan berat kering |
| Ahli gizi | Edukasi dan nutrisi | Tren cairan dan hasil konseling | Konseling, target edukasi, follow-up |
| Registrasi | Administrasi pasien | Identitas minimum dan jadwal | Registrasi, jadwal, kontak |
| Rekam medis | Mutu data identitas | Demografi dan audit koreksi | Koreksi identitas terkontrol |
| Admin unit | Operasional aplikasi | Akun dan konfigurasi unit | Undangan, role, shift, template |
| Super admin | Multi-organisasi | Konfigurasi lintas unit | Organisasi, integrasi, retensi |
| Kepala unit/manajemen | Mutu dan kapasitas | Agregat; identitas bila berwenang | Analisis KPI, laporan |
| Auditor | Pemeriksaan | Audit log dan sampel terbatas | Review tanpa perubahan |
| Pasien | Data pribadi | Rapor pribadi | Lihat rapor, jadwal, edukasi |
| Keluarga/pengasuh | Data delegasi | Sesuai izin pasien | Lihat jadwal/rapor terbatas |

## 2. Alur perawat

### 2.1 Memulai shift

1. Login dengan MFA atau metode yang disetujui.
2. Pilih unit dan shift bila memiliki lebih dari satu assignment.
3. Dashboard menampilkan:
   - pasien terjadwal;
   - pasien telah datang;
   - sesi berjalan;
   - alert terbuka;
   - handover dari shift sebelumnya;
   - data belum lengkap.
4. Perawat mengakui handover.

### 2.2 Identifikasi pasien

Metode:

- scan QR kartu pasien;
- scan barcode gelang;
- cari RM;
- cari nama;
- pilih dari daftar jadwal.

Sebelum tindakan, tampilkan layar konfirmasi:

- nama lengkap;
- tanggal lahir;
- nomor RM sebagian tersamarkan;
- foto opsional;
- jadwal dan shift;
- zona terakhir;
- peringatan nama mirip.

### 2.3 Input pra-HD

Data minimum:

- waktu timbang;
- berat pra-HD;
- berat kering yang berlaku;
- sumber berat kering;
- keluhan pra-HD;
- status edema/sesak bila termasuk scope;
- tekanan darah bila modul diperluas;
- petugas dan alat timbang.

Sistem menampilkan:

- pratinjau IDWG;
- zona sementara;
- perbandingan sesi sebelumnya;
- peringatan nilai ekstrem;
- rekomendasi proses, bukan diagnosis otomatis.

### 2.4 Menjalankan dan menutup sesi

- simpan draft;
- tambahkan data intra-HD bila digunakan;
- input berat pasca-HD;
- UF aktual;
- komplikasi;
- intervensi;
- kondisi pulang;
- tutup sesi.

Sesi belum dianggap final sebelum validasi minimum terpenuhi.

### 2.5 Koreksi

Perawat tidak mengedit session final. Perawat memilih **Ajukan Koreksi**, memasukkan:

- field yang salah;
- nilai seharusnya;
- alasan;
- bukti pendukung bila kebijakan mengizinkan.

Supervisor menyetujui atau menolak. Sistem membuat correction record dan menghitung ulang summary.

## 3. Alur supervisor

### 3.1 Dashboard pengendalian

- pasien terjadwal dan hadir;
- sesi belum lengkap;
- sesi ganda potensial;
- alert baru;
- alert mendekati SLA;
- koreksi menunggu persetujuan;
- perubahan berat kering menunggu review;
- beban kerja perawat;
- mesin atau kursi yang belum terisi.

### 3.2 Penanganan alert

1. Buka alert.
2. Lihat pemicu dan sesi sumber.
3. Pilih **Terima penanganan**.
4. Lakukan asesmen awal.
5. Eskalasi bila perlu.
6. Catat tindakan.
7. Pilih outcome.
8. Tutup setelah kriteria selesai terpenuhi.

### 3.3 Review kualitas data

Supervisor memiliki daftar pengecualian:

- berat pasca tidak diisi;
- target UF tidak wajar;
- sesi melewati batas waktu;
- pasien tanpa sesi;
- perubahan data penting;
- alert tanpa catatan tindak lanjut.

## 4. Alur dokter

### 4.1 Daftar prioritas visite

Urutan default:

1. merah baru;
2. alert merah belum diterima;
3. kuning berulang;
4. tren memburuk;
5. berat kering berubah;
6. komplikasi berulang;
7. review terjadwal.

### 4.2 Review pasien

Tampilkan:

- ringkasan 4, 12, dan 30 sesi;
- dry weight history;
- rata-rata dan variasi IDWG;
- frekuensi zona;
- kepatuhan jadwal;
- intervensi sebelumnya;
- catatan perawat dan ahli gizi;
- alert timeline.

### 4.3 Rencana

Dokter dapat membuat rencana terstruktur:

- observasi;
- edukasi ulang;
- konsultasi gizi;
- evaluasi berat kering;
- target individual;
- pemeriksaan atau rujukan;
- jadwal review;
- instruksi petugas.

## 5. Alur ahli gizi

- menerima referral;
- melihat tren dan hambatan;
- melakukan asesmen edukasi;
- membuat target yang telah disetujui;
- memilih materi;
- mencatat pemahaman pasien;
- menetapkan follow-up;
- mengirim ringkasan yang boleh tampil di portal pasien.

## 6. Alur admin

### Akun

- undang pengguna;
- pilih role dan unit;
- tentukan tanggal mulai/akhir;
- wajibkan MFA;
- nonaktifkan;
- cabut sesi;
- audit perubahan role.

### Konfigurasi

- unit;
- shift;
- mesin;
- pola jadwal;
- jenis intervensi;
- jenis komplikasi;
- template laporan;
- branding;
- kebijakan portal pasien.

Konfigurasi klinis memiliki workflow persetujuan terpisah.

## 7. Alur pasien

1. Menerima rapor cetak atau kartu dengan QR.
2. Scan QR.
3. Verifikasi identitas atau perangkat.
4. Melihat ringkasan terbaru.
5. Membaca edukasi sesuai zona.
6. Melihat jadwal berikutnya.
7. Mengunduh rapor PDF.
8. Mengatur akses keluarga.
9. Melihat riwayat akses akun.
10. Melaporkan kartu/QR hilang untuk pencabutan.

## 8. Alur keluarga

- menerima undangan dari pasien atau petugas dengan consent;
- memiliki akun sendiri;
- melihat hanya kategori yang diizinkan;
- akses memiliki masa berlaku;
- pasien dapat mencabut akses;
- semua akses dicatat.

## 9. Empty state dan error state wajib

Setiap modul harus memiliki state:

- loading;
- berhasil tanpa data;
- berhasil dengan data;
- offline;
- sinkronisasi tertunda;
- izin ditolak;
- server error;
- data rusak;
- sesi kedaluwarsa.

Jangan menampilkan angka nol ketika sebenarnya data gagal dimuat.
