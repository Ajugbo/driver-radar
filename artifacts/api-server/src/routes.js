import { Router } from "express";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import preferencesRouter from "./routes/preferences.js";
import ridesRouter from "./routes/rides.js";
import platformsRouter from "./routes/platforms.js";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(preferencesRouter);
router.use(ridesRouter);
router.use(platformsRouter);

export default router;
