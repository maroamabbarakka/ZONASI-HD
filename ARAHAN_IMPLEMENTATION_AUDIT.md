# Audit Implementasi Paket Arahan ZONASI-HD

Tanggal audit: 13 Juli 2026  
Basis: `ZONASI-HD_Dokumen_Arahan/00_INDEX.md` sampai `12_BACKLOG_TEKNIS_DAN_DEFINITION_OF_DONE.md`

## Kesimpulan eksekutif

Aplikasi saat ini adalah MVP monitoring IDWG yang layak untuk demonstrasi dan pilot teknis terbatas, tetapi **belum boleh dinyatakan siap go-live klinis dengan data pasien nyata**. Penyebab utama adalah hasil final, summary, dan alert masih ditulis oleh frontend. Paket arahan mensyaratkan backend tepercaya, audit server-side, unit-scoped authorization, correction workflow, backup/restore, serta sign-off klinis dan keamanan.

Tranche audit ini mengerjakan guardrail yang aman tanpa membuat klaim backend palsu:

- mode demo otomatis disembunyikan ketika Firebase produksi aktif;
- profil pengguna Firebase tidak lagi disimpan di `localStorage`;
- akun dengan `is_active: false` ditolak;
- security headers hosting ditambahkan;
- service worker hanya meng-cache shell allowlist, bukan seluruh GET;
- sesi baru memiliki `submission_id`, snapshot berat kering, versi formula/threshold/protokol, status, dan label authority;
- retry dengan `submission_id` yang sama tidak menggandakan sesi;
- dashboard membedakan loading/error dan menampilkan waktu freshness;
- denominator indikator diperjelas;
- XLSX menolak gender invalid, konflik RM, tanggal invalid, file non-XLSX, file >5 MB, dan >2.000 baris;
- tanggal Excel/string dinormalisasi tanpa default diam-diam;
- ekspor CSV dibatasi per role dan dinetralkan dari formula injection;
- CSP, HSTS, anti-frame, nosniff, referrer, permissions, dan cache policy dikonfigurasi.

## Matriks terhadap dokumen arahan

| Dokumen | Status | Implementasi saat ini | Gap utama |
|---|---|---|---|
| 00 Index/governance | Parsial | Batas klinis dicatat; mode demo/produksi dipisah | Owner, retensi, consent, SLA, dan clinical sign-off belum ditetapkan |
| 01 Visi/scope | Parsial | Opsi A: master pasien, sesi, IDWG, zona, alert, tren, laporan | Backend authority, organisasi/unit, correction, audit, schedule belum ada |
| 02 Peran/alur | Parsial | Perawat, supervisor, dokter, admin dan permission dasar | Ahli gizi, registrasi, rekam medis, auditor, pasien, keluarga, shift/handover belum ada |
| 03 Portal pasien | Belum dimulai | Kartu kendali internal responsif | Portal terautentikasi, published view, delegasi, device/session management belum ada |
| 04 PDF/footer QR | Belum dimulai | Browser print kartu kendali | Snapshot report, A4 multipage, QR aman, verification code, audit download belum ada |
| 05 QR/privacy | Fondasi saja | HTTPS hosting dan security headers | Token service, hash, PIN/OTP, revoke, rate limit, audit, penetration test belum ada |
| 06 XLSX | Parsial diperkuat | Preview/dry run lokal, validasi, konflik, import Firebase | Template 4 sheet, import job backend, checksum, malware scan, result workbook belum ada |
| 07 Backend/API | Model transisi | Metadata/versioning sesi dan idempotency client key | Trusted Clinical API/Functions, org/unit schema, audit service, pagination belum ada |
| 08 Alert | MVP saja | Alert merah/yellow streak dan acknowledge | State machine, SLA, assignment, dedupe episode, outcome, timeline, handover belum ada |
| 09 KPI/report | Parsial diperkuat | Filter periode, denominator sesi, CSV aman | Aggregate backend, audit ekspor, de-identification, KPI operasional lengkap belum ada |
| 10 Testing/UAT | Parsial | 16 unit tests, typecheck, build, visual responsive | Emulator rules, E2E, a11y automation, load, resilience, security, clinical UAT belum ada |
| 11 Roadmap | P0 frontend guardrail | Security/cache/demo hardening selesai | P0 backend dan governance wajib sebelum P1 data nyata |
| 12 Backlog/DoD | Parsial | Validation, error state, responsive, tests, docs | Code review eksternal, monitoring, audit, rollback drill, UAT/sign-off belum ada |

## Keputusan yang wajib disahkan

Jangan mengaktifkan fitur terkait berikut sebelum keputusan tertulis tersedia:

1. Clinical owner dan product owner.
2. Threshold/formula/protocol version yang disahkan.
3. Status kapan sesi menjadi `VERIFIED` dan siapa verifier-nya.
4. Kewenangan serta approval perubahan berat kering.
5. State, SLA, outcome minimum, dan definisi alert selesai.
6. Scope data yang boleh tampil kepada pasien/keluarga.
7. Model consent dan masa berlaku delegasi.
8. Metode portal: QR+PIN, OTP, passkey, serta vendor yang disetujui.
9. Retensi session, audit, PDF, import file, token, dan device log.
10. Organisasi/unit pilot serta assignment pengguna.
11. Backup, restore, incident response, support roster, dan rollback owner.

## Temuan teknis prioritas

### Critical sebelum data nyata

