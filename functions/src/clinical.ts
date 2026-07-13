import { z } from 'zod';

export type Zone = 'HIJAU' | 'KUNING' | 'MERAH';

export const FORMULA_VERSION = 'IDWG_V1' as const;
export const THRESHOLD_VERSION = 'ZONE_2026_V1' as const;
export const PROTOCOL_VERSION = 'HD_FLUID_V1' as const;

export const clinicalSessionSchema = z.object({
  patientId: z.string().trim().min(1).max(128),
  submissionId: z.uuid(),
  preWeight: z.number().finite().min(20).max(250),
  postWeight: z.number().finite().min(20).max(250).optional(),
  ufGoal: z.number().finite().min(0).max(20).optional(),
  notes: z.string().trim().max(500).optional(),
  shift: z.enum(['Pagi', 'Siang', 'Sore', 'Malam']),
  interventions: z.array(z.string().trim().min(1).max(160)).max(20).default([]),
}).strict();

export type ClinicalSessionInput = z.infer<typeof clinicalSessionSchema>;

export function calculateClinicalIDWG(preWeight: number, dryWeight: number) {
  if (!Number.isFinite(preWeight) || preWeight < 20 || preWeight > 250) {
    throw new Error('Berat pre-HD tidak valid.');
  }
  if (!Number.isFinite(dryWeight) || dryWeight < 20 || dryWeight > 250) {
    throw new Error('Berat kering pasien tidak valid.');
  }
  const raw = ((preWeight - dryWeight) / dryWeight) * 100;
  const display = Math.round(raw * 10) / 10;
  const zone: Zone = raw < 3 ? 'HIJAU' : raw <= 5 ? 'KUNING' : 'MERAH';
  return { raw, display, zone };
}

export function nextYellowStreak(zone: Zone, previousZones: Zone[]): number {
  if (zone !== 'KUNING') return 0;
  let streak = 1;
  for (const previous of previousZones) {
    if (previous !== 'KUNING') break;
    streak += 1;
  }
  return streak;
}
