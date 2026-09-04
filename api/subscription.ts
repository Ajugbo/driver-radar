import { eq } from 'drizzle-orm';
import { subscriptions } from '../drizzle/schema';
import { getDb } from './_lib/db';
import { cors, handleError, jsonBody, methodGuard, requireUser, type ApiRequest, type ApiResponse } from './_lib/http';
import { subscriptionSchema } from '../packages/types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res, ['GET', 'POST', 'PATCH', 'PUT'])) return;
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const db = getDb();
    if (req.method === 'GET') {
      const [row] = db ? await db.select().from(subscriptions).where(eq(subscriptions.driverId, user.id)).limit(1) : [];
      cors(res);
      res.status(200).json({ subscription: row ?? { driverId: user.id, tier: user.subscriptionTier, expiresAt: null } });
      return;
    }
    const input = jsonBody(req, subscriptionSchema);
    if (db) {
      await db.insert(subscriptions).values({
        driverId: user.id,
        tier: input.tier,
        revenuecatCustomerId: input.revenuecatCustomerId,
      }).onConflictDoUpdate({
        target: subscriptions.driverId,
        set: { tier: input.tier, revenuecatCustomerId: input.revenuecatCustomerId },
      });
    }
    cors(res);
    res.status(200).json({ subscription: { driverId: user.id, tier: input.tier, revenuecatCustomerId: input.revenuecatCustomerId } });
  } catch (error) {
    handleError(res, error);
  }
}
