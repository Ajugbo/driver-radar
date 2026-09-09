import type { Driver } from '../drizzle/schema';

export const TRIAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000;
export const SUBSCRIPTION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
export const SUBSCRIPTION_GRACE_MS = 24 * 60 * 60 * 1000;

export interface SubscriptionAccess {
  allowed: boolean;
  tier: string;
  expiresAt: Date;
  daysRemaining: number;
}

function daysUntil(end: Date, now: Date) {
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
}

/** Evaluate access using the Vercel server clock. Client-provided dates are never accepted. */
export function checkSubscriptionAccess(driver: Pick<Driver, 'subscriptionTier' | 'trialStartDate' | 'subscriptionStartDate'>, now = new Date()): SubscriptionAccess {
  const subscriptionStart = driver.subscriptionStartDate;
  if (driver.subscriptionTier === 'pro' && subscriptionStart) {
    const expiresAt = new Date(subscriptionStart.getTime() + SUBSCRIPTION_DURATION_MS);
    const allowed = now.getTime() <= expiresAt.getTime() + SUBSCRIPTION_GRACE_MS;
    return { allowed, tier: 'pro', expiresAt, daysRemaining: daysUntil(expiresAt, now) };
  }

  const trialStart = driver.trialStartDate;
  if (driver.subscriptionTier === 'trial' && trialStart) {
    const expiresAt = new Date(trialStart.getTime() + TRIAL_DURATION_MS);
    const allowed = now.getTime() <= expiresAt.getTime() + SUBSCRIPTION_GRACE_MS;
    return { allowed, tier: 'trial', expiresAt, daysRemaining: daysUntil(expiresAt, now) };
  }

  return { allowed: false, tier: driver.subscriptionTier, expiresAt: new Date(0), daysRemaining: 0 };
}