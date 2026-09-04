import { and, eq } from 'drizzle-orm';
import { rideRequests } from '../../drizzle/schema';
import { getDb } from '../_lib/db';
import { cors, demoRides, handleError, methodGuard, memoryPreferences, memoryRideStatus, requireUser, type ApiRequest, type ApiResponse } from '../_lib/http';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res, ['GET'])) return;
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const db = getDb();
    let rides = db
      ? await db.select().from(rideRequests).where(and(eq(rideRequests.driverId, user.id), eq(rideRequests.status, 'pending')))
      : [];
    const preferences = memoryPreferences.get(user.id) ?? { minFare: 2500, maxRadius: 3, minRating: null, blacklistedZones: ['Airport Road'] };
    const result = rides.length
      ? rides.map((ride) => ({
          id: String(ride.id), platform: ride.platformSource as 'Uber' | 'Bolt' | 'inDrive', fare: ride.fareAmountNgn,
          distance: ride.pickupDistanceKm, pickup: ride.pickup, dropoff: ride.dropoff, rating: ride.riderRating,
          eta: ride.eta, status: ride.status as 'pending', timestamp: ride.timestamp.toISOString(),
        }))
      : demoRides.map((ride) => ({ ...ride, status: memoryRideStatus.get(ride.id) ?? ride.status }));
    const filtered = result.filter((ride) =>
      ride.status === 'pending' && ride.fare >= preferences.minFare && ride.distance <= preferences.maxRadius &&
      (preferences.minRating === null || ride.rating >= preferences.minRating) &&
      !preferences.blacklistedZones.some((zone) => ride.pickup.toLowerCase().includes(zone.toLowerCase())),
    );
    cors(res);
    res.status(200).json({ rides: filtered, preferences });
  } catch (error) {
    handleError(res, error);
  }
}
