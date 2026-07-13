# 🛠️ IMPLEMENTASI STEP-BY-STEP DI VS CODE
**Panduan Coding Lengkap dari Awal sampai MVP Berjalan**

Ikuti fase-fase ini secara berurutan. Setiap fase punya **tujuan**, **file yang harus dibuat/diubah**, dan **code snippet siap copy**.

---

## FASE 0: Persiapan & Struktur Dasar (30 menit)

**Tujuan**: Project siap dengan routing, layout dasar, dan Firebase initialized.

### Langkah 0.1: Ganti `src/App.tsx` dengan versi awal + Router
```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProtocolsPage } from './pages/ProtocolsPage';
import { LoginPage } from './pages/LoginPage'; // nanti
import { ProtectedRoute } from './components/ProtectedRoute'; // nanti

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/patients" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/protocols" element={<ProtectedRoute><ProtocolsPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

### Langkah 0.2: Buat file `src/main.tsx` standar Vite (pastikan ada StrictMode)

### Langkah 0.3: Buat `src/services/firebase.ts`
```ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence (mirip CKG Malimpung)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support persistence.');
  }
});

export default app;
```

---

## FASE 1: Core Clinical Engine + ZoneBadge (Sudah Selesai Sebagian)
Anda sudah punya:
- `src/utils/zonasiCalculator.ts`
- `src/types/index.ts`
- `src/components/ui/ZoneBadge.tsx`

**Test sekarang**:
Buat file sementara `src/test-calc.tsx` (hapus nanti):

```tsx
import { calculateIDWG, getZone } from './utils/zonasiCalculator';

