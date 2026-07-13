import { describe, expect, it } from 'vitest';
import { calculateIDWG, calculateYellowStreak, getZone } from './zonasiCalculator';

describe('mesin kalkulasi klinis ZONASI-HD', () => {
  it('menghitung IDWG dan membulatkan satu desimal', () => expect(calculateIDWG(64.4, 62.5)).toBe(3));
  it.each([[2.9, 'HIJAU'], [3, 'KUNING'], [5, 'KUNING'], [5.1, 'MERAH']] as const)('memetakan %s ke %s', (value, zone) => expect(getZone(value)).toBe(zone));
  it('menolak berat tidak valid', () => { expect(() => calculateIDWG(Number.NaN, 60)).toThrow(); expect(() => calculateIDWG(65, 0)).toThrow(); });
  it('menghitung hanya streak dari sesi terbaru', () => expect(calculateYellowStreak([{ zone: 'KUNING' }, { zone: 'KUNING' }, { zone: 'HIJAU' }, { zone: 'KUNING' }])).toBe(2));
});
