# Backlog Teknis dan Definition of Done

## 1. Epic A — Trusted Clinical Calculation

### User story

Sebagai petugas, saya ingin hasil IDWG dan zona dihitung server agar hasil final konsisten dan tidak dapat dimanipulasi.

### Task

- endpoint create session;
- schema validation;
- dry weight read;
- formula version;
- threshold version;
- transaction;
- idempotency;
- audit;
- tests.

### Acceptance

- client-supplied zone diabaikan;
- stale dry weight menghasilkan conflict atau perhitungan server yang jelas;
- duplicate request tidak membuat sesi baru.

## 2. Epic B — Dry Weight Governance

- history collection;
- proposal form;
- approval workflow;
- effective date;
- session snapshot;
- UI timeline;
- audit;
- migration baseline.

## 3. Epic C — Session Correction

- correction request;
- diff display;
- approval;
- recalculation;
- alert impact;
- patient report update;
- audit.

## 4. Epic D — Operational Schedule

- schedule master;
- recurrence;
- shift;
- machine assignment;
- check-in;
- attendance status;
- reschedule;
- no-show reason;
- dashboard.

## 5. Epic E — Alert Workflow

- backend triggers;
- dedupe;
- state machine;
- assignment;
- SLA;
- timeline;
- escalation;
- handover;
- reporting.

## 6. Epic F — XLSX Import

- template generator;
- 4 sheets;
- validation;
- preview;
- dry run;
- import jobs;
- conflict policy;
- result export;
- audit;
- malware/size controls.

## 7. Epic G — Patient Report PDF

- report schema;
- snapshot;
- template;
- header;
- cards;
- table;
- graph;
- footer QR;
- page numbering;
- verification code;
- print tests.

## 8. Epic H — QR Token Service

- token generation;
- hash storage;
- resolve endpoint;
- revoke/rotate;
- audit;
- rate limit;
- domain security;
- admin UI;
- print integration.

## 9. Epic I — Patient Portal

- PIN/OTP;
- session management;
- report summary;
- history;
- schedule;
- education;
- notification preferences;
- delegation;
- device list;
- accessibility.

## 10. Epic J — Reporting

- metric definitions;
- aggregates;
- date filters;
- unit filters;
- exports;
- de-identification;
- audit;
- PDF/XLSX.

## 11. Epic K — Security and Operations

- org/unit authorization;
- MFA;
- session timeout;
- audit pipeline;
- monitoring;
- backup;
- restore drill;
- incident runbook;
- secret management;
- staging environment.

## 12. Definition of Ready

Story siap dikerjakan bila:

- tujuan pengguna jelas;
- owner ditetapkan;
- acceptance criteria ada;
- data classification ada;
- dependency diketahui;
- desain tersedia bila perlu;
- keputusan klinis telah disahkan;
- security review awal selesai;
- test data tersedia.

## 13. Definition of Done

- code review;
- automated tests;
- authorization tests;
- schema validation;
- audit event;
- error handling;
- loading/empty/offline states;
- accessibility check;
- logging tanpa data sensitif;
- documentation;
- feature flag;
- migration/rollback bila perlu;
- QA pass;
- UAT/sign-off sesuai fitur;
- monitoring dashboard;
- no critical/high defect.

## 14. Checklist frontend

- role-based visibility;
- server remains authority;
- form validation;
- conflict handling;
- keyboard;
- responsive;
- screen reader labels;
- no PII in URL;
- no sensitive localStorage;
- no generic cache;
- error telemetry sanitized.

## 15. Checklist backend

- authn/authz;
- org/unit scope;
- idempotency;
- transaction;
- server timestamp;
- schema validation;
- version check;
- audit;
- rate limit;
- retry-safe;
- observability;
- data minimization.

## 16. Checklist QR/PDF

- opaque token;
- no PII;
- revoked test;
- printed scan test;
- footer every page;
- quiet zone;
- official domain text;
- verification code;
- no internal notes;
- patient visibility rule;
- download audit.

## 17. Sprint sequencing suggestion

### Sprint 1–2

- architecture foundation;
- auth scope;
- audit;
- backend session.

### Sprint 3–4

- dry weight history;
- correction;
- alert engine.

### Sprint 5–6

- schedule;
- shift dashboard;
- XLSX import.

### Sprint 7–8

- report snapshot;
- PDF;
- footer QR.

### Sprint 9–10

- QR token service;
- portal authentication;
- patient summary.

### Sprint 11–12

- delegation;
- notifications;
- management reports;
- hardening/UAT.

## 18. Risiko backlog

- scope creep menjadi EMR penuh;
- protokol klinis belum final;
- integrasi eksternal terlambat;
- ketergantungan OTP vendor;
- literasi pasien beragam;
- biaya Firestore meningkat;
- desain PDF tidak stabil antar-renderer;
- QR terlalu kecil atau printer buruk;
- admin tidak menjalankan offboarding;
- audit terlalu banyak menyimpan data sensitif.

Setiap risiko harus memiliki owner, probabilitas, dampak, mitigasi, dan trigger.
