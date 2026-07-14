import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertFails, assertSucceeds, initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collectionGroup, deleteDoc, doc, getDocs, serverTimestamp, setDoc, updateDoc, writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const PROJECT_ID = 'zonasi-hd-rules-test';
let environment: RulesTestEnvironment;

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync(resolve('firestore.rules'), 'utf8') },
  });
});

afterAll(async () => environment.cleanup());
beforeEach(async () => environment.clearFirestore());

async function seed(role = 'PERAWAT', yellowStreak = 0) {
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'users', 'user-1'), {
      displayName: 'Perawat Pelaksana Uji', role, unit: 'Hemodialisis', is_active: true,
    });
    await setDoc(doc(db, 'patients', 'patient-1'), {
      rm: 'RM001', nama: 'Pasien Sintetis', tanggal_lahir: '1980-01-01', jenis_kelamin: 'L',
      bb_kering: 60, current_dry_weight_version: 1, yellow_streak: yellowStreak,
      risk_level: yellowStreak >= 3 ? 'medium' : 'low', is_active: true,
    });
  });
}

function clinicalBatch(db: Firestore, options: { zone?: 'HIJAU' | 'KUNING' | 'MERAH'; includeAudit?: boolean; yellowStreak?: number } = {}) {
  const submissionId = '11111111-1111-4111-8111-111111111111';
  const preWeight = options.yellowStreak === 3 ? 61.8 : 63.1;
  const raw = ((preWeight - 60) / 60) * 100;
  const display = Math.round(raw * 10) / 10;
  const zone = options.zone ?? (raw > 5 ? 'MERAH' : 'KUNING');
  const streak = options.yellowStreak ?? 0;
  const batch = writeBatch(db);
  batch.set(doc(db, 'patients', 'patient-1', 'sessions', submissionId), {
    id: submissionId, submission_id: submissionId, patient_id: 'patient-1', session_date: serverTimestamp(),
    shift: 'Pagi', pre_weight: preWeight, idwg_raw_pct: raw, idwg_pct: display, zone,
    dry_weight_used_kg: 60, dry_weight_version: 1, formula_version: 'IDWG_V1',
    threshold_version: 'ZONE_2026_V1', protocol_version: 'HD_FLUID_V1', status: 'RECORDED',
    calculation_authority: 'RULES_VERIFIED_CLIENT_V1', interventions: [], nurse_uid: 'user-1',
    nurse_name: 'Perawat Pelaksana Uji', created_at: serverTimestamp(),
  });
  batch.update(doc(db, 'patients', 'patient-1'), {
    latest_session_id: submissionId, latest_session_date: serverTimestamp(), latest_session_status: 'RECORDED',
    latest_pre_weight: preWeight, latest_idwg_pct: display, latest_zone: zone, yellow_streak: streak,
    risk_level: zone === 'MERAH' ? 'high' : streak >= 3 ? 'medium' : 'low', updated_at: serverTimestamp(),
  });
  batch.set(doc(db, 'patient_cards', 'patient-1'), {
    patient_id: 'patient-1', rm: 'RM001', nama: 'Pasien Sintetis', tanggal_lahir: '1980-01-01',
    jenis_kelamin: 'L', bb_kering: 60, latest_session_date: new Date().toISOString(),
    latest_pre_weight: preWeight, latest_idwg_pct: display, latest_zone: zone,
    yellow_streak: streak, risk_level: zone === 'MERAH' ? 'high' : streak >= 3 ? 'medium' : 'low',
    is_active: true, updated_at: serverTimestamp(),
  }, { merge: true });
  if (zone === 'MERAH' || streak === 3) {
    const type = zone === 'MERAH' ? 'RECENT_RED' : 'YELLOW_STREAK_3';
    batch.set(doc(db, 'alerts', `${submissionId}_${type}`), {
      patient_id: 'patient-1', patient_name: 'Pasien Sintetis', type, status: 'OPEN',
      severity: zone === 'MERAH' ? 'HIGH' : 'MEDIUM', trigger_session_id: submissionId,
      dedupe_key: `${submissionId}_${type}`, protocol_version: 'HD_FLUID_V1',
      triggered_at: serverTimestamp(), acknowledged: false, message: 'Alert sintetis untuk pengujian.',
    });
  }
  if (options.includeAudit !== false) {
    batch.set(doc(db, 'audit_logs', `session_${submissionId}`), {
      actor_uid: 'user-1', actor_role: 'PERAWAT', actor_unit: 'Hemodialisis',
      action: 'CREATE_CLINICAL_SESSION', resource_path: `patients/patient-1/sessions/${submissionId}`,
      request_id: submissionId, patient_id: 'patient-1', outcome: 'SUCCESS',
      clinical_result: { zone, idwg_pct: display }, created_at: serverTimestamp(),
    });
  }
  return batch;
}

