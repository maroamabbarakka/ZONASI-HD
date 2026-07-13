# Keamanan QR, Privasi, dan Kontrol Akses Portal Pasien

## 1. Tujuan keamanan

- mencegah orang yang menemukan rapor melihat data pasien;
- mencegah enumeration pasien;
- mencegah QR palsu dan phishing;
- memungkinkan pencabutan;
- memberi audit lengkap;
- menjaga akses keluarga tetap berbasis persetujuan;
- meminimalkan data pada perangkat dan cache.

## 2. Data yang dilarang berada di QR

- nama;
- NIK;
- nomor RM;
- tanggal lahir;
- nomor telepon;
- Firebase document ID yang dapat ditebak;
- query yang mengandung PII;
- URL langsung ke database;
- token akses jangka panjang dalam bentuk yang dapat dibaca server log pihak ketiga.

## 3. Format QR

```
https://pasien.zonasi-hd.example/r/{opaque_token}
```

`opaque_token`:

- dibuat dengan CSPRNG;
- minimal 128 bit entropy;
- URL-safe;
- tidak berurutan;
- tidak bermakna;
- disimpan sebagai hash di server;
- memiliki `token_id`, status, waktu terbit, waktu dicabut, dan alasan.

## 4. Model token

```json
{
  "token_id": "uuid",
  "patient_id": "internal",
  "token_hash": "...",
  "purpose": "PATIENT_PORTAL_ENTRY",
  "status": "ACTIVE",
  "issued_at": "server time",
  "issued_by": "uid",
  "expires_at": null,
  "revoked_at": null,
  "revoke_reason": null,
  "last_used_at": null,
  "risk_policy_version": "QR_POLICY_V1"
}
```

## 5. Verifikasi kedua

QR bukan autentikasi tunggal. Setelah scan:

### Opsi yang didukung

- PIN 6 digit yang tidak mudah ditebak;
- OTP SMS/WhatsApp sesuai kebijakan dan vendor;
- passkey;
- password pasien;
- tanggal lahir hanya sebagai faktor tambahan, bukan faktor utama.

### Rekomendasi

- QR + PIN untuk penggunaan rutin;
- OTP pada perangkat baru, percobaan berisiko, atau reset PIN;
- rate limit ketat;
- lock sementara setelah percobaan gagal;
- notifikasi login perangkat baru.

## 6. Session portal

- cookie `Secure`, `HttpOnly`, `SameSite` sesuai arsitektur;
- session ID diputar setelah login;
- idle timeout;
- absolute timeout;
- re-authentication untuk unduh arsip atau ubah akses keluarga;
- tombol logout jelas;
- pilihan “bukan perangkat pribadi”.

## 7. Pencabutan QR

Pemicu:

- rapor/kartu hilang;
- pasien meminta;
- token dicurigai bocor;
- pergantian sistem;
- kematian/penutupan layanan sesuai kebijakan;
- kebijakan rotasi.

Setelah dicabut:

- URL menampilkan pesan umum;
- tidak menyebut nama pasien;
- tidak mengonfirmasi bahwa pasien tertentu ada;
- petugas dapat menerbitkan token baru;
- audit mencatat siapa dan alasan.

## 8. Domain dan anti-phishing

- gunakan domain resmi yang pendek;
- tampilkan domain di bawah QR;
- sertifikat HTTPS valid;
- HSTS;
- halaman awal menampilkan identitas fasilitas;
- edukasikan pasien agar tidak memasukkan PIN di domain lain;
- gunakan QR visual dengan logo kecil hanya jika tidak mengurangi keterbacaan.

## 9. Authorization

Semua request portal memeriksa:

- identitas user/session;
- patient scope;
- consent;
- status token;
- status akun;
- data visibility status;
- purpose of access.

Jangan mengandalkan patient ID dari browser. Server menentukan patient ID dari session.

## 10. Akses keluarga

Model:

```json
{
  "delegation_id": "uuid",
  "patient_id": "...",
  "delegate_user_id": "...",
  "scope": ["SCHEDULE", "REPORT_SUMMARY"],
  "starts_at": "...",
  "expires_at": "...",
  "status": "ACTIVE",
  "consent_version": "..."
}
```

- akses dapat dibatasi;
- masa berlaku wajib;
- pasien dapat mencabut;
- perubahan diberi notifikasi;
- akses penuh tidak menjadi default.

## 11. Audit event

- QR diterbitkan;
- QR dicetak;
- QR dicabut;
- scan berhasil/gagal;
- PIN gagal;
- OTP dikirim;
- login berhasil;
- perangkat dipercaya;
- laporan dilihat;
- PDF diunduh;
- akses keluarga dibuat/diubah/dicabut;
- data diekspor.

Audit tidak menyimpan PIN, OTP, atau token mentah.

## 12. Logging dan privasi

- redaksi token pada log;
- jangan log body sensitif;
- batasi akses log;
- retensi log ditetapkan;
- IP dan device data diperlakukan sebagai data personal;
- analytics pihak ketiga tidak boleh merekam halaman kesehatan tanpa penilaian privasi.

## 13. Ancaman dan mitigasi

| Ancaman | Mitigasi |
|---|---|
| QR difoto orang lain | Faktor kedua, pencabutan, notifikasi |
| Token ditebak | Entropy tinggi, rate limit |
| RM enumeration | Tidak memakai RM pada URL |
| Brute force PIN | Rate limit, lock, OTP |
| Session dicuri | Secure cookie, timeout, re-auth |
| Device bersama | Mode perangkat publik, logout otomatis |
| Screenshot | Edukasi; kontrol tidak dapat mencegah sepenuhnya |
| Phishing | Domain resmi, HSTS, edukasi |
| Cache browser | no-store untuk halaman sensitif |
| Link bocor di referrer | Referrer-Policy ketat |

## 14. Header keamanan web

- `Content-Security-Policy`;
- `Strict-Transport-Security`;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: no-referrer` atau kebijakan ketat;
- `Permissions-Policy`;
- frame protection;
- `Cache-Control: no-store` untuk data pasien.

## 15. Recovery

- reset PIN dengan verifikasi identitas;
- pemulihan nomor HP melalui petugas;
- proses kehilangan akses;
- pencabutan seluruh perangkat;
- dokumentasi social engineering resistance;
- petugas tidak membacakan data sensitif hanya berdasarkan penelepon.

## 16. Security acceptance criteria

- token mentah tidak tersimpan di database;
- QR tidak mengandung PII;
- endpoint tidak dapat dienumerasi;
- rate limit diuji;
- token revoked langsung gagal;
- akses pasien lain menghasilkan denial;
- data sensitif tidak tersimpan di cache;
- audit tersedia;
- penetration test dilakukan sebelum go-live;
- incident response QR terdokumentasi.
