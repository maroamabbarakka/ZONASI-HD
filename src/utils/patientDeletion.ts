import type { AppData } from '../types';

export function removePatientsFromData(data: AppData, patientIds: string[]): AppData {
  if (!patientIds.length) return data;
  const removed = new Set(patientIds);
  return {
    patients: data.patients.filter((patient) => !removed.has(patient.id)),
    sessions: data.sessions.filter((session) => !removed.has(session.patient_id)),
    alerts: data.alerts.filter((alert) => !removed.has(alert.patient_id)),
  };
}
