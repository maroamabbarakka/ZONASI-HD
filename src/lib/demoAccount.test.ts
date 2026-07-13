import { describe, expect, it } from 'vitest';
import { getDemoAccountRole } from './demoAccount';

const config = { enabled: true, domain: 'zonasi-hd.app', password: '123456' };

describe('akun demo terisolasi per role', () => {
  it.each([
    ['perawat@zonasi-hd.app', 'PERAWAT'],
    ['supervisor@zonasi-hd.app', 'SUPERVISOR'],
    ['dokter@zonasi-hd.app', 'DOKTER'],
    ['admin@zonasi-hd.app', 'ADMIN'],
  ] as const)('memetakan %s ke role %s', (email, role) => {
    expect(getDemoAccountRole(email, '123456', config)).toBe(role);
  });

  it('email tidak peka kapital tetapi password harus persis', () => {
    expect(getDemoAccountRole(' PERAWAT@ZONASI-HD.APP ', '123456', config)).toBe('PERAWAT');
    expect(getDemoAccountRole('perawat@zonasi-hd.app', '1234567', config)).toBeNull();
  });

  it('menolak akun tidak dikenal, konfigurasi nonaktif, atau password konfigurasi terlalu pendek', () => {
    expect(getDemoAccountRole('demo@zonasi-hd.app', '123456', config)).toBeNull();
    expect(getDemoAccountRole('admin@zonasi-hd.app', '123456', { ...config, enabled: false })).toBeNull();
    expect(getDemoAccountRole('admin@zonasi-hd.app', '12345', { ...config, password: '12345' })).toBeNull();
  });
});
