# Spesifikasi PDF Rapor dan Footer QR

## 1. Referensi visual

Arah visual mengikuti contoh rapor yang diberikan:

- header berwarna penuh;
- badan putih dengan kartu dan tabel;
- footer berwarna penuh pada setiap halaman;
- teks legal dan nomor halaman berada di kiri footer;
- QR berada di kanan footer dalam kotak putih;
- posisi dan ukuran footer konsisten antarhalaman.

## 2. Ukuran dokumen

- default: A4 portrait;
- margin isi: 14–18 mm;
- header: 24–32 mm;
- footer: 22–30 mm;
- area aman cetak mengikuti printer fasilitas;
- tidak ada informasi penting dalam area potong.

## 3. Grid

- 12 kolom untuk layout desktop/PDF;
- gutter 4–6 mm;
- kartu ringkasan dapat memakai 3 atau 4 kolom;
- tabel detail menggunakan seluruh lebar isi;
- footer berada di luar aliran konten dan tidak menimpa tabel.

## 4. Header

Isi:

- logo fasilitas;
- judul `RAPOR PASIEN ZONASI-HD`;
- nama unit/fasilitas;
- waktu pembaruan;
- versi dokumen atau status verifikasi;
- opsional nomor rapor.

Contoh:

```
RAPOR PASIEN ZONASI-HD
DIPERBARUI: 13 JULI 2026, 11.42 WITA
UNIT HEMODIALISIS — [NAMA FASILITAS]
```

## 5. Blok identitas

Tampilkan secukupnya:

- nama pasien;
- RM sebagian atau sesuai kebijakan;
- tanggal lahir;
- unit;
- periode rapor;
- DPJP bila diizinkan.

Hindari menampilkan NIK lengkap apabila tidak diperlukan.

## 6. Rangkuman indikator

Kartu minimum:

1. zona terkini;
2. IDWG terkini;
3. rata-rata IDWG periode;
4. kepatuhan jadwal atau indikator yang disahkan.

Setiap kartu memuat:

- label;
- nilai;
- status teks;
- ikon;
- bar visual opsional;
- keterangan singkat.

## 7. Tabel riwayat

Kolom yang disarankan:

| Tanggal | Pra-HD | Pasca-HD | BB kering digunakan | IDWG | Zona | Status |
|---|---:|---:|---:|---:|---|---|

- nilai menggunakan satuan jelas;
- sesi terkoreksi diberi label;
- data belum final tidak masuk PDF pasien;
- tabel memiliki header berulang pada halaman lanjutan.

## 8. Grafik

- grafik garis IDWG;
- ambang zona ditandai;
- legenda tekstual;
- perubahan berat kering diberi marker;
- tidak menggunakan warna saja;
- berikan ringkasan teks di bawah grafik.

## 9. Edukasi dan rekomendasi

Pisahkan:

- edukasi umum;
- pesan personal yang disetujui;
- jadwal follow-up;
- informasi kontak unit.

Jangan menggunakan bahasa menakutkan atau menyalahkan.

## 10. Footer

### 10.1 Komposisi

```
┌──────────────────────────────────────────────────────────────┐
│ Teks penerbit, disclaimer, waktu pembaruan      ┌─────────┐ │
│ HALAMAN 1 / 2                                   │ QR CODE │ │
│ Kode verifikasi dokumen                         └─────────┘ │
│                                      Scan rapor real-time    │
└──────────────────────────────────────────────────────────────┘
```

### 10.2 Area kiri

Urutan:

1. pernyataan penerbit;
2. disclaimer;
3. nomor halaman;
4. kode verifikasi atau versi;
5. opsional kontak unit.

Teks contoh:

> Hasil pemantauan diterbitkan dan dipertanggungjawabkan oleh Unit Hemodialisis [Nama Fasilitas]. Rapor ini merupakan sarana edukasi dan pemantauan, bukan pengganti konsultasi langsung dengan tenaga kesehatan.

### 10.3 Area kanan

- QR berukuran cetak 28–32 mm;
- minimum 25 mm bila kualitas printer terbatas;
- kotak putih solid;
- quiet zone minimal 4 modul QR;
- label: `PINDAI RAPOR REAL-TIME`;
- ikon gembok opsional;
- jangan letakkan QR di atas tekstur atau gradien.

### 10.4 Konsistensi

- footer muncul pada setiap halaman;
- URL QR portal pasien sama pada seluruh halaman dokumen yang sama;
- nomor halaman berubah otomatis;
- QR tidak terpotong saat print;
- footer halaman terakhir tetap konsisten.

## 11. QR dan dokumen

QR sebaiknya mengarah ke portal pasien permanen yang dapat dicabut, bukan langsung ke file PDF statis. Portal menyediakan:

- rapor terbaru;
- arsip rapor;
- verifikasi dokumen;
- status token;
- login aman.

PDF memiliki `document_id` sendiri. Portal dapat menerima parameter opsional untuk membuka rapor tertentu setelah autentikasi.

## 12. Kode verifikasi

Gunakan kode pendek non-sensitif, misalnya:

```
ZH-RPT-7K29P
```

Kode dapat dipakai petugas untuk memverifikasi keaslian melalui halaman resmi. Jangan gunakan RM atau tanggal lahir sebagai kode.

## 13. Warna dan cetak

- warna zona harus tetap terbaca dalam grayscale;
- gunakan label `HIJAU`, `KUNING`, `MERAH`;
- uji printer inkjet, laser, dan fotokopi;
- kontras footer minimal sesuai aksesibilitas;
- hindari teks kecil di bawah 8–9 pt;
- QR harus diuji setelah fotokopi.

## 14. PDF metadata

- title;
- author/facility;
- subject;
- creation date;
- document ID;
- version;
- classification internal/patient copy;
- PDF tidak mengandung data tersembunyi yang tidak dimaksudkan.

## 15. Pengamanan PDF

- file yang dikirim melalui pesan memakai tautan berumur pendek bila memungkinkan;
- hindari melampirkan PDF sensitif tanpa proteksi;
- watermark opsional `SALINAN PASIEN`;
- pencetakan dan unduhan dicatat;
- jangan mengandalkan password PDF sebagai satu-satunya kontrol.

## 16. Kriteria penerimaan footer

- QR terbaca pada cetak A4 100%, 90%, dan fotokopi;
- QR tidak tertutup margin printer;
- QR berada di kanan footer setiap halaman;
- teks legal berada di kiri;
- nomor halaman benar;
- domain QR resmi;
- token tidak memuat PII;
- token yang dicabut menampilkan halaman aman tanpa membocorkan pasien;
- footer tidak menimpa tabel panjang.
