import { describe, expect, it } from 'vitest';
import { canExportReports, canImportPatients, canInputSession, canManagePatients, normalizeRole } from './permissions';

describe('role dan permission', () => {
  it('memigrasikan nama role lama', () => { expect(normalizeRole('PK_II')).toBe('PERAWAT'); expect(normalizeRole('PK_III')).toBe('SUPERVISOR'); });
  it('membatasi input sesi', () => { expect(canInputSession('PERAWAT')).toBe(true); expect(canInputSession('DOKTER')).toBe(false); });
  it('membatasi master pasien', () => { expect(canManagePatients('SUPERVISOR')).toBe(true); expect(canManagePatients('PERAWAT')).toBe(false); });
  it('membatasi import hanya admin', () => { expect(canImportPatients('ADMIN')).toBe(true); expect(canImportPatients('SUPERVISOR')).toBe(false); });
  it('membatasi ekspor sensitif', () => { expect(canExportReports('DOKTER')).toBe(true); expect(canExportReports('PERAWAT')).toBe(false); });
});
