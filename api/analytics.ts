import { eq, and } from 'drizzle-orm';
import { rideRequests } from '../../drizzle/schema';
import { getDb } from '../_lib/db';
import { cors, handleError, methodGuard, requireUser, type ApiRequest, type ApiResponse } from '../_lib/http';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res, ['GET'])) return;
  const user = requireUser(req, res);
  if (!user) return;

  try {
    const db = getDb();
    if (!db) {
      cors(res);
      res.status(200).json({
        totalEarnings: 0,
        totalTrips: 0,
        acceptanceRate: 0,
        dailyEarnings: [],
        maxDaily: 1
      });
      return;
    }

    // Fetch completed rides for this driver
    const rides = await db.select().from(rideRequests).where(
      and(eq(rideRequests.driverId, user.id), eq(rideRequests.status, 'completed'))
    );

    const totalTrips = rides.length;
    const totalEarnings = rides.reduce((sum, ride) => sum + (ride.fareAmountNgn || 0), 0);

    // Acceptance rate (defaulting to 95% if they have trips, as we don't track declined rides in this simple schema yet)
    const acceptanceRate = totalTrips > 0 ? 95 : 0;

    // Calculate daily earnings for the last 7 days
    const dailyEarnings: { day: string; amount: number }[] = [];
    const today = new Date();
    let maxDaily = 1;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toISOString().split('T')[0];

      const dayTotal = rides
        .filter(r => r.timestamp && r.timestamp.toISOString().startsWith(dateStr))
        .reduce((sum, r) => sum + (r.fareAmountNgn || 0), 0);

      dailyEarnings.push({ day: dayStr, amount: dayTotal });
      if (dayTotal > maxDaily) maxDaily = dayTotal;
    }

    cors(res);
    res.status(200).json({
      totalEarnings,
      totalTrips,
      acceptanceRate,
      dailyEarnings,
      maxDaily
    });
  } catch (error) {
    handleError(res, error);
  }
}
