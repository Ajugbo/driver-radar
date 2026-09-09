import { createHmac, timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { drivers, subscriptions, transactions } from '../../drizzle/schema';
import { getDb } from './db';
import type { ApiRequest } from './http';

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null;
}

function valueAt(value: unknown, key: string): unknown {
  return isRecord(value) ? value[key] : undefined;
}

function stringAt(value: unknown, key: string) {
  const result = valueAt(value, key);
  return typeof result === 'string' ? result : undefined;
}

function rawBody(req: ApiRequest) {
  if (req.rawBody) return req.rawBody;
  if (typeof req.body === 'string') return req.body;
  return JSON.stringify(req.body ?? {});
}

function signaturesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(received, 'utf8');
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function verifyStripeSignature(req: ApiRequest, secret: string) {
  const header = req.headers['stripe-signature'];
  const value = Array.isArray(header) ? header[0] : header;
  if (!value) return false;
  const timestamp = value.split(',').find((part) => part.startsWith('t='))?.slice(2);
  const signature = value.split(',').find((part) => part.startsWith('v1='))?.slice(3);
  if (!timestamp || !signature) return false;
  const age = Math.abs(Date.now() - Number(timestamp) * 1000);
  if (!Number.isFinite(age) || age > 5 * 60 * 1000) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody(req)}`).digest('hex');
  return signaturesMatch(expected, signature);
}

export function verifyPaystackSignature(req: ApiRequest, secret: string) {
  const header = req.headers['x-paystack-signature'];
  const value = Array.isArray(header) ? header[0] : header;
  if (!value) return false;
  const expected = createHmac('sha512', secret).update(rawBody(req)).digest('hex');
  return signaturesMatch(expected, value);
}

function metadataValue(payload: unknown, key: string) {
  const eventData = valueAt(payload, 'data');
  const metadata = valueAt(eventData, 'metadata');
  return stringAt(metadata, key);
}

async function driverIdFor(payload: unknown) {
  const db = getDb();
  if (!db) throw new Error('DATABASE_URL is required for payment webhooks');
  const directId = Number(metadataValue(payload, 'driver_id') ?? stringAt(valueAt(payload, 'data'), 'customer_code'));
  if (Number.isInteger(directId) && directId > 0) return directId;
  const email = stringAt(valueAt(valueAt(payload, 'data'), 'customer'), 'email') ?? stringAt(valueAt(payload, 'data'), 'customer_email');
  if (!email) return null;
  const [driver] = await db.select({ id: drivers.id }).from(drivers).where(eq(drivers.email, email.toLowerCase())).limit(1);
  return driver?.id ?? null;
}

export interface NormalizedPaymentEvent {
  eventType: string;
  transactionId: string;
  driverId: number | null;
  amountMinor: number;
  currency: string;
  metadata: Record<string, string | number | boolean | null>;
}

export async function processPaymentWebhook(provider: 'stripe' | 'paystack', payload: unknown): Promise<void> {
  const db = getDb();
  if (!db || !isRecord(payload)) throw new Error('DATABASE_URL is required for payment webhooks');
  const eventType = stringAt(payload, 'type') ?? stringAt(payload, 'event') ?? 'unknown';
  const data = valueAt(payload, 'data');
  const object = isRecord(data) && isRecord(data.object) ? data.object : data;
  const transactionId = stringAt(object, 'id') ?? stringAt(object, 'reference');
  if (!transactionId) throw new Error('Webhook has no provider transaction ID');
  const driverId = await driverIdFor(payload);
  if (!driverId) return;
  const rawAmount = valueAt(object, 'amount');
  const amountMinor = typeof rawAmount === 'number' ? rawAmount : 0;
  const currency = (stringAt(object, 'currency') ?? 'NGN').toUpperCase();
  const metadata = { eventType, provider };
  const succeeded = eventType === 'charge.success' || eventType === 'checkout.session.completed' || eventType === 'payment_intent.succeeded';
  const revoked = eventType.includes('failed') || eventType.includes('refunded') || eventType.includes('refund') || eventType.includes('canceled') || eventType.includes('cancelled') || eventType === 'customer.subscription.deleted';
  const status = succeeded ? 'succeeded' : revoked ? 'failed' : 'received';
  await db.insert(transactions).values({ driverId, provider, providerTransactionId: transactionId, amountMinor, currency, status, metadata }).onConflictDoNothing();
  if (succeeded) {
    const now = new Date();
    await db.update(drivers).set({ subscriptionStartDate: now, subscriptionTier: 'pro', trialStartDate: null, currency }).where(eq(drivers.id, driverId));
    await db.insert(subscriptions).values({ driverId, tier: 'pro', expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }).onConflictDoUpdate({ target: subscriptions.driverId, set: { tier: 'pro', expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } });
  } else if (revoked) {
    await db.update(drivers).set({ subscriptionTier: 'free', subscriptionStartDate: null }).where(eq(drivers.id, driverId));
    await db.update(subscriptions).set({ tier: 'free', expiresAt: null }).where(eq(subscriptions.driverId, driverId));
  }
}

export function parseWebhookBody(req: ApiRequest): unknown {
  try {
    return JSON.parse(rawBody(req)) as unknown;
  } catch {
    throw new Error('Invalid webhook JSON');
  }
}