import type { IncomingHttpHeaders } from 'node:http';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { authInputSchema, type DriverProfile } from '../../packages/types';

export interface ApiRequest {
  method?: string;
  body?: unknown;
  headers: IncomingHttpHeaders & Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
}

export interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (value: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
  end: () => void;
}

export const demoRides = [
  { id: 'ride-001', platform: 'Bolt' as const, fare: 4200, distance: 1.2, pickup: 'Maitama', dropoff: 'Wuse 2', rating: 4.86, eta: '2 min', status: 'pending' as const, timestamp: 'Now' },
  { id: 'ride-002', platform: 'Uber' as const, fare: 6800, distance: 2.4, pickup: 'Gwarinpa', dropoff: 'Central Area', rating: 4.92, eta: '4 min', status: 'pending' as const, timestamp: '1 min' },
  { id: 'ride-003', platform: 'inDrive' as const, fare: 3100, distance: 0.8, pickup: 'Jabi', dropoff: 'Airport Road', rating: 4.7, eta: '1 min', status: 'pending' as const, timestamp: '2 min' },
  { id: 'ride-004', platform: 'Bolt' as const, fare: 7600, distance: 3.8, pickup: 'Asokoro', dropoff: 'Katampe', rating: 4.78, eta: '6 min', status: 'accepted' as const, timestamp: 'Today, 08:42' },
];

export const memoryUsers = new Map<string, { profile: DriverProfile; passwordHash: string }>();
export const memoryPreferences = new Map<number, { minFare: number; maxRadius: number; minRating: number | null; blacklistedZones: string[] }>();
export const memoryConnections = new Map<number, Array<{ platform: string; isActive: boolean }>>();
export const memoryRideStatus = new Map<string, 'pending' | 'accepted' | 'declined'>();

export function cors(res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, OPTIONS');
}

export function methodGuard(req: ApiRequest, res: ApiResponse, methods: string[]) {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return false;
  }
  if (!methods.includes(req.method ?? '')) {
    res.status(405).json({ error: 'Method not allowed' });
    return false;
  }
  return true;
}

export function jsonBody<T>(req: ApiRequest, schema: z.ZodType<T>) {
  const result = schema.safeParse(typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {});
  if (!result.success) throw new Error(result.error.issues.map((issue) => issue.message).join(', '));
  return result.data;
}

const secret = () => {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error('JWT_SECRET must be configured for authentication.');
  return value;
};

export function issueToken(profile: DriverProfile) {
  return jwt.sign({ sub: String(profile.id), email: profile.email }, secret(), { expiresIn: '30d' });
}

export function requireUser(req: ApiRequest, res: ApiResponse): DriverProfile | null {
  const value = req.headers.authorization;
  const token = Array.isArray(value) ? value[0] : value;
  if (!token?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  try {
    const payload = jwt.verify(token.slice(7), secret()) as jwt.JwtPayload;
    return { id: Number(payload.sub), email: String(payload.email), subscriptionTier: 'free' };
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }
}

export function handleError(res: ApiResponse, error: unknown) {
  const message = error instanceof Error ? error.message : 'Request failed';
  res.status(message.includes(', ') || message.includes('Invalid') ? 400 : 500).json({ error: message });
}

export { authInputSchema };
