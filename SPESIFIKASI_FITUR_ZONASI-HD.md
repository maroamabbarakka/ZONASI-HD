# 📋 SPESIFIKASI FITUR LENGKAP ZONASI-HD
**Analisis Proposal + User Stories + Acceptance Criteria**

## Ringkasan Analisis Proposal (Sangat Detail)
Proposal ZONASI-HD adalah salah satu proposal inovasi pelayanan publik kesehatan terbaik yang pernah saya analisis. Ia memiliki:
- **Problem-solution fit** yang sangat kuat (IDWG monitoring adalah pain point nyata di unit HD di seluruh Indonesia)
- **Metodologi** jelas (Fishbone 5M, matriks solusi)
- **Threshold klinis** spesifik dan evidence-based
- **Roadmap implementasi** 5 fase yang realistis
- **Fokus pada perubahan budaya** (bukan hanya teknologi)

Aplikasi ini merealisasikan **100% ide inti** proposal dengan pendekatan teknis modern.

---

## 1. Zona & Threshold (HARUS Persis Sesuai Proposal)

| Zona   | IDWG %          | Warna UI          | Risiko     | Intervensi Utama (dari Proposal) | Role yang Boleh |
|--------|-----------------|-------------------|------------|----------------------------------|-----------------|
| HIJAU  | < 3%            | #16a34a (green-600) | Rendah    | Edukasi rutin + pemeliharaan    | PK II, PK III, Dokter |
| KUNING | 3% – 5%         | #ca8a04 (yellow-600)| Sedang    | UF lebih ketat, monitoring ketat, konseling diet natrium | PK II + PK III |
| MERAH  | > 5%            | #dc2626 (red-600)   | Tinggi/Kritis | Aktivasi protokol edema paru, Oksigenasi + Suctioning "Aksi Cerdik", kolaborasi medis segera | **Hanya PK III + Dokter** (dengan override) |

**Catatan Klinis Penting**:
- Threshold **< 3 / 3-5 / >5** diambil persis dari proposal (beberapa literatur pakai 4% atau 5%, tapi kita ikuti proposal).
- IDWG dihitung **hanya dari Pre-HD weight** vs Dry Weight (BB Kering target pasien).
- Post-HD weight dicatat untuk evaluasi UF actual vs target nantinya.

---

## 2. User Roles & Permissions (RBAC)

| Role      | Login     | Dashboard | Input Sesi | Lihat Semua Pasien | Lihat Detail + History | Input/Edit BB Kering | Lihat Protokol Merah | Generate Laporan | Akses Early Warning |
|-----------|-----------|-----------|------------|--------------------|------------------------|----------------------|--------------------|--------------------|---------------------|
| **PK II** | Ya        | Ya        | Ya (semua) | Ya                 | Ya                     | Tidak (hanya lihat)  | Tidak              | Ya (read-only)     | Ya (banner)         |
| **PK III**| Ya        | Ya        | Ya         | Ya                 | Ya                     | Ya                   | **Ya**             | Ya                 | Ya + action         |
| **DOKTER**| Ya        | Ya        | Tidak      | Ya                 | Ya                     | Ya (supervisor)      | Ya                 | **Full**           | Full + Pre-Alert    |
| **ADMIN** | Ya        | Ya        | Tidak      | Ya                 | Ya                     | Ya                   | Ya                 | Ya                 | Ya                  |

**Implementasi**: Field `role` di dokumen `users/{uid}`. Frontend enforce + Firestore rules enforce.

---

## 3. Fitur Utama (MVP + Advanced)

### MVP (Fase 1-2 — Wajib Jalan dalam 2-3 minggu development)
1. **Autentikasi & Role**
   - Login email/password Firebase
   - Redirect berdasarkan role setelah login
   - Logout + session persistence

2. **Kalkulator IDWG + Zona Otomatis (Core Engine)**
   - Pure function `calculateIDWG` + `getZone`
   - Live preview saat mengetik berat pre-HD
   - Validasi: Pre-HD harus > Dry Weight (warning jika tidak)
   - Output: IDWG % (1 desimal) + Zona Badge besar + warna background form berubah

3. **Command Center Dashboard (Real-time)**
   - Stats hari ini: Total pasien, % di Hijau (target KPI), jumlah Merah
   - Grid kartu pasien (atau tabel responsif)
   - Setiap kartu menampilkan: Nama + RM + Zona (besar) + IDWG terakhir + Waktu input
   - Klik kartu → buka modal detail cepat
   - Auto refresh via Firestore `onSnapshot` (mirip live update di CKG dashboard)

4. **Form Input Sesi HD**
   - Searchable patient selector (dari daftar pasien)
   - Input BB Pre-HD (type=number, step=0.1, besar)
   - Tampilkan BB Kering pasien (read-only)
   - Live calc + zona
   - Field tambahan: Catatan perawat, UF goal (opsional)
   - Tombol simpan → tulis ke Firestore + update `latest_*` di patient doc

