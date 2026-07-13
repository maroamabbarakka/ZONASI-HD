# Roadmap Implementasi

## 1. Prinsip rollout

- jangan mengaktifkan portal pasien sebelum keamanan QR selesai;
- jangan memakai data nyata sebelum backend tepercaya dan audit siap;
- mulai satu unit pilot;
- gunakan feature flag;
- ukur hasil tiap fase;
- sediakan rollback.

## 2. Fase 0 — Governance dan keputusan

Durasi indikatif: 2–4 minggu.

Output:

- product owner;
- clinical owner;
- data protection/security owner;
- scope Opsi A/B;
- definisi threshold;
- protokol alert;
- data visibility pasien;
- consent model;
- kebijakan retensi;
- arsitektur disetujui;
- risiko dan mitigasi.

## 3. Fase P0 — Hardening inti

Fokus:

- backend trusted calculation;
- dry weight snapshot/version;
- idempotency;
- audit log;
- unit-scoped access;
- account lifecycle;
- demo-production separation;
- correction workflow;
- backup/restore;
- monitoring;
- rules tests.

Exit criteria:

- data klinis final tidak dapat dipalsukan client;
- seluruh write kritis diaudit;
- cross-unit test lulus;
- restore berhasil;
- build production tanpa demo.

## 4. Fase P1 — Operasional unit

Fitur:

- jadwal pasien;
- dashboard shift;
- check-in;
- scan QR identifikasi internal;
- status sesi;
- handover;
- workflow alert;
- history dry weight;
- laporan periode;
- template XLSX.

Pilot internal menggunakan data nyata setelah persetujuan.

## 5. Fase P2 — Rapor dan portal pasien

Fitur:

- report service;
- template PDF;
- footer QR;
- token service;
- PIN/OTP;
- portal responsive;
- arsip rapor;
- notifikasi;
- device management;
- access delegation;
- audit portal.

Rollout:

1. staf internal;
2. pasien sukarela terbatas;
3. evaluasi literasi dan dukungan;
4. perluasan bertahap.

## 6. Fase P3 — Multidisiplin dan integrasi

- ahli gizi;
- patient-reported outcomes;
- SIMRS;
- timbangan;
- SSO;
- multi-unit;
- data warehouse;
- dashboard manajemen;
- automated report.

## 7. Migrasi data

Langkah:

1. inventaris sumber;
2. mapping;
3. cleansing;
4. dry run;
5. sampling;
6. import staging;
7. rekonsiliasi;
8. sign-off;
9. production import;
10. post-migration audit.

Berat kering lama harus memiliki effective date atau ditandai sebagai baseline migration.

## 8. Training

### Perawat

- identifikasi pasien;
- input;
- draft/final;
- alert;
- koreksi;
- offline/error.

### Supervisor

- dashboard;
- approval;
- SLA;
- handover;
- data quality.

### Dokter/ahli gizi

- review longitudinal;
- rencana;
- visibility pasien;
- versioning.

### Admin

- akun;
- role;
- import;
- audit;
- incident.

### Pasien

- scan QR;
- PIN;
- domain resmi;
- perangkat publik;
- QR hilang;
- akses keluarga.

## 9. Support model

- level 1: admin unit;
- level 2: support aplikasi;
- level 3: developer/security;
- clinical escalation terpisah;
- jam dukungan;
- severity;
- kanal;
- response target.

## 10. Monitoring go-live

- login failure;
- save failure;
- duplicate prevented;
- alert latency;
- portal error;
- QR verification failure;
- PDF failure;
- import failure;
- database reads/cost;
- security anomaly.

## 11. Rollback

- feature flag portal;
- disable QR resolution;
- revert frontend;
- backend version rollback;
- database migration reversible;
- manual workflow tersedia;
- komunikasi insiden.

## 12. RACI ringkas

| Aktivitas | Product | Clinical | Security | Dev | QA | Ops |
|---|---|---|---|---|---|---|
| Scope | A | A/R | C | C | C | C |
| Threshold | C | A/R | C | I | C | I |
| QR security | C | C | A/R | R | R | C |
| Backend | C | C | C | A/R | R | C |
| UAT | A | A/R | C | C | R | C |
| Go-live | A | A | A | R | R | R |

## 13. Definition of pilot success

- penggunaan aktif > target;
- error input turun;
- alert ditangani sesuai SLA;
- tidak ada insiden privasi;
- pasien memahami rapor;
- QR scan success rate memenuhi target;
- dukungan dapat menangani masalah;
- feedback pengguna menghasilkan backlog prioritas.