describe('Firestore Rules — transaksi klinis Spark', () => {
  it('mengizinkan role medis membaca collection-group sesi dan menolak anonim', async () => {
    await seed('DOKTER');
    await environment.withSecurityRulesDisabled(async (context) => setDoc(doc(context.firestore(), 'patients', 'patient-1', 'sessions', 'legacy-1'), {
      patient_id: 'patient-1', zone: 'HIJAU', idwg_pct: 2,
    }));
    const medicalDb = environment.authenticatedContext('user-1').firestore();
    await assertSucceeds(getDocs(collectionGroup(medicalDb, 'sessions')));
    const anonymousDb = environment.unauthenticatedContext().firestore();
    await assertFails(getDocs(collectionGroup(anonymousDb, 'sessions')));
  });

  it('menerima pembuatan pasien lengkap oleh Supervisor', async () => {
    await environment.withSecurityRulesDisabled(async (context) => setDoc(doc(context.firestore(), 'users', 'user-1'), {
      displayName: 'Perawat Mahir Uji', role: 'SUPERVISOR', unit: 'Hemodialisis', is_active: true,
    }));
    const db = environment.authenticatedContext('user-1').firestore();
    const batch = writeBatch(db);
    batch.set(doc(db, 'patient_keys', 'RM002'), { patient_id: 'patient-2', rm: 'RM002', created_at: serverTimestamp() });
    batch.set(doc(db, 'patients', 'patient-2'), {
      rm: 'RM002', nama: 'Pasien Baru', tanggal_lahir: '1990-01-01', jenis_kelamin: 'P', bb_kering: 55,
      yellow_streak: 0, risk_level: 'low', is_active: true, current_dry_weight_version: 1,
      created_at: serverTimestamp(), created_by: 'user-1', updated_at: serverTimestamp(),
    });
    await assertSucceeds(batch.commit());
  });

  it('mengizinkan pengguna mengubah profil sendiri tanpa mengubah role', async () => {
    await seed('PERAWAT');
    const db = environment.authenticatedContext('user-1').firestore();
    await assertSucceeds(updateDoc(doc(db, 'users', 'user-1'), {
      displayName: 'Perawat Pelaksana Produksi',
      email: 'perawat@zonasi-hd.local',
      username: 'perawat',
      unit: 'Hemodialisis',
      updated_at: serverTimestamp(),
    }));
  });

  it('menolak pengguna biasa mengubah role sendiri atau profil pengguna lain', async () => {
    await seed('PERAWAT');
    await environment.withSecurityRulesDisabled(async (context) => setDoc(doc(context.firestore(), 'users', 'user-2'), {
      displayName: 'Dokter Uji', role: 'DOKTER', unit: 'Hemodialisis', is_active: true,
    }));
    const db = environment.authenticatedContext('user-1').firestore();
    await assertFails(updateDoc(doc(db, 'users', 'user-1'), {
      role: 'ADMIN',
      updated_at: serverTimestamp(),
    }));
    await assertFails(updateDoc(doc(db, 'users', 'user-2'), {
      displayName: 'Nama Diubah',
      updated_at: serverTimestamp(),
    }));
  });

  it('mengizinkan admin mengubah role pengguna lain', async () => {
    await seed('ADMIN');
    await environment.withSecurityRulesDisabled(async (context) => setDoc(doc(context.firestore(), 'users', 'user-2'), {
      displayName: 'Perawat Pelaksana Uji', role: 'PERAWAT', unit: 'Hemodialisis', is_active: true,
    }));
    const db = environment.authenticatedContext('user-1').firestore();
    await assertSucceeds(updateDoc(doc(db, 'users', 'user-2'), {
      role: 'SUPERVISOR',
      updated_at: serverTimestamp(),
    }));
  });

  it('mewajibkan versi dry-weight bertambah saat berat kering berubah', async () => {
    await seed('SUPERVISOR');
    const db = environment.authenticatedContext('user-1').firestore();
    await assertFails(updateDoc(doc(db, 'patients', 'patient-1'), {
      bb_kering: 61, current_dry_weight_version: 1, updated_at: serverTimestamp(),
    }));
    await assertSucceeds(updateDoc(doc(db, 'patients', 'patient-1'), {
      bb_kering: 61, current_dry_weight_version: 2, updated_at: serverTimestamp(),
    }));
  });

  it('mengizinkan Perawat Mahir menonaktifkan pasien tanpa hard delete', async () => {
    await seed('SUPERVISOR');
    const db = environment.authenticatedContext('user-1').firestore();
    await assertSucceeds(updateDoc(doc(db, 'patients', 'patient-1'), {
      is_active: false,
      current_dry_weight_version: 1,
      updated_at: serverTimestamp(),
    }));
    await assertFails(deleteDoc(doc(db, 'patients', 'patient-1')));
  });

  it('menerima sesi Merah yang lengkap dan konsisten', async () => {
    await seed();
    const db = environment.authenticatedContext('user-1').firestore();
    await assertSucceeds(clinicalBatch(db).commit());
  });

  it('menerima sesi Merah dengan pembulatan desimal berulang', async () => {
    await environment.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'users', 'user-1'), {
        displayName: 'Perawat Pelaksana Uji', role: 'PERAWAT', unit: 'Hemodialisis', is_active: true,
      });
      await setDoc(doc(db, 'patients', 'patient-1'), {
        rm: 'RM001', nama: 'Pasien Sintetis', tanggal_lahir: '1980-01-01', jenis_kelamin: 'L',
        bb_kering: 45, current_dry_weight_version: 1, yellow_streak: 0, risk_level: 'low', is_active: true,
      });
    });
    const db = environment.authenticatedContext('user-1').firestore();
    const submissionId = '22222222-2222-4222-8222-222222222222';
    const preWeight = 48;
    const raw = ((preWeight - 45) / 45) * 100;
    const display = Math.round(raw * 10) / 10;
    const batch = writeBatch(db);
    batch.set(doc(db, 'patients', 'patient-1', 'sessions', submissionId), {
      id: submissionId, submission_id: submissionId, patient_id: 'patient-1', session_date: serverTimestamp(),
      shift: 'Pagi', pre_weight: preWeight, idwg_raw_pct: raw, idwg_pct: display, zone: 'MERAH',
      dry_weight_used_kg: 45, dry_weight_version: 1, formula_version: 'IDWG_V1',
      threshold_version: 'ZONE_2026_V1', protocol_version: 'HD_FLUID_V1', status: 'RECORDED',
      calculation_authority: 'RULES_VERIFIED_CLIENT_V1', interventions: [], nurse_uid: 'user-1',
      nurse_name: 'Perawat Pelaksana Uji', created_at: serverTimestamp(),
    });
    batch.update(doc(db, 'patients', 'patient-1'), {
      latest_session_id: submissionId, latest_session_date: serverTimestamp(), latest_session_status: 'RECORDED',
      latest_pre_weight: preWeight, latest_idwg_pct: display, latest_zone: 'MERAH',
      yellow_streak: 0, risk_level: 'high', updated_at: serverTimestamp(),
    });
    batch.set(doc(db, 'patient_cards', 'patient-1'), {
      patient_id: 'patient-1', rm: 'RM001', nama: 'Pasien Sintetis', tanggal_lahir: '1980-01-01',
      jenis_kelamin: 'L', bb_kering: 45, latest_session_date: new Date().toISOString(),
      latest_pre_weight: preWeight, latest_idwg_pct: display, latest_zone: 'MERAH',
      yellow_streak: 0, risk_level: 'high', is_active: true, updated_at: serverTimestamp(),
    }, { merge: true });
    batch.set(doc(db, 'alerts', `${submissionId}_RECENT_RED`), {
      patient_id: 'patient-1', patient_name: 'Pasien Sintetis', type: 'RECENT_RED', status: 'OPEN',
      severity: 'HIGH', trigger_session_id: submissionId, dedupe_key: `${submissionId}_RECENT_RED`,
      protocol_version: 'HD_FLUID_V1', triggered_at: serverTimestamp(), acknowledged: false,
      message: `Pasien Sintetis baru tercatat di Zona Merah (${display.toFixed(1)}%).`,
    });
    batch.set(doc(db, 'audit_logs', `session_${submissionId}`), {
      actor_uid: 'user-1', actor_role: 'PERAWAT', actor_unit: 'Hemodialisis',
      action: 'CREATE_CLINICAL_SESSION', resource_path: `patients/patient-1/sessions/${submissionId}`,
      request_id: submissionId, patient_id: 'patient-1', outcome: 'SUCCESS',
      clinical_result: { zone: 'MERAH', idwg_pct: display }, created_at: serverTimestamp(),
    });
    await assertSucceeds(batch.commit());
  });

  it('menerima alert tepat pada streak Kuning ketiga', async () => {
    await seed('PERAWAT', 2);
    const db = environment.authenticatedContext('user-1').firestore();
    await assertSucceeds(clinicalBatch(db, { yellowStreak: 3 }).commit());
  });

  it('menolak zona yang dimanipulasi', async () => {
    await seed();
    const db = environment.authenticatedContext('user-1').firestore();
    await assertFails(clinicalBatch(db, { zone: 'HIJAU' }).commit());
  });

  it('menolak transaksi tanpa audit wajib', async () => {
    await seed();
    const db = environment.authenticatedContext('user-1').firestore();
    await assertFails(clinicalBatch(db, { includeAudit: false }).commit());
  });

  it('menolak Dokter membuat sesi', async () => {
    await seed('DOKTER');
    const db = environment.authenticatedContext('user-1').firestore();
    await assertFails(clinicalBatch(db).commit());
  });

  it('hanya menerima acknowledgement dengan identitas dan waktu server', async () => {
    await seed('SUPERVISOR');
    await environment.withSecurityRulesDisabled(async (context) => setDoc(doc(context.firestore(), 'alerts', 'alert-1'), {
      acknowledged: false, patient_id: 'patient-1', patient_name: 'Pasien Sintetis', type: 'RECENT_RED',
      triggered_at: new Date(), message: 'Uji',
    }));
    const db = environment.authenticatedContext('user-1').firestore();
    await assertSucceeds(updateDoc(doc(db, 'alerts', 'alert-1'), {
      acknowledged: true, acknowledged_by: 'Perawat Pelaksana Uji', acknowledged_at: serverTimestamp(),
    }));
  });
});