- `saveSessionFirestore()` masih menghitung dan menulis hasil final dari browser.
- Firestore Rules dapat memeriksa bentuk/snapshot, tetapi tidak menggantikan backend tepercaya.
- Summary pasien dan alert masih dibuat client.
- Data belum berstruktur `organizations/{orgId}/units/{unitId}` sehingga cross-unit isolation belum dapat dibuktikan.
- Belum ada audit log server-side yang immutable.

### High

- Session final belum memiliki correction/void workflow.
- Alert hanya boolean acknowledge, belum state machine dan outcome.
- Query masih subscription seluruh patient/session/alert yang dapat dibaca role.
- Import berjalan per baris di browser, belum job retry-safe dengan checksum.
- Perubahan berat kering masih update langsung.

### Medium

- Belum ada template XLSX 4-sheet yang dikelola versi.
- Belum ada automated accessibility/E2E/resilience test.
- Report belum snapshot-reproducible.
- Belum ada monitoring biaya/read Firestore dan error telemetry tersanitasi.

## Arsitektur target yang direkomendasikan

1. Tambahkan Firebase Functions/Cloud Run sebagai Trusted Clinical API.
2. Frontend hanya mengirim input mentah dan `submission_id`.
3. Backend membaca patient/dry-weight terkini dalam transaction.
4. Backend menghitung IDWG/zona dan menyimpan version snapshot.
5. Backend memperbarui materialized summary, dedupe alert, dan audit dalam workflow terkontrol.
6. Migrasikan data ke struktur organization/unit.
7. Tolak direct client write untuk computed fields, summary, alert, correction, dan report.
8. Gunakan emulator suite untuk authorization matrix tiap role/unit.

Label `calculation_authority: CLIENT_MVP` sengaja disimpan pada sesi saat ini agar data transisi tidak keliru dianggap hasil backend. Setelah API tepercaya aktif, gunakan authority/version baru dan migrasi terkontrol; jangan sekadar mengganti label lama.

## Urutan implementasi berikutnya

### P0-A — Governance

- sahkan 11 keputusan di atas;
- tetapkan data classification dan threat model;
- buat environment staging terpisah;
- tetapkan synthetic UAT dataset.

### P0-B — Trusted backend

- create-session callable/API;
- schema validation dan idempotency store;
- dry-weight snapshot/version;
- summary dan alert server-side;
- audit event;
- unit authorization;
- correction workflow;
- emulator tests;
- backup/restore drill.

#### Status implementasi 13 Juli 2026

- Selesai di kode: callable v2 `createClinicalSession`, validasi schema ketat, authorization role aktif, idempotency berbasis `submission_id`, dry-weight snapshot/version, kalkulasi presisi mentah, transaction untuk session/summary/alert/audit, dan unit test batas klinis.
- Selesai di frontend: integrasi callable di balik `VITE_TRUSTED_BACKEND_ENABLED`; mode demo tetap memakai kalkulasi lokal berlabel `CLIENT_MVP`.
- Siap aktivasi: `firestore.trusted.rules` menutup direct client write untuk session, computed summary, alert creation, dan audit.
- Blokir eksternal: deployment Functions ditolak karena proyek `zonasi-hd` masih paket Spark; Cloud Build memerlukan Blaze. Karena fungsi belum aktif, flag produksi dan trusted Rules belum diaktifkan demi menjaga layanan live.
- Belum selesai dalam P0-B: correction/void workflow, organization/unit isolation, emulator authorization matrix, backup/restore drill, dan App Check enforcement.

#### Jalur Spark tanpa Functions

- Transaksi browser kini wajib menulis session, patient summary, alert deterministik, dan audit log secara atomik.
- Firestore Rules menghitung ulang IDWG/zona dari input dan dry-weight tersimpan, memvalidasi snapshot/version, timestamp server, role, summary, alert, dan audit memakai `getAfter()`.
- Authority sesi Spark adalah `RULES_VERIFIED_CLIENT_V1` dengan status awal `RECORDED`; label ini sengaja dibedakan dari trusted backend.
- Matriks Firestore Emulator mencakup transaksi Merah valid, streak Kuning ke-3, manipulasi zona, audit hilang, role tanpa izin, dan acknowledgement.
- App Check Web siap melalui konfigurasi environment, tetapi enforcement menunggu site key dan observasi traffic produksi.
- Rules-verified transaction dan Hosting telah dideploy pada proyek Spark `zonasi-hd` tanggal 13 Juli 2026.

### P1 — Operasional unit

- schedule/shift/check-in;
- identifikasi dua faktor pasien;
- dashboard exception;
- alert state machine/SLA/handover;
- dry-weight approval;
- import job dan template 4-sheet.

### P2 — Rapor dan portal

- report snapshot dan PDF A4;
- opaque QR token service;
- PIN/OTP/rate limit/revoke;
- published patient view;
- audit login/view/download;
- delegation dan device management;
- security test sebelum pilot pasien.

## Exit criteria untuk menghapus label “MVP/demo”

- backend menjadi authority untuk semua computed clinical data;
- cross-unit deny tests lulus;
- session correction dan alert lifecycle lulus;
- audit kritis direkonsiliasi;
- backup/restore terbukti;
- no critical/high defect;
- clinical, security, dan privacy sign-off;
- UAT perawat/supervisor/dokter/pasien selesai;
- incident runbook, monitoring, support, dan rollback aktif.
