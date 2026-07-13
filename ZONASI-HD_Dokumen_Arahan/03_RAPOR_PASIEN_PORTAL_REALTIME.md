# Spesifikasi Rapor Pasien dan Portal Real-Time

## 1. Tujuan

Rapor pasien adalah ringkasan yang membantu pasien memahami hasil pemantauan cairan dan tren pelayanan. Rapor bukan pengganti konsultasi langsung dan tidak boleh menampilkan interpretasi yang belum diverifikasi.

## 2. Kanal

- portal web responsif;
- PWA pasien;
- PDF cetak;
- PDF unduhan;
- QR pada footer setiap halaman;
- notifikasi tautan aman.

## 3. Struktur halaman portal

### 3.1 Header

- logo fasilitas dan ZONASI-HD;
- nama layanan;
- nama pasien atau inisial sesuai pengaturan privasi;
- status data;
- waktu pembaruan terakhir;
- tombol bantuan dan keluar.

### 3.2 Kartu status utama

```
RAPOR CAIRAN SAYA
Zona terakhir: KUNING
IDWG: 3,8%
Sesi: 13 Juli 2026, 10.42 WITA
Status: Terverifikasi petugas
```

Gunakan warna, ikon, label teks, dan penjelasan. Jangan hanya mengandalkan warna.

### 3.3 Pesan utama

Pesan harus:

- singkat;
- tidak menghakimi;
- sesuai protokol;
- memiliki sumber/penanggung jawab;
- membedakan edukasi umum dan instruksi personal.

Contoh struktur:

- **Apa artinya?**
- **Apa yang perlu dilakukan?**
- **Kapan harus menghubungi unit?**
- **Jadwal evaluasi berikutnya.**

### 3.4 Ringkasan sesi terakhir

- tanggal dan waktu;
- berat pra-HD;
- berat pasca-HD bila sudah final;
- berat kering yang digunakan;
- IDWG;
- zona;
- target/hasil relevan yang disetujui untuk pasien;
- status verifikasi.

### 3.5 Grafik tren

Pilihan:

- 4 sesi;
- 12 sesi;
- 30 sesi;
- 3 bulan;
- 6 bulan.

Grafik menampilkan:

- IDWG per sesi;
- garis ambang;
- perubahan berat kering;
- marker sesi terkoreksi;
- tooltip tanggal dan hasil;
- alternatif tabel untuk aksesibilitas.

### 3.6 Rapor bulanan

| Indikator | Nilai |
|---|---:|
| Sesi terjadwal | 12 |
| Sesi diikuti | 12 |
| Rata-rata IDWG | 3,2% |
| Hijau | 7 |
| Kuning | 4 |
| Merah | 1 |
| Tren | Membaik |
| Edukasi selesai | 3 dari 4 |

Jangan membuat leaderboard antar-pasien.

### 3.7 Jadwal

- sesi berikutnya;
- unit dan shift;
- perubahan jadwal;
- status konfirmasi hadir;
- tombol hubungi unit;
- panduan kedatangan.

### 3.8 Edukasi personal

Materi berdasarkan:

- zona;
- bahasa pilihan;
- literasi;
- hambatan pasien;
- rekomendasi ahli gizi;
- materi yang belum selesai.

Format:

- kartu pendek;
- audio;
- video;
- infografis;
- kuis singkat;
- tombol “saya sudah memahami”.

### 3.9 Dokumen

- rapor terbaru;
- arsip bulanan;
- kartu kendali;
- materi edukasi;
- ringkasan konsultasi yang disetujui.

## 4. Status data

Setiap hasil memiliki salah satu status:

- `DRAFT` — belum final, tidak tampil ke pasien;
- `RECORDED` — dicatat petugas, hanya internal;
- `VERIFIED` — lolos pemeriksaan dan boleh tampil;
- `REVIEWED` — telah direview klinis;
- `CORRECTED` — memiliki koreksi;
- `VOIDED_WITH_REASON` — dibatalkan tanpa menghapus rekam.

Portal hanya menampilkan data sesuai kebijakan, umumnya `VERIFIED` atau `REVIEWED`.

## 5. Real-time

“Real-time” berarti portal menerima pembaruan segera setelah backend menandai data layak ditampilkan. Tampilkan selalu:

- terakhir diperbarui;
- status koneksi;
- apakah data terbaru berhasil disinkronkan.

Jika offline:

> Data yang terlihat terakhir diperbarui pada 13 Juli 2026, 11.42 WITA. Hubungkan perangkat ke internet untuk memperoleh pembaruan.

## 6. Akses pasien

Metode dukungan:

- QR + PIN;
- QR + OTP;
- akun nomor HP/email;
- passkey;
- perangkat terpercaya.

Rekomendasi tahap awal:

1. scan QR;
2. masukkan PIN pasien;
3. OTP pada perangkat baru atau risiko tinggi;
4. sesi portal berlaku terbatas;
5. logout otomatis pada perangkat publik.

## 7. Akses keluarga

Pasien dapat memberi akses:

- jadwal saja;
- ringkasan zona;
- rapor lengkap pasien;
- notifikasi;
- masa berlaku.

Keluarga menggunakan akun sendiri. Jangan membagikan satu PIN pasien untuk seluruh keluarga.

## 8. Fitur self-service

- ganti PIN;
- laporkan QR hilang;
- cabut perangkat;
- lihat riwayat login;
- atur notifikasi;
- unduh data pribadi sesuai kebijakan;
- ajukan koreksi identitas;
- kelola consent keluarga.

## 9. Notifikasi

Jenis:

- pengingat jadwal;
- perubahan jadwal;
- rapor baru tersedia;
- edukasi baru;
- permintaan menghubungi unit;
- akses baru dari perangkat;
- akses keluarga diberikan/dicabut.

Notifikasi tidak boleh menampilkan data sensitif pada layar terkunci. Contoh aman:

> Pembaruan rapor ZONASI-HD tersedia. Buka portal untuk melihat detail.

## 10. Konten yang tidak ditampilkan ke pasien

- catatan internal;
- dugaan yang belum dikomunikasikan;
- komentar antarpersonel;
- audit log internal;
- konfigurasi protokol;
- data pasien lain;
- identitas petugas yang tidak diperlukan;
- data draft dan data gagal validasi.

## 11. Accessibility

- kontras memadai;
- teks dapat diperbesar;
- navigasi keyboard;
- label pembaca layar;
- grafik memiliki ringkasan tekstual;
- bahasa sederhana;
- opsi Bahasa Indonesia dan bahasa lokal bila disiapkan;
- tidak bergantung pada merah-hijau saja.

## 12. Acceptance criteria portal

- QR membuka domain resmi melalui HTTPS.
- Pengguna tidak dapat melihat data sebelum verifikasi.
- Pasien hanya melihat data miliknya.
- Data draft tidak terlihat.
- Perubahan final muncul tanpa reload penuh.
- Riwayat dokumen dapat diunduh.
- Token yang dicabut langsung tidak dapat digunakan.
- Seluruh login dan unduhan tercatat.
- Portal bekerja pada layar mobile kecil.
- Pasien dapat keluar dan menghapus kepercayaan perangkat.
