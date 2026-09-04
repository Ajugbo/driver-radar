import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { drivers } from '../../drizzle/schema';
import { getDb } from '../_lib/db';
import { authInputSchema, cors, handleError, issueToken, jsonBody, methodGuard, memoryUsers, type ApiRequest, type ApiResponse } from '../_lib/http';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  try {
    const { email, password } = jsonBody(req, authInputSchema);
    const normalizedEmail = email.toLowerCase();
    let record = memoryUsers.get(normalizedEmail);
    const db = getDb();
    if (!record && db) {
      const [driver] = await db.select().from(drivers).where(eq(drivers.email, normalizedEmail)).limit(1);
      if (driver) {
        record = { profile: { id: driver.id, email: driver.email, subscriptionTier: driver.subscriptionTier === 'pro' ? 'pro' : 'free' }, passwordHash: driver.passwordHash };
        memoryUsers.set(normalizedEmail, record);
      }
    }
    if (!record || !(await bcrypt.compare(password, record.passwordHash))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    cors(res);
    res.status(200).json({ token: issueToken(record.profile), driver: record.profile });
  } catch (error) {
    handleError(res, error);
  }
}
