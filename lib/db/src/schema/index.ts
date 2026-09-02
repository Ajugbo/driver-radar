import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  subscriptionTier: text("subscription_tier").notNull().default("free"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const driverPreferences = pgTable("driver_preferences", {
  driverId: integer("driver_id")
    .primaryKey()
    .references(() => drivers.id, { onDelete: "cascade" }),
  minFareNgn: integer("min_fare_ngn").notNull().default(2500),
  maxPickupRadiusKm: doublePrecision("max_pickup_radius_km").notNull().default(3),
  blacklistedZonesJson: jsonb("blacklisted_zones_json")
    .$type<string[]>()
    .notNull()
    .default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformConnections = pgTable("platform_connections", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id")
    .notNull()
    .references(() => drivers.id, { onDelete: "cascade" }),
  platformName: text("platform_name").notNull(),
  apiTokenEncrypted: text("api_token_encrypted").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const rideRequests = pgTable("ride_requests", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id")
    .notNull()
    .references(() => drivers.id, { onDelete: "cascade" }),
  platformSource: text("platform_source").notNull(),
  fareAmountNgn: integer("fare_amount_ngn").notNull(),
  pickupDistanceKm: doublePrecision("pickup_distance_km").notNull(),
  status: text("status").notNull().default("pending"),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  driverId: integer("driver_id")
    .primaryKey()
    .references(() => drivers.id, { onDelete: "cascade" }),
  revenuecatCustomerId: text("revenuecat_customer_id"),
  tier: text("tier").notNull().default("free"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});

export type Driver = typeof drivers.$inferSelect;
export type DriverPreferences = typeof driverPreferences.$inferSelect;
export type PlatformConnection = typeof platformConnections.$inferSelect;
export type RideRequest = typeof rideRequests.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;