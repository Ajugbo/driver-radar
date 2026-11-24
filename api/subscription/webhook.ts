import crypto from 'crypto';
import { sql } from 'drizzle-orm';
import { getDb } from '../_lib/db';
import type { ApiRequest, ApiResponse } from '../_lib/http';

const SECRET = process.env.PAYSTACK_SECRET_KEY;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const raw = Buffer.concat(chunks).toString('utf8');
  
  const sig = crypto.createHmac('sha512', SECRET || '').update(raw).digest('hex');
  if (sig !== req.headers['x-paystack-signature']) return res.status(401).end();
  
  const event = JSON.parse(raw);
  if (event.event === 'charge.success') {
    const d = event.data;
    if (d.amount === 499900 && d.currency === 'NGN') {
      const driverId = Number(d.metadata?.driverId);
      const db = getDb();
      if (db && Number.isInteger(driverId)) {
        await db.execute(sql`INSERT INTO driver_subscriptions (driver_id, expires_at, paystack_reference, updated_at)
          VALUES (${driverId}, NOW() + INTERVAL '7 days', ${d.reference}, NOW())
          ON CONFLICT (driver_id) DO UPDATE SET
            expires_at = GREATEST(driver_subscriptions.expires_at, NOW()) + INTERVAL '7 days',
            paystack_reference = EXCLUDED.paystack_reference, updated_at = NOW()`);
      }
    }
  }
  res.status(200).end();
}
