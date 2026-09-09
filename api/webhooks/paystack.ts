import { parseWebhookBody, processPaymentWebhook, verifyPaystackSignature } from '../_lib/payment-webhook';
import { allowRateLimit, requestIp } from '../_lib/rate-limit';
import { type ApiRequest, type ApiResponse } from '../_lib/http';

/** POST /api/webhooks/paystack: verify and process Paystack payment lifecycle events. */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  res.setHeader('Access-Control-Allow-Origin', process.env.WEBHOOK_ALLOWED_ORIGIN ?? 'https://driver-radar.vercel.app');
  if (!allowRateLimit(`paystack-webhook:${requestIp(req.headers)}`, 60)) {
    res.status(429).json({ error: 'Too many webhook requests' });
    return;
  }
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !verifyPaystackSignature(req, secret)) {
    res.status(400).json({ error: 'Invalid Paystack signature' });
    return;
  }
  try {
    await processPaymentWebhook('paystack', parseWebhookBody(req));
    res.status(200).json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Webhook processing failed' });
  }
}