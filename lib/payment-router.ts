export type PaymentProvider = 'stripe' | 'paystack';

export interface UserLocation {
  countryCode: string;
  currency?: string;
  email: string;
  callbackUrl: string;
  driverId?: number;
}

export interface PaymentRoute {
  provider: PaymentProvider;
  checkoutUrl: string;
  currency: string;
}

const africanPaystackCountries = new Set(['NG', 'GH', 'ZA']);
const africanPaystackCurrencies = new Set(['NGN', 'GHS', 'ZAR']);
const stripeCurrencies = new Set(['USD', 'EUR', 'GBP']);

function recordValue(value: unknown, key: string): unknown {
  return typeof value === 'object' && value !== null && key in value ? (value as Record<string, unknown>)[key] : undefined;
}

function responseMessage(value: unknown) {
  const message = recordValue(value, 'message');
  return typeof message === 'string' ? message : 'Payment provider request failed';
}

async function routePaystack(location: UserLocation, amount: number): Promise<PaymentRoute> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error('PAYSTACK_SECRET_KEY is not configured');
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: Math.round(amount * 100), currency: 'NGN', email: location.email, callback_url: location.callbackUrl, metadata: location.driverId ? { driver_id: String(location.driverId) } : undefined }),
  });
  const payload: unknown = await response.json();
  if (!response.ok || recordValue(payload, 'status') !== true) throw new Error(responseMessage(payload));
  const data = recordValue(payload, 'data');
  const checkoutUrl = recordValue(data, 'authorization_url');
  if (typeof checkoutUrl !== 'string') throw new Error('Paystack did not return a checkout URL');
  return { provider: 'paystack', checkoutUrl, currency: 'NGN' };
}

async function routeStripe(location: UserLocation, amount: number): Promise<PaymentRoute> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error('STRIPE_SECRET_KEY is not configured');
  const currency = stripeCurrencies.has(location.currency ?? '') ? location.currency as string : 'USD';
  const params = new URLSearchParams({
    mode: 'payment',
    success_url: location.callbackUrl,
    cancel_url: location.callbackUrl,
    customer_email: location.email,
    ...(location.driverId ? { client_reference_id: String(location.driverId), 'metadata[driver_id]': String(location.driverId) } : {}),
    'line_items[0][price_data][currency]': currency.toLowerCase(),
    'line_items[0][price_data][product_data][name]': 'Driver Radar 7-day Pro subscription',
    'line_items[0][price_data][unit_amount]': String(Math.round(amount * 100)),
    'line_items[0][quantity]': '1',
  });
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const payload: unknown = await response.json();
  if (!response.ok) throw new Error(responseMessage(payload));
  const checkoutUrl = recordValue(payload, 'url');
  if (typeof checkoutUrl !== 'string') throw new Error('Stripe did not return a checkout URL');
  return { provider: 'stripe', checkoutUrl, currency };
}

/** Route server-created checkout sessions; provider keys are never sent to clients. */
export async function routePayment(userLocation: UserLocation, amount: number, currency: string): Promise<PaymentRoute> {
  const countryCode = userLocation.countryCode.toUpperCase();
  const requestedCurrency = currency.toUpperCase();
  const location = { ...userLocation, countryCode, currency: requestedCurrency };
  if (africanPaystackCountries.has(countryCode) || africanPaystackCurrencies.has(requestedCurrency)) {
    return routePaystack(location, amount);
  }
  try {
    return await routeStripe(location, amount);
  } catch (error) {
    if (requestedCurrency === 'NGN' || requestedCurrency === 'GHS' || requestedCurrency === 'ZAR') {
      return routePaystack(location, amount);
    }
    throw error;
  }
}