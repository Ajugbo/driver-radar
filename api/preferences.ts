import { eq } from 'drizzle-orm';
import { driverPreferences } from '../drizzle/schema';
import { getDb } from './_lib/db';
import { cors, handleError, jsonBody, methodGuard, requireUser, type ApiRequest, type ApiResponse, memoryPreferences } from './_lib/http';
import { preferencesSchema } from '../packages/types';

const defaults = { minFare: 2500, maxRadius: 3, minRating: null as number | null, blacklistedZones: ['Airport Road'] };

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res, ['GET', 'PATCH', 'PUT'])) return;
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const db = getDb();
    if (req.method === 'GET') {
      const [row] = db ? await db.select().from(driverPreferences).where(eq(driverPreferences.driverId, user.id)).limit(1) : [];
      const preferences = row
        ? { minFare: row.minFareNgn, maxRadius: row.maxPickupRadiusKm, minRating: row.minRating, blacklistedZones: row.blacklistedZonesJson }
        : memoryPreferences.get(user.id) ?? defaults;
      cors(res);
      res.status(200).json({ preferences });
      return;
    }
    const input = jsonBody(req, preferencesSchema);
    const current = memoryPreferences.get(user.id) ?? defaults;
    const preferences = { ...current, ...input };
    memoryPreferences.set(user.id, preferences);
    if (db) {
      await db.insert(driverPreferences).values({
        driverId: user.id,
        minFareNgn: preferences.minFare,
        maxPickupRadiusKm: preferences.maxRadius,
        minRating: preferences.minRating,
        blacklistedZonesJson: preferences.blacklistedZones,
      }).onConflictDoUpdate({
        target: driverPreferences.driverId,
        set: {
          minFareNgn: preferences.minFare,
          maxPickupRadiusKm: preferences.maxRadius,
          minRating: preferences.minRating,
          blacklistedZonesJson: preferences.blacklistedZones,
          updatedAt: new Date(),
        },
      });
    }
    cors(res);
    res.status(200).json({ preferences });
  } catch (error) {
    handleError(res, error);
  }
}
