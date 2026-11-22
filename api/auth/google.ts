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

    // 3. Find existing user by email. ONLY select columns guaranteed to exist.
    const existingUser = await db.execute(sql`
      SELECT id, email, role FROM users WHERE email = ${payload.email}
    `) as { rows: any[] };
    
    let user = existingUser.rows?.[0];

    // 4. If user doesn't exist, create them with minimal required fields
    if (!user) {
      const createdUser = await db.execute(sql`
        INSERT INTO users (email, password, role)
        VALUES (${payload.email}, NULL, 'driver')
        RETURNING id, email, role
      `) as { rows: any[] };
      
      user = createdUser.rows?.[0];

      // 5. Create a corresponding empty driver profile linked to this user
      if (user) {
        // Use .catch() so it doesn't crash the whole login if the drivers table is missing/strict
        await db.execute(sql`
          INSERT INTO drivers (user_id, status)
          VALUES (${user.id}, 'pending')
        `).catch(err => console.log("Driver profile creation skipped:", err.message));
      }
    }

    // 6. Issue Driver Radar JWT using the correct 'id'
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET!,
      { expiresIn: '30d' }
    );

    // 7. Return the token. Use Google's payload.name directly!
    res.status(200).json({ 
      token, 
      driver: { 
        id: user.id, 
        email: user.email, 
        name: payload.name || 'Driver' 
      } 
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
}
