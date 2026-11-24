import { sql } from 'drizzle-orm';
import { getDb } from '../_lib/db';
import { cors, handleError, methodGuard, requireUser, type ApiRequest, type ApiResponse } from '../_lib/http';
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res, ['GET'])) return;
  const user = requireUser(req, res); if (!user) return;
  try {
    const db = getDb();
    const r: any = db ? await db.execute(sql`SELECT expires_at FROM driver_subscriptions WHERE driver_id = ${user.id}`) : { rows: [] };
    const exp = r.rows?.[0]?.expires_at ? new Date(r.rows[0].expires_at).getTime() : 0;
    cors(res); res.status(200).json({ active: exp > Date.now(), expiresAt: exp, daysLeft: Math.max(0, Math.ceil((exp - Date.now()) / 86400000)) });
  } catch (e) { handleError(res, e); }
}
