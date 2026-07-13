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

### Akun demo terisolasi

Produksi dapat menyediakan satu login demo berbasis environment tanpa membuat akun Firebase. UID demo selalu memakai data sintetis lokal dan tidak pernah berlangganan Firestore klinis. Konfigurasinya:

```env
VITE_DEMO_ACCOUNTS_ENABLED=true
VITE_DEMO_ACCOUNT_DOMAIN=zonasi-hd.app
VITE_DEMO_ACCOUNT_PASSWORD=ganti-dengan-password-demo
```

Nama akun dibentuk sebagai `{role}@{domain}` untuk role `perawat`, `supervisor`, `dokter`, dan `admin`. Nilai `VITE_*` tertanam pada bundle dan bukan rahasia. Mekanisme ini hanya aman karena akun demo tidak memberikan akses Firebase dan tidak boleh digunakan sebagai autentikasi data nyata.

### Preview tautan media sosial

Open Graph dan Twitter Card menggunakan cover absolut `https://zonasi-hd.web.app/cover-zonasi-hd.png` berukuran 1200×675. Metadata berada langsung pada `index.html`, sehingga dapat dibaca crawler tanpa menjalankan JavaScript. Jika platform masih menampilkan cache lama, lakukan scrape ulang melalui debugger platform atau bagikan URL sekali dengan query version, misalnya `https://zonasi-hd.web.app/?v=2`.

## Pemeriksaan kualitas

```bash
npm run typecheck
npm test
npm run test:rules:emulator
npm run build
npm run preview
```

Unit test meliputi rumus, batas zona tepat pada 3% dan 5%, input tidak valid, streak Kuning, serta matriks izin transaksi pada Firestore Emulator.

Backend tepercaya memiliki pemeriksaan terpisah:

```bash
npm install --prefix functions
npm run build --prefix functions
npm test --prefix functions
```

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

### Arsitektur aktif pada paket Spark

Penyimpanan sesi menggunakan satu transaksi atomik yang berisi sesi, materialized summary pasien, alert deterministik bila diperlukan, dan audit log. Firestore Rules menghitung ulang zona dari input berat dan berat kering tersimpan, memeriksa nilai IDWG, version snapshot, role, timestamp server, serta konsistensi seluruh dokumen dengan `getAfter()`.

Data Firebase memakai `calculation_authority: RULES_VERIFIED_CLIENT_V1` dan status awal `RECORDED`. Ini lebih kuat daripada validasi UI, tetapi tetap bukan backend server tepercaya.

App Check reCAPTCHA Enterprise telah disiapkan secara opsional. Untuk mengaktifkannya:

1. daftarkan aplikasi Web di **Firebase Console → App Check**;
2. masukkan site key ke `VITE_FIREBASE_APPCHECK_SITE_KEY` pada `.env.local`;
3. build dan deploy Hosting;
4. pantau metrik request terverifikasi terlebih dahulu;
5. aktifkan enforcement Cloud Firestore setelah semua perangkat operasional terverifikasi.

Jangan mengaktifkan enforcement sebelum site key terpasang pada build produksi karena seluruh request lama akan ditolak.

### Opsi upgrade trusted clinical backend

Kode callable `createClinicalSession` sudah tersedia. Backend memvalidasi role dan payload, membaca berat kering terkini, menghitung nilai klinis dari presisi mentah, lalu menulis sesi, ringkasan pasien, alert deduplikatif, dan audit log dalam satu transaksi idempoten.

Proyek Firebase harus memakai paket Blaze agar Cloud Build/Cloud Functions dapat diaktifkan. Lakukan aktivasi secara berurutan—jangan mengunci Rules sebelum fungsi berhasil:

```bash
firebase deploy --config firebase.functions.json --only functions:createClinicalSession --project zonasi-hd
```

Setelah deployment fungsi sukses:

1. tambahkan `VITE_TRUSTED_BACKEND_ENABLED=true` ke `.env.local`;
2. ganti nilai `firestore.rules` di `firebase.json` menjadi `firestore.trusted.rules`;
3. jalankan `npm run build`;
4. deploy `firebase deploy --only firestore:rules,hosting --project zonasi-hd`;
5. uji satu sesi sintetis, retry dengan `submission_id` sama, alert, dan audit log.

`firestore.trusted.rules` menolak browser membuat sesi/alert dan mengubah computed summary. Gunakan file tersebut hanya setelah Functions berhasil aktif. Rules utama saat ini adalah rules-verified transaction untuk paket Spark.

## Catatan klinis

Konten rekomendasi di layar adalah pengingat alur, bukan order medis. Aplikasi tidak menggantikan asesmen klinis, SPO rumah sakit, kewenangan profesi, atau instruksi DPJP.

Lihat [AUDIT_MVP.md](./AUDIT_MVP.md) untuk temuan audit dan keputusan implementasi.
