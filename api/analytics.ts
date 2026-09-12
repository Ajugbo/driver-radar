import { and, eq } from 'drizzle-orm';
import { rideRequests } from '../drizzle/schema';
import { getDb } from './_lib/db';
import { cors, handleError, methodGuard, requireUser, type ApiRequest, type ApiResponse } from './_lib/http';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res, ['GET'])) return;
  const user = requireUser(req, res);
  if (!user) return;

  try {
    const db = getDb();
    const rides = db
      ? await db.select({ platform: rideRequests.platformSource, fare: rideRequests.fareAmountNgn })
          .from(rideRequests)
          .where(and(eq(rideRequests.driverId, user.id), eq(rideRequests.status, 'accepted')))
      : [];
    const totalEarnings = rides.reduce((total, ride) => total + ride.fare, 0);
    const totalTrips = rides.length;
    const byPlatform = rides.reduce<Record<string, { earnings: number; trips: number }>>((summary, ride) => {
      const current = summary[ride.platform] ?? { earnings: 0, trips: 0 };
      summary[ride.platform] = { earnings: current.earnings + ride.fare, trips: current.trips + 1 };
      return summary;
    }, {});

    cors(res);
    res.status(200).json({
      totalEarnings,
      totalTrips,
      averageFare: totalTrips ? totalEarnings / totalTrips : 0,
      byPlatform,
    });
  } catch (error) {
    handleError(res, error);
  }
}
