import { describe, expect, it } from 'vitest';
import { buildFirebaseAuthEmail, normalizeAuthIdentifier } from './authIdentifier';

describe('auth identifier username login', () => {
  it('membangun email internal Firebase dari username', () => {
    expect(buildFirebaseAuthEmail(' Perawat 1 ', 'zonasi-hd.local')).toBe('perawat1@zonasi-hd.local');
  });

  it('meneruskan email asli bila petugas tetap memakai email', () => {
    expect(buildFirebaseAuthEmail(' USER@RS.TEST ', 'zonasi-hd.local')).toBe('user@rs.test');
  });

  it('menormalisasi spasi dan kapital', () => {
    expect(normalizeAuthIdentifier(' Dokter HD ')).toBe('dokterhd');
  });
});
