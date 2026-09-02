import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import preferencesRouter from "./preferences";
import ridesRouter from "./rides";
import platformsRouter from "./platforms";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(preferencesRouter);
router.use(ridesRouter);
router.use(platformsRouter);

export default router;
