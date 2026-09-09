import bcrypt from 'bcryptjs';
import { and, eq, isNull } from 'drizzle-orm';
import { drivers } from '../../drizzle/schema';
import { getDb } from '../_lib/db';
import { authInputSchema, cors, handleError, issueToken, jsonBody, methodGuard, memoryUsers, type ApiRequest, type ApiResponse } from '../_lib/http';
import { checkSubscriptionAccess } from '../../lib/subscription-check';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  try {
    const { email, password } = jsonBody(req, authInputSchema);
    const normalizedEmail = email.toLowerCase();
    let record = memoryUsers.get(normalizedEmail);
    const db = getDb();
    if (!record && db) {
      let [driver] = await db.select().from(drivers).where(eq(drivers.email, normalizedEmail)).limit(1);
      if (driver) {
        if (!driver.trialStartDate && !driver.subscriptionStartDate) {
          const [activated] = await db.update(drivers).set({ trialStartDate: new Date(), subscriptionTier: 'trial' }).where(and(eq(drivers.id, driver.id), isNull(drivers.trialStartDate), isNull(drivers.subscriptionStartDate))).returning();
          driver = activated ?? driver;
        }
        record = { profile: { id: driver.id, email: driver.email, subscriptionTier: driver.subscriptionTier === 'pro' ? 'pro' : 'free' }, passwordHash: driver.passwordHash };
        memoryUsers.set(normalizedEmail, record);
        const access = checkSubscriptionAccess(driver);
        cors(res);
        res.status(200).json({ token: issueToken(record.profile), driver: record.profile, subscription: { ...access, expiresAt: access.expiresAt.toISOString() } });
        return;
      }
    }
    if (!record || !(await bcrypt.compare(password, record.passwordHash))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    cors(res);
    res.status(200).json({ token: issueToken(record.profile), driver: record.profile, subscription: { allowed: false, tier: record.profile.subscriptionTier, expiresAt: new Date(0).toISOString(), daysRemaining: 0 } });
  } catch (error) {
    handleError(res, error);
  }
}
