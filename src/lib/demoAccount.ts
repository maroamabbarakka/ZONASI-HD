import type { UserRole } from '../types';

export interface DemoAccountsConfig {
  enabled: boolean;
  domain: string;
  password: string;
}

const demoRoles: UserRole[] = ['PERAWAT', 'SUPERVISOR', 'DOKTER', 'ADMIN'];

export function getDemoAccountRole(email: string, password: string, config: DemoAccountsConfig): UserRole | null {
  if (!config.enabled || config.domain.length === 0 || config.password.length < 6 || password !== config.password) return null;
  const normalizedEmail = email.trim().toLowerCase();
  return demoRoles.find((role) => normalizedEmail === `${role.toLowerCase()}@${config.domain.trim().toLowerCase()}`) ?? null;
}

export const demoAccountsConfig: DemoAccountsConfig = {
  enabled: import.meta.env.VITE_DEMO_ACCOUNTS_ENABLED === 'true',
  domain: import.meta.env.VITE_DEMO_ACCOUNT_DOMAIN ?? 'zonasi-hd.app',
  password: import.meta.env.VITE_DEMO_ACCOUNT_PASSWORD ?? '',
};
