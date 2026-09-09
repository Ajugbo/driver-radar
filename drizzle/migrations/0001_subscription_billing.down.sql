-- Rollback for 0001_subscription_billing.sql.
DROP TABLE IF EXISTS "transactions";
ALTER TABLE "drivers" DROP COLUMN IF EXISTS "trial_start_date";
ALTER TABLE "drivers" DROP COLUMN IF EXISTS "subscription_start_date";
ALTER TABLE "drivers" DROP COLUMN IF EXISTS "currency";
-- subscription_tier existed in the initial schema and is intentionally retained.