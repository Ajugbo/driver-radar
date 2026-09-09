-- Subscription lifecycle fields are server-owned and must never be written from client dates.
ALTER TABLE "drivers" ADD COLUMN IF NOT EXISTS "trial_start_date" timestamp with time zone;
ALTER TABLE "drivers" ADD COLUMN IF NOT EXISTS "subscription_start_date" timestamp with time zone;
ALTER TABLE "drivers" ADD COLUMN IF NOT EXISTS "subscription_tier" varchar(20) DEFAULT 'free';
ALTER TABLE "drivers" ADD COLUMN IF NOT EXISTS "currency" varchar(3) DEFAULT 'NGN';

COMMENT ON COLUMN "drivers"."trial_start_date" IS 'Server timestamp when the driver first used the free trial.';
COMMENT ON COLUMN "drivers"."subscription_start_date" IS 'Server timestamp when the current paid subscription became active.';
COMMENT ON COLUMN "drivers"."subscription_tier" IS 'Server-owned access tier: free, trial, or pro.';
COMMENT ON COLUMN "drivers"."currency" IS 'ISO 4217 currency used for the driver billing flow.';

CREATE TABLE IF NOT EXISTS "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"driver_id" integer NOT NULL,
	"provider" varchar(20) NOT NULL,
	"provider_transaction_id" text NOT NULL,
	"amount_minor" integer NOT NULL,
	"currency" varchar(3) NOT NULL,
	"status" varchar(20) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_provider_transaction_unique" UNIQUE("provider", "provider_transaction_id")
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE cascade ON UPDATE no action;