import type { UserRole } from '../types';

export const roleLabels: Record<UserRole, string> = {
  PERAWAT: 'Perawat Pelaksana',
  SUPERVISOR: 'Perawat Mahir',
  DOKTER: 'Dokter',
  ADMIN: 'Administrator',
};

export function normalizeRole(value: unknown): UserRole | null {
  if (value === 'PK_II') return 'PERAWAT';
  if (value === 'PK_III') return 'SUPERVISOR';
  return ['PERAWAT', 'SUPERVISOR', 'DOKTER', 'ADMIN'].includes(String(value)) ? value as UserRole : null;
}

export const canInputSession = (role?: UserRole) => role === 'PERAWAT' || role === 'SUPERVISOR';
export const canManagePatients = (role?: UserRole) => role === 'SUPERVISOR' || role === 'ADMIN';
export const canImportPatients = (role?: UserRole) => role === 'ADMIN';
export const canHandleAlerts = (role?: UserRole) => role === 'SUPERVISOR' || role === 'DOKTER' || role === 'ADMIN';
export const canExportReports = (role?: UserRole) => role === 'SUPERVISOR' || role === 'DOKTER' || role === 'ADMIN';
export const canViewRedProtocol = (role?: UserRole) => role !== 'PERAWAT';
