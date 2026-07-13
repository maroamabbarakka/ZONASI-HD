# 🗄️ MODEL DATA & FIRESTORE — ZONASI-HD
**Skema Lengkap, Security Rules, Indexing, dan Seeding Strategy**

## 1. Filosofi Desain Data
- **Single Source of Truth** untuk status pasien saat ini di dokumen `patients`
- **Riwayat lengkap** di subcollection `sessions` (immutable — jangan edit sesi lama)
- **Denormalisasi cerdas** untuk query cepat di dashboard (latest_zone, latest_idwg_pct, yellow_streak)
- **Audit Trail** sederhana: setiap sesi simpan `nurse_uid`, `timestamp`, `device_info` (opsional)
- **Skalabilitas**: Struktur ini mudah di-migrasi ke SIMRS nantinya (FHIR-like)

---

## 2. Firestore Collections & Schema

### Collection: `users`
Hanya untuk auth + role. Buat manual via Firebase Console atau Admin SDK.

```ts
interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'PK_II' | 'PK_III' | 'DOKTER' | 'ADMIN';
  unit: 'Hemodialisis';
  createdAt: Timestamp;
  lastLogin?: Timestamp;
}
```

**Firestore Rules contoh** (lihat bagian Rules nanti):
Hanya user itu sendiri atau ADMIN yang bisa baca dokumen users.

### Collection: `patients` (Root)
Ini adalah master data pasien HD.

```ts
interface Patient {
  id: string;                    // auto ID Firestore atau pakai RM jika unik
  rm: string;                    // Nomor Rekam Medis (unique, index)
  nama: string;
  tanggal_lahir: string;         // 'YYYY-MM-DD' atau Timestamp
  jenis_kelamin: 'L' | 'P';
  bb_kering: number;             // Dry Weight target (kg) — editable oleh PK III/Dokter
  bb_kering_updated_at?: Timestamp;
  bb_kering_updated_by?: string; // uid

  // Denormalized latest (selalu update saat sesi baru)
  latest_session_date?: Timestamp;
  latest_pre_weight?: number;
  latest_idwg_pct?: number;
  latest_zone?: 'HIJAU' | 'KUNING' | 'MERAH';
  latest_nurse_uid?: string;

  // Early Warning fields
  yellow_streak: number;         // dihitung client / CF
  last_red_date?: Timestamp;
  risk_level: 'low' | 'medium' | 'high';

  // Metadata
  created_at: Timestamp;
  created_by: string;
  is_active: boolean;            // false jika pasien sudah tidak HD lagi
  notes?: string;                // catatan umum (alergi, dll)
}
```

**Index penting**:
- `rm` (unique ascending)
- `latest_zone` + `is_active`
- `yellow_streak` (untuk query high risk)

### Subcollection: `patients/{patientId}/sessions`
Setiap sesi HD adalah dokumen immutable.

```ts
interface HDSession {
  id: string;
  patient_id: string;
  session_date: Timestamp;       // tanggal & jam sesi (bisa pakai created_at juga)
  shift: 'Pagi' | 'Siang' | 'Sore' | 'Malam'; // opsional

  pre_weight: number;            // BB datang (kg)
  post_weight?: number;          // BB pulang (opsional, untuk evaluasi UF)
  idwg_pct: number;              // hasil kalkulasi (disimpan untuk query cepat)
  zone: 'HIJAU' | 'KUNING' | 'MERAH';

  // Intervensi
  interventions: string[];       // array checklist yang dicentang (dari ProtocolModal)
  uf_goal?: number;              // target ultrafiltrasi
  notes?: string;                // catatan khusus sesi ini

  // Audit
  nurse_uid: string;
  nurse_name?: string;           // denormalize untuk tampilan
  created_at: Timestamp;
  device_info?: string;          // 'Tablet Nurse Station 2' atau user agent
}
```

**Query umum**:
- `sessions` where `patient_id == X` order by `session_date` desc limit 12 → untuk chart & history
- Dashboard hari ini: query `sessions` where `session_date` >= hari ini 00:00 (atau pakai denormalized di patients)

**Alternatif untuk dashboard super cepat**:
Buat collection terpisah `active_sessions_today` atau cukup andalkan `patients` + listener. Untuk MVP gunakan `patients` dengan `latest_*` fields.

### Collection: `alerts` (untuk Early Warning)
```ts
interface Alert {
  id: string;
  patient_id: string;
  patient_name: string;
  type: 'YELLOW_STREAK_3' | 'RECENT_RED';
  triggered_at: Timestamp;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: Timestamp;
  message: string;
}
```

---

## 3. Firestore Security Rules (Contoh Siap Pakai)
Buat file `firestore.rules` di root:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN');
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }

    // Patients - semua role medis bisa baca
    match /patients/{patientId} {
      allow read: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['PK_II', 'PK_III', 'DOKTER', 'ADMIN']);
      
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['PK_III', 'DOKTER', 'ADMIN'];
      
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['PK_III', 'DOKTER', 'ADMIN'];
      
      // Sessions subcollection
      match /sessions/{sessionId} {
        allow read, create: if request.auth != null && 
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['PK_II', 'PK_III', 'DOKTER', 'ADMIN'];
        allow update, delete: if false; // immutable
      }
    }

    // Alerts
    match /alerts/{alertId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['PK_III', 'DOKTER', 'ADMIN'];
    }
  }
}
```

**Catatan**: Rules di atas cukup ketat untuk prototype. Untuk production tambahkan `resource.data.unit == 'Hemodialisis'` dll.

---

## 4. Seeding Demo Data (Sangat Direkomendasikan)
File `scripts/seedDemoData.ts` sudah disiapkan dengan 8 pasien realistis:

Contoh data yang akan dibuat:
- **Pak Budi** (RM-001): Selalu Hijau, bb_kering 62.5, latest 1.8%
- **Ibu Siti** (RM-002): Sering Kuning, yellow_streak=4
- **Pak Ahmad** (RM-003): Baru saja Merah 6.2%, butuh perhatian
- dll (beragam pola untuk demo Early Warning & tren)

Jalankan seed **setelah** Anda login sebagai ADMIN atau buat script yang pakai service account (atau manual via Firebase Console untuk MVP).

---

## 5. Indexing (Firestore Indexes)
Buat file `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "sessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "patient_id", "order": "ASCENDING" },
        { "fieldPath": "session_date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "patients",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "is_active", "order": "ASCENDING" },
        { "fieldPath": "latest_zone", "order": "ASCENDING" }
      ]
    }
  ]
}
```

Deploy dengan `firebase deploy --only firestore:indexes`

---

## 6. Migration Path ke SIMRS
Struktur ini sudah dekat dengan standar:
- `patients` → mirip master pasien
- `sessions` → mirip encounter / clinical event HD
- Bisa expose via REST/GraphQL nanti atau Firebase Extension ke BigQuery untuk analytics advanced.

---

**File ini adalah kontrak data**. Jangan ubah schema tanpa update dokumen ini dan semua service layer.

Lanjut ke implementasi coding di `IMPLEMENTASI_STEP_BY_STEP.md`.