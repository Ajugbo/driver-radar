import { and, eq } from 'drizzle-orm';
import { platformConnections } from '../drizzle/schema';
import { getDb } from './_lib/db';
import { cors, handleError, jsonBody, methodGuard, memoryConnections, requireUser, type ApiRequest, type ApiResponse } from './_lib/http';
import { platformConnectionSchema } from '../packages/types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res, ['GET', 'POST', 'PUT', 'DELETE'])) return;
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const db = getDb();
    if (req.method === 'GET') {
      const rows = db ? await db.select({ platform: platformConnections.platformName, isActive: platformConnections.isActive }).from(platformConnections).where(eq(platformConnections.driverId, user.id)) : [];
      cors(res);
      res.status(200).json({ connections: rows.length ? rows : memoryConnections.get(user.id) ?? [] });
      return;
    }
    const input = jsonBody(req, platformConnectionSchema);
    const connections = memoryConnections.get(user.id) ?? [];
    const isActive = input.isActive ?? true;
    const next = [...connections.filter((connection) => connection.platform !== input.platform), { platform: input.platform, isActive }];
    memoryConnections.set(user.id, next);
    if (db) {
      await db.insert(platformConnections).values({
        driverId: user.id,
        platformName: input.platform,
        apiTokenEncrypted: input.apiToken,
        isActive,
      });
    }
    cors(res);
    res.status(200).json({ connection: { platform: input.platform, isActive } });
  } catch (error) {
    handleError(res, error);
  }
}
