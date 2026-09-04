import express from "express";
import cors from "cors";
// @ts-ignore - pino-http CJS export compatibility under node16
import pinoHttp from "pino-http";
// @ts-ignore - routes.js is a directory index; types resolved at runtime
import router from "./routes.js";
// @ts-ignore - logger.js types resolved at runtime
import { logger } from "./lib/logger.js";
const app = express();
app.use(
// @ts-ignore - pinoHttp is callable at runtime despite TS namespace type
pinoHttp({
    logger,
    serializers: {
        req(req) {
            return {
                id: req.id,
                method: req.method,
                url: req.url?.split("?")[0],
            };
        },
        res(res) {
            return {
                statusCode: res.statusCode,
            };
        },
    },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);
export default app;
//# sourceMappingURL=app.js.map