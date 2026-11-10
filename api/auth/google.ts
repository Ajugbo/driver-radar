import { OAuth2Client } from 'google-auth-library';
import { sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { getDb } from '../_lib/db';

const WEB_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

if (!WEB_CLIENT_ID) {
  throw new Error('GOOGLE_WEB_CLIENT_ID must be set');
}

const client = new OAuth2Client(WEB_CLIENT_ID);

type GoogleUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken required' });

    // Verify Google ID token using public JWKS keys (no API call needed)
    const ticket = await client.verifyIdToken({
      idToken,
      audience: WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(400).json({ error: 'Invalid token payload' });

    // Create or find Driver Radar user by email
    const db = getDb();
    if (!db) throw new Error('DATABASE_URL environment variable is required');
    const existing = await db.execute(sql<GoogleUser>`
      SELECT * FROM users WHERE email = ${payload.email}
    `);
    let user = existing.rows[0];
    if (!user) {
      const created = await db.execute(sql<GoogleUser>`
        INSERT INTO users (email, name, google_id, role)
        VALUES (${payload.email}, ${payload.name || 'Driver'}, ${payload.sub}, ${'driver'})
        RETURNING *
      `);
      user = created.rows[0];
    }

    // Issue Driver Radar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET!,
      { expiresIn: '30d' }
    );

    res.json({ token, driver: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
}