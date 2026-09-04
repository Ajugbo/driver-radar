import { and, eq } from 'drizzle-orm';
import { rideRequests } from '../../drizzle/schema';
import { getDb } from '../_lib/db';
import { cors, handleError, jsonBody, methodGuard, memoryRideStatus, requireUser, type ApiRequest, type ApiResponse } from '../_lib/http';
import { rideDecisionSchema } from '../../packages/types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res, ['POST', 'PATCH'])) return;
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const { rideId, decision } = jsonBody(req, rideDecisionSchema);
    const db = getDb();
    const id = Number(rideId);
    if (db && Number.isInteger(id)) {
      await db.update(rideRequests).set({ status: decision }).where(and(eq(rideRequests.id, id), eq(rideRequests.driverId, user.id)));
    }
    memoryRideStatus.set(rideId, decision);
    cors(res);
    res.status(200).json({ rideId, decision, updated: true });
  } catch (error) {
    handleError(res, error);
  }
}
