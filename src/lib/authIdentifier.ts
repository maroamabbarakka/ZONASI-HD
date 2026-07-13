export const DEFAULT_AUTH_USERNAME_DOMAIN = 'zonasi-hd.local';

export function normalizeAuthIdentifier(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '');
}

export function buildFirebaseAuthEmail(identifier: string, domain = DEFAULT_AUTH_USERNAME_DOMAIN): string {
  const normalized = normalizeAuthIdentifier(identifier);
  if (!normalized) return '';
  if (normalized.includes('@')) return normalized;
  return `${normalized}@${normalizeAuthIdentifier(domain) || DEFAULT_AUTH_USERNAME_DOMAIN}`;
}
