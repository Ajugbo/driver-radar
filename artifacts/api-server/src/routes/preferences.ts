import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
// @ts-ignore - workspace alias resolved at runtime
// @ts-ignore - workspace alias resolved at runtime
import { UpdateDriverPreferencesBody } from "@workspace/api-zod";
// @ts-ignore - workspace alias resolved at runtime
// @ts-ignore - workspace alias resolved at runtime
import { db, driverPreferences } from "@workspace/db";
import { requireAuth } from "../lib/auth.js";

const router: IRouter = Router();

async function ensurePreferences(driverId: number) {
  await db
    .insert(driverPreferences)
    .values({ driverId })
    .onConflictDoNothing({ target: driverPreferences.driverId });
  const [preferences] = await db
    .select()
    .from(driverPreferences)
    .where(eq(driverPreferences.driverId, driverId))
    .limit(1);
  return preferences;
}

function serializePreferences(preferences: NonNullable<Awaited<ReturnType<typeof ensurePreferences>>>) {
  return {
    driverId: preferences.driverId,
    minFareNgn: preferences.minFareNgn,
    maxPickupRadiusKm: preferences.maxPickupRadiusKm,
    minPlatformRating: null,
    blacklistedZones: preferences.blacklistedZonesJson,
    updatedAt: preferences.updatedAt.toISOString(),
  };
}

router.get("/preferences", requireAuth, async (req, res) => {
  const preferences = await ensurePreferences(req.driver!.id);
  if (!preferences) {
    res.status(500).json({ message: "Unable to load driver preferences." });
    return;
  }
  res.json(serializePreferences(preferences));
});

router.put("/preferences", requireAuth, async (req, res) => {
  const parsed = UpdateDriverPreferencesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Preferences are invalid." });
    return;
  }

  const [preferences] = await db
    .insert(driverPreferences)
    .values({
      driverId: req.driver!.id,
      minFareNgn: parsed.data.minFareNgn,
      maxPickupRadiusKm: parsed.data.maxPickupRadiusKm,
      blacklistedZonesJson: parsed.data.blacklistedZones,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: driverPreferences.driverId,
      set: {
        minFareNgn: parsed.data.minFareNgn,
        maxPickupRadiusKm: parsed.data.maxPickupRadiusKm,
        blacklistedZonesJson: parsed.data.blacklistedZones,
        updatedAt: new Date(),
      },
    })
    .returning();

  if (!preferences) {
    res.status(500).json({ message: "Unable to save driver preferences." });
    return;
  }
  res.json(serializePreferences(preferences));
});

export default router;