console.log(calculateIDWG(68.5, 62.0)); // contoh → ~10.5
console.log(getZone(2.8)); // HIJAU
console.log(getZone(4.2)); // KUNING
console.log(getZone(6.1)); // MERAH
```

Jalankan `npm run dev` dan lihat console. Pastikan akurat!

---

## FASE 2: Form Input Sesi + Live Calculation (Paling Penting)
**Tujuan**: Perawat input berat → langsung lihat IDWG + warna besar.

### Buat `src/components/forms/SessionInputForm.tsx`
Gunakan React Hook Form + Zod + live watch.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { calculateIDWG, getZone, getZoneLabel, getZoneDescription, getQuickRecommendations } from '../../utils/zonasiCalculator';
import ZoneBadge from '../ui/ZoneBadge';
import { Patient } from '../../types';

const schema = z.object({
  pre_weight: z.number().min(30).max(200),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  patient: Patient;
  onSubmit: (data: any) => void;
  currentUserRole: string;
}

export const SessionInputForm: React.FC<Props> = ({ patient, onSubmit, currentUserRole }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { pre_weight: patient.latest_pre_weight || patient.bb_kering + 2 },
  });

  const preWeight = watch('pre_weight');
  const [liveCalc, setLiveCalc] = useState<any>(null);

  useEffect(() => {
    if (preWeight && patient.bb_kering) {
      try {
        const idwg = calculateIDWG(preWeight, patient.bb_kering);
        const zone = getZone(idwg);
        setLiveCalc({
          idwg_pct: idwg,
          zone,
          label: getZoneLabel(zone),
          description: getZoneDescription(zone),
          recommendations: getQuickRecommendations(zone, currentUserRole),
          isValid: true,
        });
      } catch (e) {
        setLiveCalc(null);
      }
    }
  }, [preWeight, patient.bb_kering, currentUserRole]);

  const onFormSubmit = (data: FormData) => {
    if (!liveCalc) return;
    onSubmit({
      ...data,
      patient_id: patient.id,
      idwg_pct: liveCalc.idwg_pct,
      zone: liveCalc.zone,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Berat Badan Pre-HD (kg)</label>
        <input
          type="number"
          step="0.1"
          {...register('pre_weight', { valueAsNumber: true })}
          className="w-full text-3xl font-mono border-2 border-slate-300 focus:border-medical-primary rounded-xl p-4 text-center"
          autoFocus
        />
        {errors.pre_weight && <p className="text-red-500 text-sm mt-1">Berat tidak valid</p>}
      </div>

      {/* LIVE PREVIEW — Ini yang bikin "WOW" */}
      {liveCalc && (
        <div className={`p-6 rounded-2xl border-2 ${liveCalc.zone === 'MERAH' ? 'bg-red-50 border-red-600' : liveCalc.zone === 'KUNING' ? 'bg-yellow-50 border-yellow-500' : 'bg-green-50 border-green-600'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-slate-600">IDWG (Interdialytic Weight Gain)</div>
              <div className="text-6xl font-bold tabular-nums tracking-tighter">{liveCalc.idwg_pct}<span className="text-3xl">%</span></div>
            </div>
            <ZoneBadge zone={liveCalc.zone} size="xl" />
          </div>
          <p className="text-sm mb-3">{liveCalc.description}</p>
          <ul className="text-sm space-y-1">
            {liveCalc.recommendations.map((rec: string, i: number) => (
              <li key={i} className="flex items-start gap-2">• {rec}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        disabled={!liveCalc}
        className="w-full py-4 bg-medical-primary text-white text-lg font-semibold rounded-2xl disabled:opacity-50 active:scale-[0.985] transition"
      >
        Simpan Sesi &amp; Update Zona
      </button>
    </form>
  );
};
```

**Hasil akhir fase ini**: Ketika perawat ketik berat, warna langsung berubah + rekomendasi muncul. Ini adalah **kebaruan utama** proposal yang sudah jadi!

---

## FASE 3: Command Center Dashboard Real-time
**Tujuan**: Layar besar nurse station menampilkan semua pasien dengan warna.

Buat `src/pages/DashboardPage.tsx`

Gunakan `useEffect` + `onSnapshot` dari Firestore untuk listen `patients` collection (filter is_active == true).

Tampilkan:
- Header dengan nama unit + tanggal hari ini + tombol "Input Sesi Baru"
- 3 kartu statistik besar (Hijau / Kuning / Merah count + %)
- Grid responsif `PatientZoneCard` (buat komponen ini)
- Banner Early Warning jika ada streak Kuning

Contoh struktur `PatientZoneCard`:
- Nama + RM besar
- ZoneBadge xl
- IDWG % + tanggal sesi terakhir
- Klik → buka modal dengan `SessionInputForm` pre-filled patient tersebut + history mini

---

## FASE 4: Patient Detail + Trend Chart + Printable Card
- Buat halaman `/patients/:id` atau modal
- Tampilkan info pasien + form edit BB Kering (hanya PK III+)
- `IDWGTrendChart.tsx` menggunakan Recharts:
  ```tsx
  <LineChart data={sessions}>
    <Line type="monotone" dataKey="idwg_pct" stroke="#0f766e" />
    <ReferenceLine y={3} stroke="#ca8a04" strokeDasharray="3 3" label="Batas Kuning" />
    <ReferenceLine y={5} stroke="#dc2626" strokeDasharray="3 3" label="Batas Merah" />
  </LineChart>
  ```
- Tombol "Cetak Kartu Kendali ZONASI" → panggil fungsi jsPDF yang generate PDF cantik dengan logo RS + tabel warna + edukasi.

---

## FASE 5: Early Warning + Protocol Modal + Role Guard
- Saat simpan sesi Kuning, hitung `calculateYellowStreak` dari 5 sesi terakhir pasien.
- Jika >=3 → tulis ke collection `alerts` + tampilkan banner di dashboard.
- Buat `ProtocolModal.tsx` yang menerima `zone` dan menampilkan checklist lengkap sesuai proposal (Aksi Cerdik untuk Merah dll). Checklist yang dicentang disimpan ke `interventions[]` di sesi.

---

## FASE 6: Polish, PWA, Testing & Demo
- Tambah PWA config di `vite.config.ts`
- Buat manifest + icon sederhana (bisa pakai Lucide atau generate)
- Seed data demo
- Test di tablet (responsive)
- Buat akun test untuk setiap role
- Screenshot dashboard + form → lampirkan ke presentasi inovasi

---

## Ringkasan Timeline Realistis (1 Developer Full-time)
- Hari 1-2: Setup + Fase 0-1 (engine + form live)
- Hari 3-5: Dashboard + Patient cards + Firebase CRUD
- Hari 6-7: Chart + Printable card + Early Warning
- Hari 8-9: Polish UI/UX + Protocol + Role
- Hari 10: Testing + Seed + Dokumentasi + Demo ke tim medis

**Total MVP siap demo dalam ± 2 minggu** — sangat feasible untuk inovasi RS.

---

**Mulai sekarang dari Fase 0 atau langsung Fase 2 jika struktur sudah siap.**

Setelah MVP jalan, Anda bisa presentasikan ke Komite Mutu RSUD Andi Makkasau dengan bangga. Aplikasi ini benar-benar mewujudkan semangat proposal: **"Cepat, Akurat, dan Selamat"**.

Selamat coding! Jika butuh bantuan bagian tertentu, buka issue atau tanyakan bagian spesifik di dokumen ini.