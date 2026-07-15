const AUTH_KEY = 'ttb-demo-auth';
const USER_KEY = 'ttb-demo-user';

export interface DemoUser {
  email: string;
  name: string;
}

export function setDemoSession(user: DemoUser) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(AUTH_KEY, 'verified');
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearDemoSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function isDemoAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(AUTH_KEY) === 'verified';
}

export function getDemoUser(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoUser;
  } catch {
    return null;
  }
}

export const DEFAULT_DEMO_USER: DemoUser = {
  email: 'agent@ttb.gov',
  name: 'Sarah Chen',
};
