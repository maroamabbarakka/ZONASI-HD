export interface DemoAccountConfig {
  enabled: boolean;
  email: string;
  password: string;
}

export function matchesDemoAccount(email: string, password: string, config: DemoAccountConfig): boolean {
  return config.enabled
    && config.email.length > 0
    && config.password.length >= 8
    && email.trim().toLowerCase() === config.email.trim().toLowerCase()
    && password === config.password;
}

export const demoAccountConfig: DemoAccountConfig = {
  enabled: import.meta.env.VITE_DEMO_ACCOUNT_ENABLED === 'true',
  email: import.meta.env.VITE_DEMO_ACCOUNT_EMAIL ?? '',
  password: import.meta.env.VITE_DEMO_ACCOUNT_PASSWORD ?? '',
};
