import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import preferencesRouter from "./preferences.js";
import ridesRouter from "./rides.js";
import platformsRouter from "./platforms.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(preferencesRouter);
router.use(ridesRouter);
router.use(platformsRouter);

export default router;
