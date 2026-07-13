import { describe, expect, it } from 'vitest';
import { matchesDemoAccount } from './demoAccount';

const config = { enabled: true, email: 'demo@zonasi-hd.app', password: 'ZonasiDemo2026!' };

describe('akun demo terisolasi', () => {
  it('menerima email tanpa membedakan kapital tetapi menjaga password exact', () => {
    expect(matchesDemoAccount(' Demo@ZONASI-HD.app ', 'ZonasiDemo2026!', config)).toBe(true);
    expect(matchesDemoAccount('demo@zonasi-hd.app', 'zonasidemo2026!', config)).toBe(false);
  });

  it('menolak konfigurasi nonaktif atau password konfigurasi lemah', () => {
    expect(matchesDemoAccount(config.email, config.password, { ...config, enabled: false })).toBe(false);
    expect(matchesDemoAccount(config.email, 'pendek', { ...config, password: 'pendek' })).toBe(false);
  });
});
