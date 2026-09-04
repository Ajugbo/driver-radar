import { Router, type IRouter } from "express";
// @ts-ignore - workspace alias resolved at runtime
// @ts-ignore - workspace alias resolved at runtime
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
