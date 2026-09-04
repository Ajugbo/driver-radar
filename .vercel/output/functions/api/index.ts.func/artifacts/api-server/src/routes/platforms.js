import { Router } from "express";
import { eq } from "drizzle-orm";
// @ts-ignore - workspace alias resolved at runtime
// @ts-ignore - workspace alias resolved at runtime
import { db, platformConnections } from "@workspace/db";
import { requireAuth } from "../lib/auth.js";
const router = Router();
router.get("/platform-connections", requireAuth, async (req, res) => {
    const platforms = await db
        .select({
        id: platformConnections.id,
        platformName: platformConnections.platformName,
        isActive: platformConnections.isActive,
    })
        .from(platformConnections)
        .where(eq(platformConnections.driverId, req.driver.id));
    res.json(platforms);
});
export default router;
//# sourceMappingURL=platforms.js.map