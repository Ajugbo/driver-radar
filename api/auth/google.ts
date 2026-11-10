import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { db } from '../_lib/db'; // Adjust path to match your DB client

const WEB_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;

if (!WEB_CLIENT_ID || !JWT_SECRET) {
  throw new Error('GOOGLE_WEB_CLIENT_ID and JWT_SECRET must be set');
}

const client = new OAuth2Client(WEB_CLIENT_ID);

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
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [payload.email]);
    let user;
    if (existing.rows.length > 0) {
      user = existing.rows[0];
    } else {
      const created = await db.query(
        'INSERT INTO users (email, name, google_id, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [payload.email, payload.name || 'Driver', payload.sub, 'driver']
      );
      user = created.rows[0];
    }

    // Issue Driver Radar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, driver: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
}