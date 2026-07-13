# Audit dan Penyelesaian MVP ZONASI-HD

Tanggal audit: 13 Juli 2026

## Kondisi awal

Folder berisi dokumen blueprint, satu file tipe, mesin kalkulasi IDWG, dan `ZoneBadge`. Komponen berikut belum tersedia: `package.json`, konfigurasi TypeScript/Vite, entry point, routing, halaman, state/data layer, form, dashboard, autentikasi, riwayat, chart, laporan, PWA, serta test. Folder juga belum merupakan repositori Git.

Dokumen lama memiliki beberapa karakter mojibake akibat encoding, tetapi rumus dan threshold masih dapat diidentifikasi.

## Risiko yang ditemukan dan diperbaiki

1. `calculateIDWG` menerima `NaN`, `Infinity`, dan pre-HD nol. Fungsi kini menolak nilai tidak hingga dan berat nonpositif.
2. Rekomendasi awal terlalu preskriptif mengenai UF dan oksigen. Teks aplikasi kini mengarahkan pengguna pada asesmen, kewenangan, SPO RS, dan instruksi medis.
3. Belum ada test pada titik batas. Test kini mencakup `<3`, `3`, `5`, dan `>5`.
4. Belum ada pembatasan role. Input sesi dibatasi untuk PK II/PK III; detail/checklist Merah dibatasi dari PK II; acknowledgement alert dibatasi untuk PK III/Dokter/Admin.
5. Tidak ada perlindungan penggunaan data nyata. Halaman login dan dokumentasi menegaskan mode data dummy.

## Arsitektur MVP

React 19, TypeScript strict, Vite, React Router, React Hook Form, Zod, Recharts, dan CSS responsif. `AppContext` menjadi data layer untuk mode demo dan menyimpan data secara persisten di browser. Perubahan antartab disinkronkan melalui event `storage`.

Mode demo dipilih untuk data klinis agar alur presentasi dapat diuji penuh. Setelah audit awal, Firebase project `zonasi-hd` dihubungkan untuk autentikasi Email/Password dan pembacaan profil role `users/{uid}`. Migrasi data klinis real-time ke Firestore masih menjadi tahap berikutnya.

## Verifikasi

- `npm run typecheck`: lulus
- `npm test`: 7 test lulus
- `npm run build`: lulus
- Audit dependensi saat instalasi: 0 vulnerability

## Sisa sebelum produksi klinis

- integrasi Firebase Auth/Firestore atau backend SIMRS;
- rules dan RBAC sisi server, bukan hanya UI;
- pencatatan audit yang immutable;
- validasi protokol oleh Komite Medik/Keperawatan dan penyesuaian SPO lokal;
- DPIA/audit privasi, kebijakan retensi, backup, dan recovery;
- pengujian aksesibilitas serta UAT di perangkat nurse station;
- strategi sinkronisasi offline yang menangani konflik dan duplikasi.
