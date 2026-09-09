import { paymentCheckoutSchema } from '../../packages/types';
import { routePayment } from '../../lib/payment-router';
import { allowRateLimit, requestIp } from '../_lib/rate-limit';
import { cors, handleError, jsonBody, methodGuard, requireUser, type ApiRequest, type ApiResponse } from '../_lib/http';

/** POST /api/payment/checkout: create a server-priced seven-day Pro checkout session. */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  if (!allowRateLimit(`checkout:${requestIp(req.headers)}`, 10)) {
    res.status(429).json({ error: 'Too many payment attempts. Try again shortly.' });
    return;
  }
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const input = jsonBody(req, paymentCheckoutSchema);
    const route = await routePayment({
      countryCode: input.countryCode,
      currency: input.currency ?? (input.countryCode === 'NG' ? 'NGN' : 'USD'),
      email: input.email ?? user.email,
      callbackUrl: process.env.PAYMENT_CALLBACK_URL ?? 'https://driver-radar.vercel.app/paywall',
      driverId: user.id,
    }, 4999, input.currency ?? (input.countryCode === 'NG' ? 'NGN' : 'USD'));
    cors(res);
    res.status(200).json({ checkout: route, amount: 4999, periodDays: 7 });
  } catch (error) {
    handleError(res, error);
  }
}