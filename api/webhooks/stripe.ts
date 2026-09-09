import { parseWebhookBody, processPaymentWebhook, verifyStripeSignature } from '../_lib/payment-webhook';
import { allowRateLimit, requestIp } from '../_lib/rate-limit';
import { type ApiRequest, type ApiResponse } from '../_lib/http';

/** POST /api/webhooks/stripe: verify and process Stripe payment lifecycle events. */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  res.setHeader('Access-Control-Allow-Origin', process.env.WEBHOOK_ALLOWED_ORIGIN ?? 'https://driver-radar.vercel.app');
  if (!allowRateLimit(`stripe-webhook:${requestIp(req.headers)}`, 60)) {
    res.status(429).json({ error: 'Too many webhook requests' });
    return;
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !verifyStripeSignature(req, secret)) {
    res.status(400).json({ error: 'Invalid Stripe signature' });
    return;
  }
  try {
    await processPaymentWebhook('stripe', parseWebhookBody(req));
    res.status(200).json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Webhook processing failed' });
  }
}