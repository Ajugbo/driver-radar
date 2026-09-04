import { z } from 'zod';

export const platformSchema = z.enum(['Uber', 'Bolt', 'inDrive']);
export const rideStatusSchema = z.enum(['pending', 'accepted', 'declined', 'expired']);
export const authInputSchema = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(128) });
export const preferencesSchema = z.object({
  minFare: z.number().int().min(0).max(1_000_000).optional(),
  maxRadius: z.number().positive().max(100).optional(),
  minRating: z.number().min(0).max(5).nullable().optional(),
  blacklistedZones: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
});
export const rideDecisionSchema = z.object({ rideId: z.coerce.string().min(1), decision: z.enum(['accepted', 'declined']) });
export const platformConnectionSchema = z.object({
  platform: platformSchema,
  apiToken: z.string().min(1).max(500),
  isActive: z.boolean().default(true),
});
export const subscriptionSchema = z.object({
  tier: z.enum(['free', 'pro']),
  revenuecatCustomerId: z.string().max(200).optional(),
});

export type PlatformName = z.infer<typeof platformSchema>;
export type RideStatus = z.infer<typeof rideStatusSchema>;
export type AuthInput = z.infer<typeof authInputSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;
export type RideDecisionInput = z.infer<typeof rideDecisionSchema>;
export type PlatformConnectionInput = z.infer<typeof platformConnectionSchema>;
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;

export interface ApiRide {
  id: string;
  platform: PlatformName;
  fare: number;
  distance: number;
  pickup: string;
  dropoff: string;
  rating: number;
  eta: string;
  status: RideStatus;
  timestamp: string;
}

export interface DriverProfile {
  id: number;
  email: string;
  subscriptionTier: 'free' | 'pro';
}
