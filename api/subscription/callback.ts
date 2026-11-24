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
    res.status(200).json({ 
      success: ok, 
      message: ok ? 'Payment verified successfully. Return to app and refresh status.' : 'Payment verification failed.' 
    });
  } catch (e) {
    console.error('Callback verification error:', e);
    res.status(500).json({ success: false, message: 'Verification error' });
  }
}
