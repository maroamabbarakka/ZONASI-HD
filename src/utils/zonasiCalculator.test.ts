import { describe, expect, it } from 'vitest';
import { calculateIDWG, calculateIDWGRaw, calculateYellowStreak, getZone } from './zonasiCalculator';

describe('mesin kalkulasi klinis ZONASI-HD', () => {
  it('menghitung IDWG dan membulatkan satu desimal', () => expect(calculateIDWG(64.4, 62.5)).toBe(3));
  it('mempertahankan presisi mentah untuk validasi', () => expect(calculateIDWGRaw(64.4, 62.5)).toBeCloseTo(3.04, 8));
  it('menetralkan artefak floating point tepat di batas 3%', () => expect(getZone(calculateIDWGRaw(61.8, 60))).toBe('KUNING'));
  it.each([[2.9, 'HIJAU'], [3, 'KUNING'], [5, 'KUNING'], [5.1, 'MERAH']] as const)('memetakan %s ke %s', (value, zone) => expect(getZone(value)).toBe(zone));
  it('menolak berat tidak valid', () => { expect(() => calculateIDWG(Number.NaN, 60)).toThrow(); expect(() => calculateIDWG(65, 0)).toThrow(); });
  it('menghitung hanya streak dari sesi terbaru', () => expect(calculateYellowStreak([{ zone: 'KUNING' }, { zone: 'KUNING' }, { zone: 'HIJAU' }, { zone: 'KUNING' }])).toBe(2));
});
