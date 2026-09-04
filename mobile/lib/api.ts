import type { ApiRide, DriverProfile } from '../../packages/types';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? '';
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...init?.headers },
  });
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? 'The Driver Radar API is unavailable');
  return body;
}

export const api = {
  login: (email: string, password: string) => request<{ token: string; driver: DriverProfile }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string) => request<{ token: string; driver: DriverProfile }>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  rides: () => request<{ rides: ApiRide[] }>('/api/rides/feed'),
  decision: (rideId: string, decision: 'accepted' | 'declined') => request('/api/rides/decision', { method: 'POST', body: JSON.stringify({ rideId, decision }) }),
  preferences: (value: unknown) => request('/api/preferences', { method: 'PATCH', body: JSON.stringify(value) }),
};
