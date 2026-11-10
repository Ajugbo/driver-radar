import type { ApiRide, DriverProfile, PlatformDiscovery } from '../../packages/types';

const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'https://driver-radar.vercel.app').replace(/\/+$/, '');
const letsGoApiUrl = (process.env.EXPO_PUBLIC_LETZGO_API_URL ?? 'https://letsgo-backend-one.vercel.app').replace(/\/+$/, '');
const healthCheckUrl = `${apiUrl}/api/healthz`;
console.log(`[API] Health check URL: ${healthCheckUrl}`);
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
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
  if (!response.ok) throw new ApiError(body.error ?? `The ${service} API is unavailable`, response.status);
  return body;
}

export function getOffers(): Promise<{ offers: ApiRide[] }> {
  return request(letsGoApiUrl, '/api/driver/offers', undefined, 'LetzGo');
}

export const api = {
  health: () => request<{ ok: boolean; service: string; databaseConfigured: boolean; timestamp: string }>(apiUrl, '/api/healthz'),
  login: (phone: string, password: string) => request<{ token: string; driver: DriverProfile }>(apiUrl, '/api/auth/driver/login', { method: 'POST', body: JSON.stringify({ phone, password }) }),
  register: (email: string, password: string) => request<{ token: string; driver: DriverProfile }>(apiUrl, '/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  rides: () => request<{ rides: ApiRide[] }>(apiUrl, '/api/rides/feed'),
  decision: (rideId: string, decision: 'accepted' | 'declined') => request(apiUrl, '/api/rides/decision', { method: 'POST', body: JSON.stringify({ rideId, decision }) }),
  preferences: (value: unknown) => request(apiUrl, '/api/preferences', { method: 'PATCH', body: JSON.stringify(value) }),
  platforms: () => request<PlatformDiscovery[]>(apiUrl, '/api/platforms'),
  analytics: () => request<{
    totalEarnings: number;
    totalTrips: number;
    acceptanceRate: number;
    dailyEarnings: { day: string; amount: number }[];
    maxDaily: number;
  }>(apiUrl, '/api/analytics'),
};

export const driverApi = {
  getOffers,
};

async function requestAt<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...init?.headers },
  });
  
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  
  if (!contentType.includes('application/json')) {
    console.error('[API] Non-JSON response from', `${baseUrl}${path}`, ':', text.substring(0, 200));
    throw new Error(`Server returned non-JSON response (${response.status}). Check backend route.`);
  }
  
  try {
    const body = JSON.parse(text);
    if (!response.ok) throw new Error(body.error ?? `Request failed with status ${response.status}`);
    return body as T;
  } catch (e: any) {
    throw new Error(`Invalid JSON from server: ${e.message}. Raw: ${text.substring(0, 100)}`);
  }
}
// APK build trigger Tue Nov 10 03:39:13 UTC 2026
