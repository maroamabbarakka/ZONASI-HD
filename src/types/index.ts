export type Zone = 'HIJAU' | 'KUNING' | 'MERAH';
export type UserRole = 'PERAWAT' | 'SUPERVISOR' | 'DOKTER' | 'ADMIN';
export type SessionStatus = 'RECORDED' | 'VERIFIED' | 'REVIEWED' | 'CORRECTED' | 'VOIDED_WITH_REASON';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  unit: string;
}

export interface Patient {
  id: string;
  rm: string;
  nama: string;
  tanggal_lahir: string;
  jenis_kelamin: 'L' | 'P';
  bb_kering: number;
  latest_session_date?: string;
  latest_pre_weight?: number;
  latest_idwg_pct?: number;
  latest_zone?: Zone;
  latest_session_status?: SessionStatus;
  yellow_streak: number;
  risk_level: 'low' | 'medium' | 'high';
  is_active: boolean;
  notes?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
}

export interface PatientInput {
  rm: string;
  nama: string;
  tanggal_lahir: string;
  jenis_kelamin: 'L' | 'P';
  bb_kering: number;
  notes?: string;
}

export interface PatientImportRow extends Omit<PatientInput, 'jenis_kelamin'> {
  jenis_kelamin: 'L' | 'P' | '';
  rowNumber: number;
  errors: string[];
}

export interface HDSession {
  id: string;
  submission_id: string;
  patient_id: string;
  session_date: string;
  shift: 'Pagi' | 'Siang' | 'Sore' | 'Malam';
  pre_weight: number;
  post_weight?: number;
  idwg_pct: number;
  idwg_raw_pct?: number;
  zone: Zone;
  dry_weight_used_kg: number;
  dry_weight_version: number;
  formula_version: 'IDWG_V1';
  threshold_version: 'ZONE_2026_V1';
  protocol_version: 'HD_FLUID_V1';
  status: SessionStatus;
  calculation_authority: 'CLIENT_MVP' | 'TRUSTED_API_V1';
  interventions: string[];
  uf_goal?: number;
  notes?: string;
  nurse_uid: string;
  nurse_name: string;
  created_at: string;
}

export interface Alert {
  id: string;
  patient_id: string;
  patient_name: string;
  type: 'YELLOW_STREAK_3' | 'RECENT_RED';
  triggered_at: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  message: string;
}

export interface SessionFormData {
  submission_id: string;
  pre_weight: number;
  post_weight?: number;
  uf_goal?: number;
  notes?: string;
  shift: HDSession['shift'];
  interventions: string[];
}

export interface AppData {
  patients: Patient[];
  sessions: HDSession[];
  alerts: Alert[];
}

export type DataMode = 'demo' | 'firebase';
