import { cors, handleError, methodGuard, requireUser, type ApiRequest, type ApiResponse } from '../_lib/http';
const SECRET = process.env.PAYSTACK_SECRET_KEY;
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  const user = requireUser(req, res); if (!user) return;
  try {
    const r = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email, amount: 499900, currency: 'NGN',
        callback_url: 'https://driver-radar.vercel.app/api/subscription/callback',
        metadata: { driverId: user.id, days: 7 },
      }),
    });
    const j: any = await r.json();
    if (!j.status) return res.status(502).json({ error: j.message || 'Paystack init failed' });
    cors(res); res.status(200).json({ authorization_url: j.data.authorization_url, reference: j.data.reference });
  } catch (e) { handleError(res, e); }
}
