# Subscription Production Deployment

## Current status

The application code and idempotent migration are committed in the working tree. The migration and Vercel deployment cannot run from this environment until `DATABASE_URL` and Vercel authentication are supplied. No real API key belongs in this repository.

## 1. Configure Vercel variables

In Vercel, open the `driver-radar` project, choose **Settings > Environment Variables**, and add each variable for **Production**:

| Variable | Value | Source |
| --- | --- | --- |
| `DATABASE_URL` | Neon pooled connection string | Neon Console > Project > Connection Details |
| `JWT_SECRET` | `openssl rand -hex 32` output | Generate locally; never reuse a public value |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe Dashboard > Developers > API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe Developers > Webhooks > endpoint signing secret |
| `PAYSTACK_SECRET_KEY` | `sk_live_...` | Paystack Dashboard > Settings > API Keys & Webhooks |
| `PAYMENT_CALLBACK_URL` | `https://driver-radar.vercel.app` | Fixed production callback |
| `WEBHOOK_ALLOWED_ORIGIN` | `https://driver-radar.vercel.app` | Fixed production origin |

Use the placeholder names in [.vercel-env-template](.vercel-env-template) as a checklist. Set secrets only in Vercel or a local untracked environment file.

## 2. Apply the database migration

From the repository root, with `DATABASE_URL` set in the shell:

```sh
npx drizzle-kit migrate --config=drizzle.config.ts
```

Migration `0001_subscription_billing` is idempotent. Verify `drivers.trial_start_date`, `drivers.subscription_start_date`, `drivers.subscription_tier`, `drivers.currency`, and the `transactions` table in Neon. The rollback file is [0001_subscription_billing.down.sql](drizzle/migrations/0001_subscription_billing.down.sql); use it only after stopping traffic and confirming data impact.

## 3. Configure provider webhooks

Stripe endpoint:

`https://driver-radar.vercel.app/api/webhooks/stripe`

Subscribe to checkout completion, payment success/failure, refunds, and cancellations. Copy the endpoint signing secret to `STRIPE_WEBHOOK_SECRET`.

Paystack endpoint:

`https://driver-radar.vercel.app/api/webhooks/paystack`

Configure charge success, failed charge, refund, and cancellation events. Paystack signs requests using the secret key stored as `PAYSTACK_SECRET_KEY`.

## 4. Deploy

After variables are saved and the migration succeeds:

```sh
vercel --prod --confirm
```

Confirm the deployment alias is `https://driver-radar.vercel.app`. The production APK build from commit `9d9aeb2` uses this same API URL through `EXPO_PUBLIC_API_URL`.

## 5. Smoke tests

1. Register a new driver and log in. Confirm the response contains `tier: "trial"`, `allowed: true`, and a three-day `expiresAt`.
2. Call `GET /api/subscription` with the bearer token and confirm the response is server-calculated.
3. Call `POST /api/payment/checkout` with `{ "countryCode": "NG", "currency": "NGN" }`; confirm the provider is Paystack and the amount is 4999.
4. Repeat with `{ "countryCode": "US", "currency": "USD" }`; confirm the provider is Stripe.
5. Send provider test webhooks and verify signature rejection for a modified payload.
6. Confirm a successful webhook sets Pro for seven days, clears the trial, and creates one transaction record.
7. Confirm failed, refunded, or cancelled events revoke access without exposing provider secrets.

## Rollback plan

1. Disable the Stripe and Paystack webhook endpoints temporarily.
2. Roll back the Vercel deployment to the previous known-good deployment.
3. Do not run the SQL rollback until the transaction table and subscription columns have been exported and the impact is understood.
4. If rollback is required, review and run the down migration manually, then restore the prior application version.
5. Rotate any secret that may have appeared in logs or a client bundle.

## Monitoring checklist

- Alert on non-2xx responses from both webhook URLs.
- Inspect duplicate provider transaction IDs and failed signature checks.
- Track trial-to-paid conversion and payment failure rates.
- Review subscriptions whose `expiresAt` is past due or within the 24-hour grace period.
- Confirm database connectivity and migration status after each deployment.
- Keep the EAS Android signing key backed up in an encrypted organizational vault; never commit or lose it.