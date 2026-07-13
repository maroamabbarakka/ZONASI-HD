# Spesifikasi Template dan Impor XLSX

## 1. Tujuan

Menyediakan template yang konsisten, mudah diisi, tidak merusak nomor RM, memiliki validasi, dan menghasilkan laporan error yang dapat diperbaiki.

## 2. Tombol pada aplikasi

- `Unduh Template XLSX`;
- `Unggah File`;
- `Validasi`;
- `Lihat Kesalahan`;
- `Dry Run`;
- `Mulai Impor`;
- `Unduh Hasil Impor`;
- `Batalkan Job` bila belum commit;
- `Lanjutkan Job` bila proses terputus.

## 3. Struktur workbook

### Sheet `MASTER_PASIEN`

Data utama.

### Sheet `PETUNJUK`

- deskripsi kolom;
- contoh;
- nilai yang diperbolehkan;
- format;
- peringatan privasi;
- versi template.

### Sheet `REFERENSI`

- jenis kelamin;
- status pasien;
- unit;
- shift;
- pola jadwal;
- bahasa;
- nilai enum lain.

### Sheet `CHANGELOG_TEMPLATE`

- versi;
- tanggal;
- perubahan kolom;
- kompatibilitas.

## 4. Template minimum

| Header | Wajib | Tipe | Aturan | Contoh |
|---|---:|---|---|---|
| `rm` | Ya | Text | unik; pertahankan nol awal | `00012345` |
| `nama_pasien` | Ya | Text | 2–150 karakter | `Siti Aminah` |
| `tanggal_lahir` | Ya | Date/String | `YYYY-MM-DD` | `1975-08-21` |
| `jenis_kelamin` | Ya | Enum | `L` atau `P` | `P` |
| `bb_kering_kg` | Ya | Decimal | rentang disahkan klinis | `52.5` |
| `catatan` | Tidak | Text | maks. 500 | `...` |

## 5. Template perluasan

| Header | Wajib | Catatan |
|---|---:|---|
| `unit_code` | Ya pada multi-unit | bukan nama bebas |
| `status_pasien` | Ya | `AKTIF`/`NONAKTIF` |
| `pola_jadwal` | Tidak | `SRJ`, `SKS`, `KHUSUS` |
| `shift_default` | Tidak | referensi master |
| `tanggal_mulai_hd` | Tidak | `YYYY-MM-DD` |
| `dpjp_code` | Tidak | gunakan kode master |
| `nomor_hp_pasien` | Tidak | validasi dan consent |
| `nama_penanggung_jawab` | Tidak | data delegasi terpisah lebih baik |
| `nomor_hp_penanggung_jawab` | Tidak | jangan otomatis memberi akses |
| `bahasa_preferensi` | Tidak | kode bahasa |

## 6. Aturan format Excel

- kolom RM diformat `Text`;
- tanggal memakai format ISO;
- decimal memakai nilai numerik, bukan teks `52 kg`;
- tidak ada merged cells pada sheet data;
- header tepat satu baris;
- tidak ada formula pada data;
- baris kosong diabaikan;
- hidden sheet tidak diproses kecuali sheet resmi;
- macro-enabled file ditolak;
- file ekstensi `.xlsx` saja pada tahap awal.

## 7. Validasi per field

### RM

- trim spasi;
- normalisasi kebijakan yang jelas;
- jangan hilangkan nol awal;
- karakter yang diizinkan ditetapkan;
- cek duplikat dalam file;
- cek duplikat database;
- tampilkan konflik, jangan diam-diam overwrite.

### Nama

- tidak kosong;
- normalisasi whitespace;
- jangan mengubah kapitalisasi tanpa preview;
- cegah karakter kontrol;
- pertahankan tanda baca nama yang sah.

### Tanggal lahir

- valid date;
- tidak di masa depan;
- umur masuk akal;
- serial Excel dikonversi secara aman;
- timezone tidak menggeser tanggal.

### Jenis kelamin

- hanya nilai enum;
- nilai kosong atau tidak dikenal menjadi error;
- jangan default ke `L` atau `P`.

### Berat kering

- numeric;
- rentang klinis;
- jumlah desimal;
- perubahan pada pasien existing memerlukan workflow khusus;
- impor biasa tidak boleh menimpa berat kering tanpa approval.

## 8. Strategi konflik

Saat RM sudah ada:

- `SKIP`;
- `UPDATE_ADMIN_ONLY`;
- `REVIEW_MANUALLY`;
- `CREATE_CORRECTION_REQUEST`;
- tidak ada `OVERWRITE_ALL` sebagai default.

Field sensitif:

- berat kering;
- status aktif;
- unit;
- identitas utama.

Field tersebut memerlukan aturan dan audit khusus.

## 9. Dry run

Dry run tidak menulis data. Hasil:

- jumlah baris;
- valid;
- warning;
- error;
- konflik;
- estimasi perubahan;
- daftar field yang akan diubah;
- versi template;
- checksum file.

## 10. Import job

```json
{
  "job_id": "uuid",
  "file_name": "master_pasien.xlsx",
  "file_sha256": "...",
  "template_version": "PATIENT_IMPORT_V2",
  "status": "VALIDATED",
  "created_by": "uid",
  "created_at": "server time",
  "total_rows": 100,
  "valid_rows": 92,
  "warning_rows": 4,
  "error_rows": 4,
  "strategy": "SKIP_EXISTING"
}
```

Status:

- `UPLOADED`;
- `PARSING`;
- `VALIDATED`;
- `AWAITING_CONFIRMATION`;
- `RUNNING`;
- `PARTIAL_SUCCESS`;
- `COMPLETED`;
- `FAILED`;
- `CANCELLED`.

## 11. Laporan hasil

Sheet/CSV hasil:

| Row | RM | Status | Field | Pesan | Aksi |
|---:|---|---|---|---|---|
| 2 | 00012345 | SUCCESS | — | Pasien dibuat | — |
| 3 | 00012346 | ERROR | tanggal_lahir | Format salah | Perbaiki |
| 4 | 00012347 | CONFLICT | rm | Sudah ada | Review |

## 12. Keamanan file

- batas ukuran;
- batas baris;
- scan malware;
- jangan menjalankan macro;
- file disimpan sementara dan dihapus sesuai retensi;
- akses file terbatas;
- nama file disanitasi;
- formula injection dicegah pada file hasil;
- data import tidak dikirim ke analytics pihak ketiga.

## 13. UX impor

- progress bar;
- dapat meninggalkan halaman tanpa kehilangan job;
- notifikasi saat selesai;
- preview 20–100 baris;
- filter error;
- klik error menuju baris;
- penjelasan dalam bahasa sederhana;
- tombol unduh template selalu terlihat.

## 14. Acceptance criteria

- nol awal RM tidak hilang;
- gender invalid ditolak;
- tanggal serial Excel benar;
- duplikat file terdeteksi;
- duplikat database tidak ditimpa otomatis;
- dry run tidak menulis data;
- retry tidak menggandakan pasien;
- hasil dapat diunduh;
- audit mencatat job;
- file besar ditolak secara ramah;
- perubahan berat kering mengikuti approval.
