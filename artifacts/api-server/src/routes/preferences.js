import { Router } from "express";
import { eq } from "drizzle-orm";
import { UpdateDriverPreferencesBody } from "@workspace/api-zod";
import { db, driverPreferences } from "@workspace/db";
import { requireAuth } from "../lib/auth.js";

const router = Router();

async function ensurePreferences(driverId) {
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

function serializePreferences(preferences) {
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
  const preferences = await ensurePreferences(req.driver.id);
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
      driverId: req.driver.id,
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
