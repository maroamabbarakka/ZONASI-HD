# 💻 PANDUAN LENGKAP SETUP DI VS CODE — ZONASI-HD
**Dari Nol sampai Bisa Jalan (Step-by-Step Profesional)**

Ikuti **persis** urutan ini. Setiap langkah punya penjelasan "Mengapa" agar Anda paham sebagai developer medis.

---

## Langkah 0: Persiapan Sistem
1. Install **Node.js LTS** (v20 atau v22) dari https://nodejs.org
2. Install **VS Code** (terbaru)
3. Buka VS Code → Extensions (Ctrl+Shift+X) → Install rekomendasi berikut:
   - **ESLint**
   - **Prettier - Code formatter**
   - **Tailwind CSS IntelliSense**
   - **Firebase**
   - **TypeScript Hero** atau **Error Lens**
   - **GitLens** (opsional tapi sangat membantu)
   - **Auto Rename Tag**
   - **Bracket Pair Colorizer** (atau built-in)
4. (Opsional tapi **sangat direkomendasikan** untuk proyek medis) Install **Git** jika belum.

---

## Langkah 1: Buat Project Baru dengan Vite + React + TS
Buka terminal di VS Code (`Ctrl + `` `) atau `Terminal > New Terminal`

```bash
# Pindah ke folder kerja Anda (misal Desktop atau Documents)
cd ~/Desktop   # atau path lain

# Buat project Vite React TS
npm create vite@latest ZONASI-HD-App -- --template react-ts

# Masuk ke folder
cd ZONASI-HD-App

# Install dependencies inti
npm install

# Jalankan untuk test (opsional)
npm run dev
```

**Mengapa Vite + React TS?**  
Cepat, modern, type safety untuk rumus IDWG yang kritis. Mirip persis stack CKG Malimpung.

Sekarang **hapus** folder `src` bawaan Vite dan ganti dengan struktur lengkap kami (lihat Langkah 3).

---

## Langkah 2: Install Semua Dependencies yang Dibutuhkan
Jalankan perintah berikut **satu per satu** atau copy semua:

```bash
# Core UI & Routing
npm install react-router-dom lucide-react date-fns clsx tailwind-merge

# Forms & Validation (penting untuk input medis)
npm install react-hook-form @hookform/resolvers zod

# Charts (tren IDWG)
npm install recharts

# Firebase (realtime + auth)
npm install firebase

# Print & PDF Kartu Kendali
npm install jspdf html2canvas

# PWA Support
npm install -D vite-plugin-pwa workbox-window

# Dev tools (optional tapi bagus)
npm install -D @types/jspdf
```

**Penjelasan singkat**:
- `zod` + RHF: Validasi berat badan tidak boleh negatif atau tidak masuk akal (pre < dry misalnya warning)
- `recharts`: Library chart paling ringan & bagus untuk dashboard medis
- `firebase`: Realtime listener untuk dashboard command center
- `jspdf`: Generate Kartu Kendali ZONASI profesional untuk dicetak/dikirim ke WA pasien

---

## Langkah 3: Ganti Struktur Folder & File (Copy dari Panduan Ini)
Hapus isi `src/` bawaan, lalu buat struktur berikut (bisa manual atau copy-paste dari file yang sudah saya siapkan di folder `ZONASI-HD-App` ini).

**Struktur yang harus ada** (lihat `STRUKTUR_PROYEK.md` untuk penjelasan tiap file):

```
src/
├── components/
│   ├── ui/
│   │   ├── ZoneBadge.tsx
│   │   ├── Button.tsx
│   │   └── Modal.tsx
│   ├── dashboard/
│   │   ├── CommandCenter.tsx
│   │   ├── StatsSummary.tsx
│   │   └── PatientZoneCard.tsx
│   ├── forms/
│   │   └── SessionInputForm.tsx
│   ├── charts/
│   │   └── IDWGTrendChart.tsx
│   └── features/
│       ├── ProtocolModal.tsx
│       └── PrintableCard.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── PatientsPage.tsx
│   ├── ReportsPage.tsx
│   └── ProtocolsPage.tsx
├── hooks/
│   ├── useIDWGCalculator.ts
│   └── useRealtimeDashboard.ts
├── utils/
│   └── zonasiCalculator.ts          ← FILE PALING PENTING
├── services/
│   └── firebase.ts
├── types/
│   └── index.ts
├── lib/
│   └── utils.ts
├── App.tsx
├── main.tsx
└── router.tsx (atau App.tsx handle routing)
```

