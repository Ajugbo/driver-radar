import { OAuth2Client } from 'google-auth-library';
import { sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { getDb } from '../_lib/db';

const WEB_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
if (!WEB_CLIENT_ID) throw new Error('GOOGLE_WEB_CLIENT_ID must be set');

const client = new OAuth2Client(WEB_CLIENT_ID);

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

    // 3. Find existing user by email (Using the CORRECT column 'name')
    const existingUser = await db.execute(sql`
      SELECT id, email, name, role FROM users WHERE email = ${payload.email}
    `) as { rows: any[] };
    
    let user = existingUser.rows?.[0];

    // 4. If user doesn't exist, create them (NO password column, added google_id)
    if (!user) {
      const createdUser = await db.execute(sql`
        INSERT INTO users (email, name, google_id, role)
        VALUES (${payload.email}, ${payload.name || 'Driver'}, ${payload.sub}, 'driver')
        RETURNING id, email, name, role
      `) as { rows: any[] };
      
      user = createdUser.rows?.[0];
    }

    // 5. Issue Driver Radar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET!,
      { expiresIn: '30d' }
    );

    // 6. Return the token AND the driver object
    // We hardcode subscriptionTier and currency here so the frontend DriverContext doesn't crash
    res.status(200).json({ 
      token, 
      driver: { 
        id: user.id, 
        email: user.email, 
        name: user.name || payload.name || 'Driver',
        subscriptionTier: 'free',
        currency: 'NGN'
      } 
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
}
