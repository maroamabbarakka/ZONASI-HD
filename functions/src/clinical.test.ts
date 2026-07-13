import { describe, expect, it } from 'vitest';
import { calculateClinicalIDWG, clinicalSessionSchema, nextYellowStreak } from './clinical.js';

describe('trusted clinical engine', () => {
  it('menghitung nilai mentah, tampilan, dan zona', () => {
    const result = calculateClinicalIDWG(64.4, 62.5);
    expect(result.raw).toBeCloseTo(3.04, 8);
    expect(result).toMatchObject({ display: 3, zone: 'KUNING' });
  });

  it('menetapkan zona dari presisi mentah, bukan angka tampilan', () => {
    const result = calculateClinicalIDWG(102.99, 100);
    expect(result.display).toBe(3);
    expect(result.zone).toBe('HIJAU');
  });

  it('menerapkan batas zona secara inklusif pada 5%', () => {
    expect(calculateClinicalIDWG(103, 100).zone).toBe('KUNING');
    expect(calculateClinicalIDWG(105, 100).zone).toBe('KUNING');
    expect(calculateClinicalIDWG(105.01, 100).zone).toBe('MERAH');
  });

  it('menghitung streak hanya dari sesi terdahulu yang berurutan', () => {
    expect(nextYellowStreak('KUNING', ['KUNING', 'KUNING', 'HIJAU'])).toBe(3);
    expect(nextYellowStreak('MERAH', ['KUNING'])).toBe(0);
  });

  it('menolak payload berlebih atau tidak valid', () => {
    const base = { patientId: 'p1', submissionId: crypto.randomUUID(), preWeight: 65, shift: 'Pagi', interventions: [] };
    expect(clinicalSessionSchema.safeParse(base).success).toBe(true);
    expect(clinicalSessionSchema.safeParse({ ...base, zone: 'HIJAU' }).success).toBe(false);
    expect(clinicalSessionSchema.safeParse({ ...base, notes: 'x'.repeat(501) }).success).toBe(false);
  });
});