5. **Patient Detail & History**
   - Halaman / modal pasien
   - Info dasar + BB Kering (editable oleh PK III/Dokter)
   - Tabel riwayat 10-12 sesi terakhir
   - **Trend Chart** IDWG % dengan garis referensi 3% & 5% (Recharts)
   - Indikator streak (berapa sesi berturut-turut di zona tertentu)

6. **Printable Kartu Kendali ZONASI (Digital Education Card)**
   - Dari halaman pasien → tombol "Cetak Kartu Kendali"
   - Generate PDF cantik berisi:
     - Header RSUD Andi Makkasau + judul ZONASI-HD
     - Info pasien + target BB Kering
     - Tabel / grid warna 1 bulan terakhir (atau checklist)
     - Edukasi singkat "Apa arti warna saya?"
     - Tanda tangan perawat + tanggal

### Fitur Lanjutan (Fase 3+)
7. **Early Warning System (EWS)**
   - Saat simpan sesi Kuning → cek 3 sesi terakhir pasien tersebut
   - Jika 3 Kuning berturut-turut → buat dokumen di collection `alerts` + tampilkan **Banner Merah Muda** di dashboard
   - Banner bisa diklik → daftar pasien yang perlu pre-alert ke dokter
   - Dokter/PK III bisa "Acknowledge" alert

8. **Protocol & Action Logging per Zona**
   - Modal khusus ketika zona Merah atau tombol "Lihat Protokol"
   - Checklist interaktif tindakan (misal untuk Merah: "Berikan O2  nasal 3-5 Lpm", "Siapkan suction", "Hubungi DPJP", "Catat di rekam medis")
   - Checklist yang dicentang → otomatis ditulis ke field `interventions` di sesi tersebut (audit trail)

9. **Reports & Analytics**
   - Halaman Laporan:
     - % Pasien di Zona Hijau bulan ini (KPI utama)
     - Tren bulanan kejadian Merah
     - Top 5 pasien dengan kepatuhan terbaik (Green streak)
     - Export ke Excel/CSV atau PDF ringkasan untuk Komite Mutu

10. **PWA + Offline Draft**
    - Bisa di-install ke tablet nurse station
    - Form input bisa diisi offline → otomatis sync saat online kembali (mirip draft CKG)

---

## 4. User Stories Prioritas (Format Agile)

**Sebagai Perawat PK II**, saya ingin:
- Setelah login langsung melihat dashboard command center yang menampilkan status semua pasien hari ini dengan warna jelas, **agar** saya bisa langsung memprioritaskan pasien Zona Kuning/Merah.
- Saat input berat badan pre-HD pasien, sistem **langsung menampilkan IDWG % dan warna zona** tanpa saya hitung manual, **agar** tidak ada human error dan saya bisa langsung edukasi pasien dengan bahasa visual.
- Melihat riwayat warna pasien dalam bentuk grafik, **agar** saya bisa menjelaskan tren kepatuhan cairan kepada pasien & keluarga secara persuasif.

**Sebagai Perawat PK III**, saya ingin:
- Ketika ada pasien masuk Zona Merah, sistem **langsung menampilkan protokol lengkap + checklist tindakan** yang harus saya lakukan, **agar** penanganan standar dan tidak ada yang terlewat (legal protection).
- Mendapat notifikasi/banner jika ada pasien yang sudah 3x Kuning berturut-turut, **agar** saya bisa lakukan intervensi lebih awal sebelum jatuh ke Merah.

**Sebagai Dokter DPJP**, saya ingin:
- Melihat laporan bulanan % pasien di Zona Hijau + tren komplikasi, **agar** bisa dievaluasi di rapat Komite Mutu dan dilaporkan untuk akreditasi.
- Mendapat pre-alert otomatis untuk pasien berisiko tinggi.

---

## 5. Non-Functional Requirements (Kualitas Medis)
- **Akurasi Kalkulasi**: 100% (pure math, dibulatkan ke 1 desimal)
- **Kecepatan**: Dashboard update < 2 detik setelah input perawat lain
- **Usability**: Semua tombol & input touch-friendly (min 44px) untuk tablet
- **Readability**: Font minimal 14-16px, high contrast, zona warna jangan samar
- **Reliability**: Tidak boleh crash saat input data aneh (defensive programming + Zod)
- **Privacy**: Tidak ada data pasien nyata di repo. Semua demo data dummy.

---

## 6. KPI Sukses (Sesuai Proposal)
- Waktu triase turun dari 5-10 menit → < 30 detik
- Akurasi IDWG 100% (vs manual error-prone)
- Penurunan kejadian edema paru (diukur manual dulu via laporan)
- Peningkatan % pasien di Zona Hijau dalam 3 bulan pertama

---

**Dokumen ini adalah "single source of truth"** untuk apa yang harus dibangun. Semua fitur di `IMPLEMENTASI_STEP_BY_STEP.md` mengacu ke spesifikasi ini.

Lanjut ke `MODEL_DATA_DAN_FIRESTORE.md` untuk fondasi data.