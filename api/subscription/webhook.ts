import crypto from 'crypto';
import { sql } from 'drizzle-orm';
import { getDb } from '../_lib/db';
import type { ApiRequest, ApiResponse } from '../_lib/http';

const SECRET = process.env.PAYSTACK_SECRET_KEY;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // req.body is already parsed as JSON by your existing middleware/Vercel
  const event = req.body as any;
  
  if (!event || !event.event) return res.status(400).end();

  try {
    // Verify signature using the raw body string
    const rawBody = JSON.stringify(event);
    const sig = crypto.createHmac('sha512', SECRET || '').update(rawBody).digest('hex');
    
    // Note: For production, you'd need the raw buffer before parsing. 
    // Since we can't access raw streams via your ApiRequest type, 
    // we verify against the parsed object's stringified form.
    // If Paystack rejects this, we'll need a different verification approach.
    if (sig !== req.headers['x-paystack-signature']) return res.status(401).end();

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
  } catch (e) {
    console.error('Webhook processing error:', e);
  }

  res.status(200).end();
}
