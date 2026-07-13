# ZONASI-HD

Command Center visual untuk pemantauan *Interdialytic Weight Gain* (IDWG) pasien hemodialisis. Aplikasi menghitung IDWG otomatis dan memetakan hasil ke zona sesuai proposal:

- Hijau: `< 3%`
- Kuning: `3%–5%`
- Merah: `> 5%`

## Status

MVP demonstrasi sudah dapat dijalankan penuh. Firebase project `zonasi-hd` telah dihubungkan untuk Email/Password Authentication dan pembacaan role dari `users/{uid}`. Data klinis masih disimpan sebagai data dummy di `localStorage`, sehingga belum boleh digunakan untuk data pasien nyata.

Fitur yang tersedia:

- login Firebase Email/Password dengan role Firestore, serta login simulasi untuk demo;
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

MVP ini sengaja tetap memakai data klinis dummy lokal agar langsung dapat didemonstrasikan. Sebelum penggunaan klinis, diperlukan migrasi data pasien/sesi/alert ke Firestore atau backend RS, security rules yang diuji, audit privasi, verifikasi klinis/SPO oleh komite terkait, audit akses, backup, monitoring, dan uji penerimaan pengguna.

Konfigurasi proyek aktif tersimpan di `.env.local` dan tidak ikut Git. Cache Firestore persisten belum diaktifkan karena perangkat yang menyimpan data medis harus melalui kebijakan perangkat tepercaya dan persetujuan privasi.

### Menyiapkan akun Firebase

1. Aktifkan **Authentication → Sign-in method → Email/Password**.
2. Buat akun petugas pada **Authentication → Users**.
3. Salin UID akun tersebut.
4. Buat dokumen Firestore `users/{uid}` dengan field:

```json
{
  "displayName": "Nama Petugas",
  "role": "PK_III",
  "unit": "Hemodialisis"
}
```

Nilai `role` yang diterima: `PK_II`, `PK_III`, `DOKTER`, atau `ADMIN`.

Deploy rules setelah Firestore dibuat:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

Rules saat ini hanya membuka dokumen profil pengguna kepada pemiliknya (dan Admin). Seluruh data klinis tetap ditolak sampai integrasi transaksi Firestore selesai diuji.

## Catatan klinis

Konten rekomendasi di layar adalah pengingat alur, bukan order medis. Aplikasi tidak menggantikan asesmen klinis, SPO rumah sakit, kewenangan profesi, atau instruksi DPJP.

Lihat [AUDIT_MVP.md](./AUDIT_MVP.md) untuk temuan audit dan keputusan implementasi.
