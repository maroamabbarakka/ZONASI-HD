import { getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import {
  FORMULA_VERSION, PROTOCOL_VERSION, THRESHOLD_VERSION,
  calculateClinicalIDWG, clinicalSessionSchema, nextYellowStreak, type Zone,
} from './clinical.js';

if (!getApps().length) initializeApp();
const db = getFirestore();
const WRITER_ROLES = new Set(['PERAWAT', 'SUPERVISOR', 'PK_II', 'PK_III']);

function clean<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}

export const createClinicalSession = onCall({
  region: 'asia-southeast2',
  timeoutSeconds: 30,
  memory: '256MiB',
}, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Silakan login kembali.');
  const auth = request.auth;

  const parsed = clinicalSessionSchema.safeParse(request.data);
  if (!parsed.success) {
    logger.warn('Invalid clinical session payload', { uid: auth.uid, issues: parsed.error.issues });
    throw new HttpsError('invalid-argument', 'Data sesi tidak valid.', parsed.error.flatten());
  }

  const input = parsed.data;
  const userSnap = await db.doc(`users/${auth.uid}`).get();
  if (!userSnap.exists) throw new HttpsError('permission-denied', 'Profil pengguna tidak ditemukan.');
  const profile = userSnap.data() ?? {};
  const role = String(profile.role ?? '');
  if (profile.is_active === false || !WRITER_ROLES.has(role)) {
    throw new HttpsError('permission-denied', 'Anda tidak memiliki izin input sesi.');
  }

  const patientRef = db.doc(`patients/${input.patientId}`);
  const sessionRef = patientRef.collection('sessions').doc(input.submissionId);
  const historyQuery = patientRef.collection('sessions').orderBy('session_date', 'desc').limit(30);
  const now = Timestamp.now();

  try {
    return await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(sessionRef);
      if (existing.exists) {
        const value = existing.data()!;
        return {
          session: { ...value, id: existing.id, session_date: value.session_date.toDate().toISOString(), created_at: value.created_at.toDate().toISOString() },
          idempotentReplay: true,
        };
      }

      const patientSnap = await transaction.get(patientRef);
      if (!patientSnap.exists) throw new HttpsError('not-found', 'Pasien tidak ditemukan.');
      const patient = patientSnap.data()!;
      if (patient.is_active === false) throw new HttpsError('failed-precondition', 'Pasien nonaktif tidak dapat memiliki sesi baru.');

      const history = await transaction.get(historyQuery);
      const dryWeight = Number(patient.bb_kering);
      let calculation;
      try { calculation = calculateClinicalIDWG(input.preWeight, dryWeight); }
      catch (error) { throw new HttpsError('failed-precondition', error instanceof Error ? error.message : 'Data berat tidak valid.'); }

      const previousZones: Zone[] = history.docs.map((item) => {
        const zone = item.data().zone;
        return ['HIJAU', 'KUNING', 'MERAH'].includes(zone) ? zone as Zone : 'HIJAU';
      });
      const yellowStreak = nextYellowStreak(calculation.zone, previousZones);
      const nurseName = String(profile.displayName || auth.token.name || auth.token.email || 'Petugas');
      const dryWeightVersion = Number(patient.current_dry_weight_version ?? 1);
      const session = clean({
        id: input.submissionId,
        submission_id: input.submissionId,
        patient_id: input.patientId,
        session_date: now,
        shift: input.shift,
        pre_weight: input.preWeight,
        post_weight: input.postWeight,
        uf_goal: input.ufGoal,
        notes: input.notes,
        interventions: input.interventions,
        dry_weight_used_kg: dryWeight,
        dry_weight_version: dryWeightVersion,
        idwg_raw_pct: calculation.raw,
        idwg_pct: calculation.display,
        zone: calculation.zone,
        formula_version: FORMULA_VERSION,
        threshold_version: THRESHOLD_VERSION,
        protocol_version: PROTOCOL_VERSION,
        status: 'RECORDED',
        calculation_authority: 'TRUSTED_API_V1',
        nurse_uid: auth.uid,
        nurse_name: nurseName,
        created_at: now,
      });

      transaction.create(sessionRef, session);
      transaction.update(patientRef, {
        latest_session_date: now,
        latest_session_status: 'RECORDED',
        latest_pre_weight: input.preWeight,
        latest_idwg_pct: calculation.display,
        latest_zone: calculation.zone,
        yellow_streak: yellowStreak,
        risk_level: calculation.zone === 'MERAH' ? 'high' : yellowStreak >= 3 ? 'medium' : 'low',
        updated_at: now,
      });

      const alertType = calculation.zone === 'MERAH' ? 'RECENT_RED' : yellowStreak === 3 ? 'YELLOW_STREAK_3' : null;
      if (alertType) {
        const alertRef = db.doc(`alerts/${input.submissionId}_${alertType}`);
        const message = alertType === 'RECENT_RED'
          ? `${String(patient.nama)} baru tercatat di Zona Merah (${calculation.display.toFixed(1)}%).`
          : `${String(patient.nama)} berada di Zona Kuning selama 3 sesi berturut-turut.`;
        transaction.create(alertRef, {
          patient_id: input.patientId,
          patient_name: String(patient.nama),
          type: alertType,
          status: 'OPEN',
          severity: alertType === 'RECENT_RED' ? 'HIGH' : 'MEDIUM',
          trigger_session_id: input.submissionId,
          dedupe_key: `${input.submissionId}_${alertType}`,
          protocol_version: PROTOCOL_VERSION,
          triggered_at: now,
          acknowledged: false,
          message,
          timeline: [{ event: 'OPENED', at: now, actor_uid: auth.uid }],
        });
      }

      transaction.create(db.doc(`audit_logs/session_${input.submissionId}`), {
        actor_uid: auth.uid,
        actor_role: role,
        actor_unit: String(profile.unit ?? 'Hemodialisis'),
        action: 'CREATE_CLINICAL_SESSION',
        resource_path: sessionRef.path,
        request_id: input.submissionId,
        patient_id: input.patientId,
        outcome: 'SUCCESS',
        clinical_result: { zone: calculation.zone, idwg_pct: calculation.display },
        created_at: now,
        server_timestamp: FieldValue.serverTimestamp(),
      });

      return {
        session: { ...session, session_date: now.toDate().toISOString(), created_at: now.toDate().toISOString() },
        idempotentReplay: false,
      };
    });
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    logger.error('createClinicalSession failed', { error, uid: auth.uid, patientId: input.patientId, submissionId: input.submissionId });
    throw new HttpsError('internal', 'Sesi belum dapat disimpan. Silakan coba kembali dengan submission yang sama.');
  }
});
