import { sql } from 'drizzle-orm';
import { getDb } from '../_lib/db';
import { cors, type ApiRequest, type ApiResponse } from '../_lib/http';

const SECRET = process.env.PAYSTACK_SECRET_KEY;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const reference = String(req.query?.reference || '');
  
  try {
    const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { 
      headers: { Authorization: `Bearer ${SECRET}` } 
    });
    const j: any = await r.json();
    const ok = j.status && j.data?.status === 'success' && j.data?.amount === 499900 && j.data?.currency === 'NGN';
    
    if (ok) {
      const driverId = Number(j.data.metadata?.driverId);
      const db = getDb();
      if (db && Number.isInteger(driverId)) {
        await db.execute(sql`INSERT INTO driver_subscriptions (driver_id, expires_at, paystack_reference, updated_at)
          VALUES (${driverId}, NOW() + INTERVAL '7 days', ${reference}, NOW())
          ON CONFLICT (driver_id) DO UPDATE SET
            expires_at = GREATEST(driver_subscriptions.expires_at, NOW()) + INTERVAL '7 days',
            paystack_reference = EXCLUDED.paystack_reference, updated_at = NOW()`);
      }
    }
    
    cors(res);
    res.setHeader('Content-Type', 'text/html');
    res.write(`<html><body style="font-family:sans-serif;background:#020617;color:#e2e8f0;display:grid;place-items:center;height:100vh"><div style="text-align:center"><h1>${ok ? 'Payment successful' : 'Payment not confirmed'}</h1><p>Return to the Driver Radar app and tap "Refresh status".</p></div></body></html>`);
    res.status(200).end();
  } catch (e) {
    console.error('Callback verification error:', e);
    res.status(500).end();
  }
}
