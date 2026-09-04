import type { ApiRequest, ApiResponse } from './_lib/http';
import { cors, methodGuard } from './_lib/http';

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res, ['GET'])) return;
  cors(res);
  res.status(200).json({ ok: true, service: 'driver-radar-api', databaseConfigured: Boolean(process.env.DATABASE_URL), timestamp: new Date().toISOString() });
}
