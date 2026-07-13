# Paket Arahan Pengembangan ZONASI-HD

## Tujuan paket dokumen

Paket ini adalah arahan produk, UX, klinis, keamanan, data, implementasi, dan pengujian untuk mengembangkan ZONASI-HD dari MVP pemantauan IDWG menjadi platform layanan hemodialisis yang lebih matang. Dokumen disusun agar dapat dipakai bersama oleh:

- pemilik produk;
- penanggung jawab klinis;
- perawat hemodialisis;
- dokter/DPJP;
- ahli gizi;
- administrator aplikasi;
- tim rekam medis;
- tim keamanan informasi;
- pengembang frontend dan backend;
- QA/UAT;
- manajemen fasilitas kesehatan.

> **Batas penting:** seluruh ambang, protokol, pesan edukasi, notifikasi, dan keputusan klinis harus disahkan oleh penanggung jawab klinis fasilitas. Dokumen ini menetapkan struktur sistem dan alur kerja, bukan menggantikan SOP klinis.

## Dokumen dalam paket

| Dokumen | Fokus |
|---|---|
| `01_VISI_RUANG_LINGKUP_PRODUK.md` | Visi produk, batas sistem, modul, dan prinsip desain |
| `02_PERAN_DAN_ALUR_PENGGUNA.md` | Kebutuhan perawat, supervisor, dokter, admin, ahli gizi, manajemen, pasien, dan keluarga |
| `03_RAPOR_PASIEN_PORTAL_REALTIME.md` | Spesifikasi rapor pasien daring, konten, status data, akses keluarga, dan notifikasi |
| `04_SPESIFIKASI_PDF_DAN_FOOTER_QR.md` | Tata letak rapor PDF dan footer QR menyerupai referensi yang diberikan |
| `05_KEAMANAN_QR_PRIVASI_DAN_AKSES.md` | Token QR, autentikasi, pencabutan, audit, consent, dan ancaman keamanan |
| `06_TEMPLATE_DAN_IMPOR_XLSX.md` | Template XLSX, validasi, dry-run, konflik, import job, dan laporan hasil |
| `07_MODEL_DATA_BACKEND_DAN_API.md` | Arsitektur target, model data, versioning klinis, transaksi, dan endpoint |
| `08_ALERT_DAN_WORKFLOW_KLINIS.md` | Mesin alert, status, eskalasi, koreksi data, dan handover |
| `09_DASHBOARD_LAPORAN_DAN_KPI.md` | Dashboard operasional, laporan mutu, indikator pasien, dan ekspor |
| `10_PENGUJIAN_UAT_DAN_KRITERIA_TERIMA.md` | Unit, integrasi, security rules, E2E, UAT, beban, dan acceptance criteria |
| `11_ROADMAP_IMPLEMENTASI.md` | Tahapan P0–P3, dependensi, rollout, migrasi, dan go-live |
| `12_BACKLOG_TEKNIS_DAN_DEFINITION_OF_DONE.md` | Epic, user story, task teknis, Definition of Ready, dan Definition of Done |

## Urutan penggunaan yang disarankan

1. Pemilik produk dan tim klinis menyepakati `01`, `02`, `03`, dan `08`.
2. Desainer dan frontend memakai `03` dan `04` sebagai dasar wireframe serta template PDF.
3. Tim keamanan meninjau `05` sebelum QR pasien dikembangkan.
4. Tim data dan backend memakai `06` serta `07` untuk implementasi.
5. Manajemen mutu menetapkan KPI di `09`.
6. QA menyusun test plan dari `10`.
7. Project manager menyusun sprint dari `11` dan `12`.

## Keputusan produk yang harus disahkan sebelum coding lanjutan

- Apakah ZONASI-HD hanya sistem monitoring IDWG atau menjadi modul HD yang lebih lengkap?
- Apakah portal pasien tersedia untuk seluruh pasien atau diluncurkan bertahap?
- Metode verifikasi portal: PIN, OTP, passkey, atau kombinasi?
- Apakah keluarga dapat memperoleh akses delegasi?
- Data apa saja yang boleh ditampilkan kepada pasien?
- Siapa yang berwenang mengubah berat kering?
- Apakah perubahan berat kering membutuhkan persetujuan dokter?
- Kapan hasil sesi dianggap “terverifikasi” dan boleh tampil di portal?
- Bagaimana definisi “alert selesai”?
- Berapa lama token QR berlaku dan kapan harus dicabut?
- Berapa lama data, audit log, dan file ekspor disimpan?
- Apakah aplikasi akan terintegrasi dengan SIMRS, timbangan, dan layanan pesan?

## Prinsip utama

1. **Sumber kebenaran klinis berada di backend tepercaya.**
2. **Catatan sesi tidak diubah diam-diam; koreksi memakai rekam koreksi.**
3. **Portal pasien hanya menampilkan data yang telah diotorisasi.**
4. **QR tidak menyimpan identitas pasien secara langsung.**
5. **Setiap akses dan perubahan penting dapat diaudit.**
6. **Data dimuat seperlunya berdasarkan unit, pasien, periode, dan hak akses.**
7. **Mode demo dipisahkan total dari produksi.**
8. **Aplikasi harus tetap jelas ketika offline, gagal sinkron, atau data belum lengkap.**
9. **Tidak ada fitur klinis yang dianggap selesai tanpa UAT pengguna nyata.**
10. **Aksesibilitas dan kemudahan penggunaan menjadi persyaratan, bukan tambahan.**
