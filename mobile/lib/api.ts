import type { ApiRide, DriverProfile } from '../../packages/types';
import type { Currency } from '@/lib/currency-detector';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://driver-radar.vercel.app';
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...init?.headers },
  });
  const text = await response.text();
  let body: (T & { error?: string; message?: string }) | null = null;
  try {
    body = JSON.parse(text) as T & { error?: string; message?: string };
  } catch {
    throw new Error(`Server returned non-JSON: ${text.substring(0, 50) || 'empty response'}`);
  }
  if (!response.ok) throw new Error(body?.message ?? body?.error ?? 'The Driver Radar API is unavailable');
  if (!body) throw new Error('The Driver Radar API returned an empty response');
  return body;
}

export const api = {
  login: (email: string, password: string, currency?: Currency) => request<{ token: string; driver: DriverProfile; subscription?: SubscriptionStatus }>('/api/auth/login', { method: 'POST', headers: currency ? { 'X-Currency': currency } : undefined, body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, currency?: Currency) => request<{ token: string; driver: DriverProfile; subscription?: SubscriptionStatus }>('/api/auth/register', { method: 'POST', headers: currency ? { 'X-Currency': currency } : undefined, body: JSON.stringify({ email, password }) }),
  subscription: () => request<{ subscription: SubscriptionStatus }>('/api/subscription'),
  checkout: (countryCode: string, currency: Currency) => request<{ checkout: { checkoutUrl: string; currency: Currency } }>('/api/payment/checkout', { method: 'POST', body: JSON.stringify({ countryCode, currency }) }),
  rides: () => request<{ rides: ApiRide[] }>('/api/rides/feed'),
  decision: (rideId: string, decision: 'accepted' | 'declined') => request('/api/rides/decision', { method: 'POST', body: JSON.stringify({ rideId, decision }) }),
  preferences: (value: unknown) => request('/api/preferences', { method: 'PATCH', body: JSON.stringify(value) }),
};

export interface SubscriptionStatus {
  allowed: boolean;
  tier: 'free' | 'trial' | 'pro';
  expiresAt: string;
  daysRemaining: number;
}
