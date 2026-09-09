# Subscription and payments

## Server contract

All dates are calculated with the Vercel server clock. Clients cannot set trial or paid dates.

`GET /api/subscription` with a bearer token returns:

```json
{
  "subscription": {
    "driverId": 12,
    "allowed": true,
    "tier": "trial",
    "expiresAt": "2026-09-12T10:00:00.000Z",
    "daysRemaining": 3
  }
}
```

`POST /api/payment/checkout` accepts `{ "countryCode": "NG", "currency": "NGN" }` and returns:

```json
{
  "checkout": { "provider": "paystack", "checkoutUrl": "https://checkout.example", "currency": "NGN" },
  "amount": 4999,
  "periodDays": 7
}
```

The payment amount is server-owned. Nigeria, Ghana, and South Africa use Paystack; other locations use Stripe. A Stripe request that fails while using an African currency retries through Paystack.

## UI state mapping

```ts
if (subscription.tier === 'trial' && subscription.allowed) {
  return { label: '3-DAY FREE TRIAL', countdownDays: subscription.daysRemaining, action: null };
}
if (subscription.tier === 'pro' && subscription.allowed) {
  return { label: `PRO: ${subscription.daysRemaining} days left`, action: 'renew' };
}
return { label: 'Renew NGN 4,999 / 7d', action: 'payment' };
```

The existing subscription page only needs to bind these fields to its current cyberpunk presentation.

## Environment and compliance

Configure `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYSTACK_SECRET_KEY`, `PAYMENT_CALLBACK_URL`, and optionally `WEBHOOK_ALLOWED_ORIGIN` in Vercel. Secret keys are server-only and must never be included in Expo public variables.

Stripe and Paystack host card entry and tokenization. Driver Radar does not receive or store raw card numbers, which reduces PCI-DSS scope; webhook signatures must remain enabled in production.

Back up the EAS signing key in the Expo credential manager and an encrypted organizational secrets vault. Never commit or email a keystore, and never lose the signing key used for APK updates.

## Verification checklist

- Create a new account and log in: trial starts once when both server dates are null.
- Advance/mock the server clock three days plus one grace period and verify trial access expires.
- Send a verified provider success webhook and verify `pro`, seven-day expiry, and transaction log.
- Send failed, refund, and cancellation events and verify graceful revocation.
- Simulate NG/GH/ZA and US/EU/UK country/currency inputs and verify provider routing.
- Send an invalid webhook signature and verify HTTP 400 with no database mutation.
- Exceed checkout/webhook rate limits and verify HTTP 429.
