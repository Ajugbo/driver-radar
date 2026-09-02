import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, platformConnections } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/platform-connections", requireAuth, async (req, res) => {
  const platforms = await db
    .select({
      id: platformConnections.id,
      platformName: platformConnections.platformName,
      isActive: platformConnections.isActive,
    })
    .from(platformConnections)
    .where(eq(platformConnections.driverId, req.driver!.id));
  res.json(platforms);
});

export default router;