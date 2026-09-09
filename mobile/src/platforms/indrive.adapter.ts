import type { Ride } from '@/context/DriverContext';
import { api } from '@/lib/api';
import { BaseRidePlatformAdapter } from './base.adapter';

const RETRY_DELAYS_MS = [250, 750];

/** Adapter for the existing inDrive ride feed and decision API. */
export class InDriveAdapter extends BaseRidePlatformAdapter {
  readonly name = 'inDrive';
  private listener: ((ride: Ride) => void) | null = null;

  constructor() {
    super({
      adaptivePolling: false,
      highDemandIntervalMs: 5_000,
      idleIntervalMs: 60_000,
      idleAfterMs: 120_000,
    });
  }

  /** Establish the inDrive connection; authentication is managed by the shared API client. */
  async connect(): Promise<void> {
    this.setGeofenceActive(true);
  }

  /** Begin polling the shared feed and forward only inDrive rides to the aggregator. */
  listenForRides(callback: (ride: Ride) => void): void {
    this.listener = callback;
    this.startPolling();
    void this.poll();
  }

  /** Accept an inDrive ride, retrying transient failures before returning a safe fallback. */
  async acceptRide(rideId: string): Promise<boolean> {
    try {
      await this.withRetry(() => api.decision(rideId, 'accepted'));
      return true;
    } catch {
      return false;
    }
  }

  /** Return inDrive branding and the existing minimum fare used by Driver Radar. */
  getMetadata(): { color: string; icon: string; minFare: number } {
    return { color: '#00F0FF', icon: 'navigate-outline', minFare: 2_500 };
  }

  /** Stop polling and release the ride listener. */
  disconnect(): void {
    super.disconnect();
    this.listener = null;
  }

  protected async poll(): Promise<void> {
    try {
      const response = await this.withRetry(() => api.rides());
      const rides = response.rides.filter((ride): ride is Ride => ride.platform === this.name);
      this.recordNearbyRides(rides.length);
      rides.forEach((ride) => this.listener?.(ride));
    } catch {
      this.recordNearbyRides(0);
    }
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const delay = RETRY_DELAYS_MS[attempt];
        if (delay !== undefined) await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw lastError instanceof Error ? lastError : new Error('inDrive request failed');
  }
}

export const inDriveAdapter = new InDriveAdapter();