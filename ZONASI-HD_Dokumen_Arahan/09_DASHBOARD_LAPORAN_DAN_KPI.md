# Dashboard, Laporan, dan KPI

## 1. Prinsip

- setiap angka memiliki definisi dan denominator;
- periode selalu terlihat;
- data gagal dimuat tidak tampil sebagai nol;
- identitas pasien hanya muncul ketika diperlukan;
- manajemen melihat agregat secara default;
- ekspor sensitif diaudit.

## 2. Dashboard perawat

Kartu utama:

- pasien terjadwal hari ini;
- sudah hadir;
- sedang HD;
- selesai;
- belum datang;
- sesi belum lengkap;
- alert untuk shift;
- handover belum diterima.

Daftar kerja:

| Waktu | Pasien | Mesin | Status | Zona terakhir | Aksi |
|---|---|---|---|---|---|

## 3. Dashboard supervisor

- kapasitas dan okupansi;
- beban per perawat;
- sesi tidak lengkap;
- alert overdue;
- koreksi menunggu;
- perubahan berat kering;
- kualitas data;
- pasien tanpa follow-up.

## 4. Dashboard dokter

- merah baru;
- kuning berulang;
- tren memburuk;
- review berat kering;
- referral menunggu;
- pasien prioritas visite;
- rencana yang jatuh tempo.

## 5. Dashboard ahli gizi

- referral baru;
- pasien kuning/merah belum konseling;
- follow-up jatuh tempo;
- edukasi belum selesai;
- tren setelah konseling.

## 6. Dashboard pasien

- zona terbaru;
- IDWG terbaru;
- tren singkat;
- jadwal berikutnya;
- pesan petugas;
- materi edukasi;
- status rapor.

## 7. KPI operasional

### Kehadiran

```
Attendance rate = sesi dihadiri / sesi terjadwal valid
```

Pisahkan:

- batal oleh fasilitas;
- pasien tidak hadir;
- reschedule;
- rawat inap;
- sebab lain.

### Kelengkapan sesi

```
Complete session rate = sesi final lengkap / seluruh sesi yang dimulai
```

### Waktu pencatatan

- median waktu dari timbang ke save;
- median waktu dari selesai ke finalisasi.

## 8. KPI IDWG

### Proporsi hijau

Definisi contoh:

```
jumlah sesi valid zona hijau / seluruh sesi valid dalam periode
```

Jangan mencampur denominator pasien dan sesi.

### Rata-rata IDWG

- mean;
- median;
- distribusi;
- per pasien;
- per unit;
- per periode.

### Yellow streak

- jumlah episode;
- pasien terdampak;
- persentase dengan tindak lanjut;
- waktu tindak lanjut.

### Zona merah

- jumlah sesi merah;
- pasien unik;
- alert dibuat;
- response time;
- outcome.

## 9. KPI alert

- time to acknowledge;
- time to assessment;
- time to resolve;
- overdue rate;
- reopen rate;
- alert per 100 sesi;
- false/voided alert rate;
- action completion.

## 10. KPI portal pasien

- aktivasi portal;
- login aktif bulanan;
- scan QR berhasil;
- kegagalan verifikasi;
- unduhan rapor;
- edukasi diselesaikan;
- akses delegasi;
- perangkat dicabut;
- kepuasan pengguna.

## 11. Filter laporan

- periode;
- organisasi;
- unit;
- shift;
- status pasien;
- dokter;
- perawat;
- zona;
- alert status;
- kelompok umur;
- jenis kelamin bila relevan dan disetujui.

## 12. Laporan standar

1. Laporan harian shift.
2. Laporan bulanan IDWG.
3. Laporan alert dan SLA.
4. Laporan kualitas data.
5. Laporan perubahan berat kering.
6. Laporan edukasi dan konseling.
7. Laporan penggunaan portal.
8. Laporan audit ekspor.
9. Rapor pasien individual.
10. Ringkasan manajemen tanpa identitas.

## 13. Ekspor

Format:

- PDF;
- XLSX;
- CSV terkontrol.

Kontrol:

- role tertentu;
- alasan ekspor;
- filter terlihat pada file;
- waktu dan pembuat;
- watermark;
- audit;
- sanitasi formula;
- opsi de-identification;
- masa berlaku tautan unduh.

## 14. Definisi “pasien belum ada sesi”

Dashboard harus menampilkan kategori terpisah:

- belum pernah sesi;
- tidak ada sesi dalam periode;
- data gagal dimuat;
- pasien nonaktif.

Jangan memaksa pasien tersebut masuk zona hijau.

## 15. Data freshness

Setiap dashboard menampilkan:

- waktu update terakhir;
- status subscription;
- jumlah data yang gagal;
- status partial data;
- tombol retry.

## 16. Acceptance criteria

- seluruh KPI memiliki definisi terdokumentasi;
- filter periode wajib;
- denominator terlihat;
- empty/error state jelas;
- data manajemen terdeidentifikasi secara default;
- ekspor diaudit;
- CSV aman dari formula injection;
- laporan dapat direproduksi dari snapshot/version;
- rapor pasien hanya memuat data published.
