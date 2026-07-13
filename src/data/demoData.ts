import type { AppData, HDSession, Patient } from '../types';
import { calculateIDWG, calculateYellowStreak, getZone } from '../utils/zonasiCalculator';

const day = (offset: number, hour = 8) => {
  const value = new Date();
  value.setDate(value.getDate() + offset);
  value.setHours(hour, 0, 0, 0);
  return value.toISOString();
};

const patientSeeds: Array<Omit<Patient, 'latest_session_date' | 'latest_pre_weight' | 'latest_idwg_pct' | 'latest_zone' | 'yellow_streak' | 'risk_level'>> = [
  { id: 'p-001', rm: 'DEMO-001', nama: 'Budi Santoso', tanggal_lahir: '1964-02-11', jenis_kelamin: 'L', bb_kering: 62.5, is_active: true },
  { id: 'p-002', rm: 'DEMO-002', nama: 'Siti Aminah', tanggal_lahir: '1971-08-20', jenis_kelamin: 'P', bb_kering: 51.0, is_active: true },
  { id: 'p-003', rm: 'DEMO-003', nama: 'Ahmad Basri', tanggal_lahir: '1958-05-04', jenis_kelamin: 'L', bb_kering: 67.0, is_active: true },
  { id: 'p-004', rm: 'DEMO-004', nama: 'Nurhayati', tanggal_lahir: '1968-11-16', jenis_kelamin: 'P', bb_kering: 55.5, is_active: true },
  { id: 'p-005', rm: 'DEMO-005', nama: 'Rahman Saleh', tanggal_lahir: '1977-01-30', jenis_kelamin: 'L', bb_kering: 70.0, is_active: true },
  { id: 'p-006', rm: 'DEMO-006', nama: 'Hasna Abdullah', tanggal_lahir: '1980-06-12', jenis_kelamin: 'P', bb_kering: 48.5, is_active: true },
];

const patterns: Record<string, number[]> = {
  'p-001': [1.6, 2.0, 1.8, 2.2, 1.9],
  'p-002': [2.8, 3.4, 3.8, 4.1, 4.3],
  'p-003': [3.2, 4.0, 4.7, 5.4, 6.2],
  'p-004': [2.1, 2.5, 3.1, 2.7, 2.4],
  'p-005': [4.8, 4.2, 3.7, 3.2, 2.9],
  'p-006': [1.9, 2.2, 2.0, 2.6, 3.3],
};

function makeSession(patient: Patient, pct: number, index: number): HDSession {
  const pre = Math.round(patient.bb_kering * (1 + pct / 100) * 10) / 10;
  const idwg = calculateIDWG(pre, patient.bb_kering);
  const timestamp = day((index - 4) * 3, index % 2 ? 13 : 8);
  return {
    id: `${patient.id}-s-${index}`,
    patient_id: patient.id,
    session_date: timestamp,
    shift: index % 2 ? 'Siang' : 'Pagi',
    pre_weight: pre,
    post_weight: patient.bb_kering + 0.2,
    idwg_pct: idwg,
    zone: getZone(idwg),
    interventions: [],
    nurse_uid: 'demo-pk3',
    nurse_name: 'Perawat Demo',
    created_at: timestamp,
  };
}

export function createDemoData(): AppData {
  const basePatients = patientSeeds.map((item) => ({ ...item, yellow_streak: 0, risk_level: 'low' as const }));
  const sessions = basePatients.flatMap((patient) => patterns[patient.id].map((pct, index) => makeSession(patient, pct, index)));
  const patients = basePatients.map((patient) => {
    const own = sessions.filter((session) => session.patient_id === patient.id).sort((a, b) => b.session_date.localeCompare(a.session_date));
    const latest = own[0];
    const yellowStreak = calculateYellowStreak(own);
    return {
      ...patient,
      latest_session_date: latest.session_date,
      latest_pre_weight: latest.pre_weight,
      latest_idwg_pct: latest.idwg_pct,
      latest_zone: latest.zone,
      yellow_streak: yellowStreak,
      risk_level: latest.zone === 'MERAH' ? 'high' as const : yellowStreak >= 3 ? 'medium' as const : 'low' as const,
    };
  });
  const warning = patients.find((patient) => patient.yellow_streak >= 3);
  return {
    patients,
    sessions,
    alerts: warning ? [{
      id: `alert-${warning.id}`,
      patient_id: warning.id,
      patient_name: warning.nama,
      type: 'YELLOW_STREAK_3',
      triggered_at: new Date().toISOString(),
      acknowledged: false,
      message: `${warning.nama} berada di Zona Kuning selama ${warning.yellow_streak} sesi berturut-turut.`,
    }] : [],
  };
}
