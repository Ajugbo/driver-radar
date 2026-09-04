import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { drivers } from '../../drizzle/schema';
import { getDb } from '../_lib/db';
import { authInputSchema, cors, handleError, issueToken, jsonBody, methodGuard, memoryUsers, type ApiRequest, type ApiResponse } from '../_lib/http';
import type { DriverProfile } from '../../packages/types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  try {
    const { email, password } = jsonBody(req, authInputSchema);
    const normalizedEmail = email.toLowerCase();
    const passwordHash = await bcrypt.hash(password, 12);
    const db = getDb();
    let profile: DriverProfile = { id: memoryUsers.size + 1, email: normalizedEmail, subscriptionTier: 'free' };
    if (db) {
      const existing = await db.select({ id: drivers.id }).from(drivers).where(eq(drivers.email, normalizedEmail)).limit(1);
      if (existing.length) {
        res.status(409).json({ error: 'An account with this email already exists' });
        return;
      }
      const [created] = await db.insert(drivers).values({ email: normalizedEmail, passwordHash }).returning({ id: drivers.id, email: drivers.email, subscriptionTier: drivers.subscriptionTier });
      profile = { id: created.id, email: created.email, subscriptionTier: created.subscriptionTier === 'pro' ? 'pro' : 'free' };
    } else if (memoryUsers.has(normalizedEmail)) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }
    memoryUsers.set(normalizedEmail, { profile, passwordHash });
    cors(res);
    res.status(201).json({ token: issueToken(profile), driver: profile });
  } catch (error) {
    handleError(res, error);
  }
}
