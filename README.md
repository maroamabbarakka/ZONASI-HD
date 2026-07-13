# ZONASI-HD

Command Center visual untuk pemantauan *Interdialytic Weight Gain* (IDWG) pasien hemodialisis. Aplikasi menghitung IDWG otomatis dan memetakan hasil ke zona sesuai proposal:

- Hijau: `< 3%`
- Kuning: `3%–5%`
- Merah: `> 5%`

## Status

MVP demonstrasi sudah dapat dijalankan penuh. Firebase project `zonasi-hd` telah dihubungkan untuk Email/Password Authentication, role `users/{uid}`, serta sinkronisasi real-time pasien, sesi, dan alert. Login role demo tetap memakai data dummy terpisah di `localStorage`.

Fitur yang tersedia:

- login Firebase Email/Password dengan role Firestore, serta login simulasi untuk demo;
- master pasien dengan tambah/edit dan nomor RM unik;
- bulk import XLSX khusus Administrator dengan preview dan validasi;
- sinkronisasi pasien, sesi, dan alert secara real-time untuk pengguna Firebase;
- Command Center dengan kartu zona dan statistik;
- form sesi HD dengan preview IDWG real-time dan validasi;
- Early Warning untuk tiga sesi Kuning berturut-turut;
- alert sesi Merah dan acknowledgement berbasis role;
- protokol/checklist berbasis zona dan pembatasan protokol Merah;
- daftar pasien, grafik 12 sesi, dan riwayat;
- Kartu Kendali siap cetak;
- laporan ringkas dan ekspor CSV;
- manifest dan service worker dasar untuk PWA;
- tampilan responsif tablet/ponsel.

## Menjalankan aplikasi

Prasyarat: Node.js 20.19+ atau 22.12+.

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Pilih peran pada halaman login. Tombol **Reset data demo** mengembalikan data awal.

## Pemeriksaan kualitas

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

Unit test meliputi rumus, batas zona tepat pada 3% dan 5%, input tidak valid, dan streak Kuning.

## Batas MVP dan tahap produksi

Pengguna Firebase kini memakai Firestore, sedangkan login demo tetap lokal. Sebelum penggunaan klinis, tetap diperlukan audit privasi, verifikasi klinis/SPO oleh komite terkait, pengujian rules, backup, monitoring, dan uji penerimaan pengguna.

Konfigurasi proyek aktif tersimpan di `.env.local` dan tidak ikut Git. Cache Firestore persisten belum diaktifkan karena perangkat yang menyimpan data medis harus melalui kebijakan perangkat tepercaya dan persetujuan privasi.

### Menyiapkan akun Firebase

1. Aktifkan **Authentication → Sign-in method → Email/Password**.
2. Buat akun petugas pada **Authentication → Users**.
3. Salin UID akun tersebut.
4. Buat dokumen Firestore `users/{uid}` dengan field:

```json
{
  "displayName": "Nama Petugas",
  "role": "SUPERVISOR",
  "unit": "Hemodialisis"
}
```

Nilai role resmi:

- `PERAWAT`: input sesi dan monitoring;
- `SUPERVISOR`: master pasien, input sesi, protokol Merah, dan alert;
- `DOKTER`: supervisi, protokol, alert, dan laporan;
- `ADMIN`: akun, bulk import, master pasien, dan konfigurasi.

Role lama `PK_II` dan `PK_III` masih dibaca sebagai `PERAWAT` dan `SUPERVISOR` selama masa migrasi, tetapi dokumen baru harus memakai nama role resmi.

### Bulk import pasien

Menu **Pasien → Import XLSX** hanya muncul untuk `ADMIN`. File harus memiliki kolom nama pasien dan BB Kering. Nomor RM dan tanggal lahir wajib tersedia atau dilengkapi pada preview. Nama yang sama diperbolehkan; nomor RM yang sama ditolak melalui transaksi `patient_keys/{rm_normalized}`.

Deploy rules setelah Firestore dibuat:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

Rules saat ini hanya membuka dokumen profil pengguna kepada pemiliknya (dan Admin). Seluruh data klinis tetap ditolak sampai integrasi transaksi Firestore selesai diuji.

## Catatan klinis

Konten rekomendasi di layar adalah pengingat alur, bukan order medis. Aplikasi tidak menggantikan asesmen klinis, SPO rumah sakit, kewenangan profesi, atau instruksi DPJP.

Lihat [AUDIT_MVP.md](./AUDIT_MVP.md) untuk temuan audit dan keputusan implementasi.
