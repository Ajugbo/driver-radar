import { OAuth2Client } from 'google-auth-library';
import { sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { getDb } from '../_lib/db';

const WEB_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
if (!WEB_CLIENT_ID) throw new Error('GOOGLE_WEB_CLIENT_ID must be set');

const client = new OAuth2Client(WEB_CLIENT_ID);

// Safely type the database response to satisfy TypeScript
interface DriverRecord {
  id: number | string;
  email: string;
  [key: string]: any;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken required' });

    // 1. Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(400).json({ error: 'Invalid token payload' });

    // 2. Connect to DB
    const db = getDb();
    if (!db) throw new Error('DATABASE_URL environment variable is required');

    // 3. Find existing driver by email (Table is 'drivers')
    const existing = await db.execute(sql`
      SELECT * FROM drivers WHERE email = ${payload.email}
    `) as { rows: DriverRecord[] };
    
    let driver = existing.rows[0];

    // 4. If driver doesn't exist, create them
    if (!driver) {
      const created = await db.execute(sql`
        INSERT INTO drivers (email, password_hash, subscription_tier, currency)
        VALUES (${payload.email}, NULL, 'free', 'NGN')
        RETURNING *
      `) as { rows: DriverRecord[] };
      
      driver = created.rows[0];
    }

    // 5. Issue Driver Radar JWT
    const token = jwt.sign(
      { id: driver.id, email: driver.email, role: 'driver' },
      JWT_SECRET!,
      { expiresIn: '30d' }
    );

    // 6. Return the token AND the driver object
    res.status(200).json({ 
      token, 
      driver: { 
        id: driver.id, 
        email: driver.email, 
        name: payload.name || 'Driver' 
      } 
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
}
