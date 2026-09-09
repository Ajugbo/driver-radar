import { eq } from 'drizzle-orm';
import { drivers } from '../drizzle/schema';
import { getDb } from './_lib/db';
import { checkSubscriptionAccess } from '../lib/subscription-check';
import { cors, handleError, methodGuard, requireUser, type ApiRequest, type ApiResponse } from './_lib/http';

/** GET /api/subscription: return server-calculated subscription access for the authenticated driver. */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res, ['GET'])) return;
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const db = getDb();
    if (req.method === 'GET') {
      const [driver] = db ? await db.select().from(drivers).where(eq(drivers.id, user.id)).limit(1) : [];
      const access = driver ? checkSubscriptionAccess(driver) : { allowed: false, tier: user.subscriptionTier, expiresAt: new Date(0), daysRemaining: 0 };
      cors(res);
      res.status(200).json({ subscription: { driverId: user.id, ...access, expiresAt: access.expiresAt.toISOString() } });
    }
  } catch (error) {
    handleError(res, error);
  }
}