Saya sudah menyiapkan **beberapa file inti** di dalam folder `ZONASI-HD-App/src/...` yang bisa Anda copy langsung. Untuk file yang belum ada, ikuti instruksi di `IMPLEMENTASI_STEP_BY_STEP.md`.

---

## Langkah 4: Setup Firebase (Paling Penting untuk Realtime)
1. Buka https://console.firebase.google.com/
2. Buat project baru: **ZONASI-HD-RSUD-Parepare** (atau nama pilihan Anda)
3. Enable **Authentication** → Sign-in method → **Email/Password** (enable)
4. Buat user test:
   - Email: `perawat@zonasi-hd.test` / Password: `zonasi123`
   - Nanti kita tambah role via Firestore
5. Enable **Firestore Database** → Start in **production mode** dulu (nanti kita ganti rules)
6. Dari Firebase Console → Project Settings → Your apps → **Web app** (</>) → Copy config object

Buat file `.env.local` di root project:

```env
# Firebase Config (ganti dengan milik Anda)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=zonasi-hd-rsud-parepare.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=zonasi-hd-rsud-parepare
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...

# Opsional untuk development
VITE_USE_EMULATOR=false
```

**PENTING**: Jangan commit `.env.local` ke git (sudah ada di .gitignore Vite).

---

## Langkah 5: Konfigurasi Vite & Tailwind
### vite.config.ts (sudah disiapkan di folder)
Pastikan ada `vite-plugin-pwa` dan proxy jika nanti butuh backend.

### tailwind.config.js
Gunakan konfigurasi healthcare theme + zona warna custom:

```js
// Contoh ekstensi
theme: {
  extend: {
    colors: {
      'zona-hijau': '#16a34a',
      'zona-kuning': '#ca8a04',
      'zona-merah': '#dc2626',
      medical: {
        primary: '#0f766e',
        accent: '#14b8a6',
      }
    }
  }
}
```

---

## Langkah 6: Jalankan & Test Awal
```bash
npm run dev
```

Buka browser `http://localhost:5173`

Jika muncul halaman Vite default → berarti struktur belum diganti. Ganti `App.tsx` dulu dengan versi sederhana yang import `ZoneBadge` untuk test.

---

## Langkah 7: Seed Data Demo (Super Penting untuk Testing)
Lihat file `scripts/seedDemoData.ts` (sudah disiapkan).

Jalankan:
```bash
npx tsx scripts/seedDemoData.ts
```
(atau buat script npm)

Ini akan membuat 8-10 pasien dummy dengan berbagai pola kepatuhan (beberapa selalu Hijau, beberapa sering Kuning/Merah, streak, dll). Sangat berguna untuk demo ke direktur RS atau Komite Mutu.

---

## Langkah 8: Development Workflow di VSCode (Best Practice)
- Gunakan **Prettier** format on save (`Ctrl+Shift+P` → Format Document)
- ESLint akan warning jika ada potensi bug di kalkulasi
- Gunakan **Firebase Emulator** untuk testing tanpa biaya & offline:
  ```bash
  firebase init emulators
  firebase emulators:start
  ```
  Update `.env` untuk connect ke emulator.

- **Hot Reload** sangat cepat → ubah `zonasiCalculator.ts` → langsung lihat perubahan di form input.

---

## Troubleshooting Umum
| Masalah                        | Solusi |
|--------------------------------|--------|
| Firebase config error          | Cek `.env.local` sudah benar & restart dev server |
| onSnapshot tidak update        | Pastikan Firestore rules allow read untuk user yang login |
| Chart tidak muncul             | Install recharts dengan benar + cek import |
| Build error TypeScript         | `npm run build` untuk cek semua type error |
| PWA tidak installable          | Cek manifest & service worker di dev tools → Application tab |

---

## Next setelah Setup Sukses
1. Baca **`IMPLEMENTASI_STEP_BY_STEP.md`** — ini adalah "buku petunjuk coding" utama.
2. Mulai implementasi dari `src/utils/zonasiCalculator.ts` (paling aman & penting).
3. Buat `ZoneBadge.tsx` — komponen visual pertama yang "wow".
4. Hubungkan ke Firebase Auth sederhana.
5. Bangun Dashboard realtime.

**Selamat!** Anda sekarang memiliki fondasi aplikasi medis profesional setara standar CKG Malimpung yang sudah digunakan di Puskesmas.

Jika ada kendala di langkah manapun, baca ulang dokumen ini atau tanyakan bagian spesifik. Kita akan wujudkan ZONASI-HD menjadi kenyataan digital yang menyelamatkan nyawa pasien HD.