CREATE TABLE "driver_preferences" (
	"driver_id" integer PRIMARY KEY NOT NULL,
	"min_fare_ngn" integer DEFAULT 2500 NOT NULL,
	"max_pickup_radius_km" double precision DEFAULT 3 NOT NULL,
	"min_rating" double precision,
	"blacklisted_zones_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"subscription_tier" text DEFAULT 'free' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "drivers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "platform_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"driver_id" integer NOT NULL,
	"platform_name" text NOT NULL,
	"api_token_encrypted" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ride_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"driver_id" integer NOT NULL,
	"platform_source" text NOT NULL,
	"fare_amount_ngn" integer NOT NULL,
	"pickup_distance_km" double precision NOT NULL,
	"pickup" text DEFAULT 'Unknown' NOT NULL,
	"dropoff" text DEFAULT 'Unknown' NOT NULL,
	"rider_rating" double precision DEFAULT 4.8 NOT NULL,
	"eta" text DEFAULT '3 min' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"driver_id" integer PRIMARY KEY NOT NULL,
	"revenuecat_customer_id" text,
	"tier" text DEFAULT 'free' NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "driver_preferences" ADD CONSTRAINT "driver_preferences_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_connections" ADD CONSTRAINT "platform_connections_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ride_requests" ADD CONSTRAINT "ride_requests_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE cascade ON UPDATE no action;