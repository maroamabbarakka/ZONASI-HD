export type Zone = 'HIJAU' | 'KUNING' | 'MERAH';
export type UserRole = 'PK_II' | 'PK_III' | 'DOKTER' | 'ADMIN';

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
  yellow_streak: number;
  risk_level: 'low' | 'medium' | 'high';
  is_active: boolean;
  notes?: string;
}

export interface HDSession {
  id: string;
  patient_id: string;
  session_date: string;
  shift: 'Pagi' | 'Siang' | 'Sore' | 'Malam';
  pre_weight: number;
  post_weight?: number;
  idwg_pct: number;
  zone: Zone;
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
