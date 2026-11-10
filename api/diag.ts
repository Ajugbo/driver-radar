export default async function handler(_req: any, res: any) {
  const out: Record<string, unknown> = {
    node: process.version,
    env: {
      JWT_SECRET: !!process.env.JWT_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_WEB_CLIENT_ID,
    },
  };
  const probe = async (name: string, fn: () => Promise<unknown>) => {
    try { await fn(); out[name] = 'ok'; }
    catch (e: any) { out[name] = { code: e?.code, message: String(e?.message).slice(0, 400) }; }
  };
  await probe('google-auth-library', () => import('google-auth-library'));
  await probe('jsonwebtoken', () => import('jsonwebtoken'));
  await probe('neon', () => import('@neondatabase/serverless'));
  await probe('drizzle', () => import('drizzle-orm/neon-http'));
  await probe('getDb', async () => {
    const { getDb } = await import('./_lib/db');
    out.getDbReturnsNull = getDb() === null;
  });
  res.status(200).json(out);
}
