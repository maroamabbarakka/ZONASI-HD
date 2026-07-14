import { describe, expect, it } from 'vitest';
import type { Alert, AppData, HDSession, Patient } from '../types';
import { removePatientsFromData } from './patientDeletion';

const patients: Patient[] = [
  { id: 'p1', rm: 'RM001', nama: 'Ayu', tanggal_lahir: '1990-01-01', jenis_kelamin: 'P', bb_kering: 55, yellow_streak: 0, risk_level: 'low', is_active: true },
  { id: 'p2', rm: 'RM002', nama: 'Budi', tanggal_lahir: '1985-05-05', jenis_kelamin: 'L', bb_kering: 60, yellow_streak: 1, risk_level: 'medium', is_active: true },
];

const sessions: HDSession[] = [
  { id: 's1', submission_id: 's1', patient_id: 'p1', session_date: '2026-01-01T00:00:00.000Z', shift: 'Pagi', pre_weight: 56, idwg_pct: 1.8, zone: 'HIJAU', dry_weight_used_kg: 55, dry_weight_version: 1, formula_version: 'IDWG_V1', threshold_version: 'ZONE_2026_V1', protocol_version: 'HD_FLUID_V1', status: 'VERIFIED', calculation_authority: 'CLIENT_MVP', interventions: [], nurse_uid: 'u1', nurse_name: 'Nurse', created_at: '2026-01-01T00:00:00.000Z' },
  { id: 's2', submission_id: 's2', patient_id: 'p2', session_date: '2026-01-02T00:00:00.000Z', shift: 'Siang', pre_weight: 60, idwg_pct: 2.2, zone: 'KUNING', dry_weight_used_kg: 60, dry_weight_version: 1, formula_version: 'IDWG_V1', threshold_version: 'ZONE_2026_V1', protocol_version: 'HD_FLUID_V1', status: 'VERIFIED', calculation_authority: 'CLIENT_MVP', interventions: [], nurse_uid: 'u1', nurse_name: 'Nurse', created_at: '2026-01-02T00:00:00.000Z' },
];

const alerts: Alert[] = [
  { id: 'a1', patient_id: 'p1', patient_name: 'Ayu', type: 'YELLOW_STREAK_3', triggered_at: '2026-01-01T00:00:00.000Z', acknowledged: false, message: 'Ayu' },
  { id: 'a2', patient_id: 'p2', patient_name: 'Budi', type: 'RECENT_RED', triggered_at: '2026-01-02T00:00:00.000Z', acknowledged: false, message: 'Budi' },
];

const baseData: AppData = { patients, sessions, alerts };

describe('removePatientsFromData', () => {
  it('removes selected patients along with their related sessions and alerts', () => {
    const next = removePatientsFromData(baseData, ['p1']);

    expect(next.patients.map((patient) => patient.id)).toEqual(['p2']);
    expect(next.sessions.map((session) => session.patient_id)).toEqual(['p2']);
    expect(next.alerts.map((alert) => alert.patient_id)).toEqual(['p2']);
  });

  it('returns the original data when no patient ids are provided', () => {
    const next = removePatientsFromData(baseData, []);

    expect(next).toEqual(baseData);
  });
});
