/**
 * ZONASI-HD Core Clinical Calculation Engine
 * Pure functions — 100% testable, no side effects
 * Thresholds persis sesuai Proposal Inovasi ZONASI-HD
 */

import type { Zone } from '../types';

/**
 * Menghitung Interdialytic Weight Gain (IDWG) dalam persen
 * Rumus resmi dari proposal:
 * IDWG % = ((BB Pre-HD - BB Kering) / BB Kering) × 100
 */
export function calculateIDWG(preHDWeight: number, dryWeight: number): number {
  return Math.round(calculateIDWGRaw(preHDWeight, dryWeight) * 10) / 10;
}

/** Nilai presisi penuh untuk penentuan zona dan validasi Rules. */
export function calculateIDWGRaw(preHDWeight: number, dryWeight: number): number {
  if (!Number.isFinite(dryWeight) || dryWeight <= 0) {
    throw new Error('Berat badan kering (Dry Weight) harus lebih dari 0 kg');
  }
  if (!Number.isFinite(preHDWeight) || preHDWeight <= 0) {
    throw new Error('Berat badan pre-HD harus lebih dari 0 kg');
  }

  const idwg = ((preHDWeight - dryWeight) / dryWeight) * 100;
  return idwg;
}

/**
 * Menentukan zona berdasarkan IDWG % (threshold persis proposal)
 */
export function getZone(idwgPct: number): Zone {
  if (!Number.isFinite(idwgPct)) throw new Error('Nilai IDWG tidak valid');
  const boundaryTolerance = 1e-9;
  if (idwgPct < 3 - boundaryTolerance) return 'HIJAU';
  if (idwgPct <= 5 + boundaryTolerance) return 'KUNING';
  return 'MERAH';
}

/**
 * Mendapatkan label zona dalam Bahasa Indonesia
 */
export function getZoneLabel(zone: Zone): string {
  switch (zone) {
    case 'HIJAU': return 'ZONA HIJAU';
    case 'KUNING': return 'ZONA KUNING';
    case 'MERAH': return 'ZONA MERAH';
    default: return 'TIDAK DIKETAHUI';
  }
}

/**
 * Mendapatkan deskripsi singkat risiko & edukasi untuk pasien
 */
export function getZoneDescription(zone: Zone): string {
  switch (zone) {
    case 'HIJAU':
      return 'Risiko rendah. Pertahankan asupan cairan dan diet seperti biasa. Bagus!';
    case 'KUNING':
      return 'Risiko sedang. Kurangi minum & garam. Perawat Pelaksana akan memantau lebih ketat.';
    case 'MERAH':
      return 'RISIKO TINGGI! Kelebihan cairan berbahaya. Segera ikuti instruksi perawat & dokter.';
    default:
      return '';
  }
}

/**
 * Rekomendasi tindakan singkat berdasarkan zona & role
 * (Versi lengkap ada di ProtocolModal)
 */
export function getQuickRecommendations(zone: Zone, role: string): string[] {
  const base: string[] = [];

  if (zone === 'HIJAU') {
    base.push('Edukasi rutin kepatuhan cairan');
    base.push('Catat di Kartu Kendali pasien');
  }

  if (zone === 'KUNING') {
    base.push('Konseling diet natrium & pembatasan cairan intensif');
    base.push('Evaluasi target UF dan toleransi pasien sesuai asesmen klinis');
    base.push('Monitoring ketat selama sesi HD');
    if (role === 'SUPERVISOR' || role === 'DOKTER') {
      base.push('Evaluasi kemungkinan dry weight adjustment');
    }
  }

  if (zone === 'MERAH') {
    base.push('AKTIVASI PROTOKOL EDEMA PARU');
    base.push('Lakukan asesmen segera dan eskalasi kepada Perawat Mahir/DPJP');
    base.push('Ikuti protokol kegawatdaruratan dan instruksi medis setempat');
    base.push('Catat semua tindakan di rekam medis');
  }

  return base;
}

/**
 * Menghitung streak Kuning berturut-turut dari array sesi (paling baru dulu)
 * Digunakan untuk Early Warning System
 */
export function calculateYellowStreak(sessions: Array<{ zone: Zone }>): number {
  let streak = 0;
  for (const session of sessions) {
    if (session.zone === 'KUNING') {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Helper untuk validasi input berat (digunakan di Zod schema)
 */
export function isValidWeight(weight: number): boolean {
  return weight > 0 && weight < 200; // realistic range untuk manusia dewasa
}

export function isPreWeightReasonable(pre: number, dry: number): boolean {
  // Biasanya pre > dry, tapi beri tolerance kecil
  return pre >= dry * 0.95;
}

