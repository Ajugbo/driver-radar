import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { DecideRideRequestBody } from "@workspace/api-zod";
import { db, rideRequests } from "@workspace/db";
import { requireAuth } from "../lib/auth.js";

const router = Router();

function serializeRide(ride) {
  return {
    id: ride.id,
    platformSource: ride.platformSource,
    fareAmountNgn: ride.fareAmountNgn,
    pickupDistanceKm: ride.pickupDistanceKm,
    pickupZone: "Wuse 2",
    destinationZone: "Garki",
    status: ride.status,
    timestamp: ride.timestamp.toISOString(),
  };
}

router.get("/ride-requests", requireAuth, async (req, res) => {
  const rides = await db
    .select()
    .from(rideRequests)
    .where(eq(rideRequests.driverId, req.driver.id))
    .orderBy(desc(rideRequests.timestamp))
    .limit(50);
  res.json(rides.map(serializeRide));
});

router.post("/ride-requests/:id/decision", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = DecideRideRequestBody.safeParse(req.body);
  if (!Number.isInteger(id) || !parsed.success) {
    res.status(400).json({ message: "Invalid ride decision." });
    return;
  }

  const [ride] = await db
    .update(rideRequests)
    .set({ status: parsed.data.action === "accept" ? "accepted" : "declined" })
    .where(and(eq(rideRequests.id, id), eq(rideRequests.driverId, req.driver.id)))
    .returning();
  if (!ride) {
    res.status(404).json({ message: "Ride request not found." });
    return;
  }
  res.json(serializeRide(ride));
});

export default router;
