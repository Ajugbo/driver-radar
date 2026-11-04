import type { ApiRide, DriverProfile } from '../../packages/types';

const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'https://driver-radar.vercel.app').replace(/\/+$/, '');
const letsGoApiUrl = (process.env.EXPO_PUBLIC_LETZGO_API_URL ?? 'https://letsgo-backend-one.vercel.app').replace(/\/+$/, '');
const healthCheckUrl = `${apiUrl}/api/healthz`;
console.log(`[API] Health check URL: ${healthCheckUrl}`);
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function request<T>(baseUrl: string, path: string, init?: RequestInit, service = 'Driver Radar'): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: 'Bearer ' + accessToken } : {}),
      ...init?.headers,
    },
  });
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? `The ${service} API is unavailable`);
  return body;
}

export function getOffers(): Promise<{ offers: ApiRide[] }> {
  return request(letsGoApiUrl, '/api/driver/offers', undefined, 'LetzGo');
}

export const api = {
  health: () => request<{ ok: boolean; service: string; databaseConfigured: boolean; timestamp: string }>(apiUrl, '/api/healthz'),
  login: (email: string, password: string) => request<{ token: string; driver: DriverProfile }>(apiUrl, '/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string) => request<{ token: string; driver: DriverProfile }>(apiUrl, '/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  rides: () => request<{ rides: ApiRide[] }>(apiUrl, '/api/rides/feed'),
  decision: (rideId: string, decision: 'accepted' | 'declined') => request(apiUrl, '/api/rides/decision', { method: 'POST', body: JSON.stringify({ rideId, decision }) }),
  preferences: (value: unknown) => request(apiUrl, '/api/preferences', { method: 'PATCH', body: JSON.stringify(value) }),
};

export const driverApi = {
  getOffers,
};
