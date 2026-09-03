import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
// @ts-ignore - pino-http CJS export compatibility
import pinoHttp from "pino-http";
// @ts-expect-error - Vercel forces node16 but resolves .js to .ts at runtime
import router from "./routes.js";
// @ts-expect-error - Vercel forces node16 but resolves .js to .ts at runtime
import { logger } from "./lib/logger.js";

const app: Express = express();

app.use(
  // @ts-ignore - pinoHttp is callable at runtime despite TS namespace type
  pinoHttp({
    logger,
    serializers: {
      req(req: Request) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: Response) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
