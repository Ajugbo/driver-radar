import type { RidePlatform } from './adapter';

export interface PollingOptions {
  adaptivePolling?: boolean;
  highDemandIntervalMs?: number;
  idleIntervalMs?: number;
  idleAfterMs?: number;
}

/** Shared polling controls for adapters that fetch rides over the network. */
export abstract class BaseRidePlatformAdapter implements RidePlatform {
  protected pollingIntervalMs = 15_000;
  protected readonly pollingOptions: Required<PollingOptions>;
  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  private lastNearbyRideAt: number | null = null;
  private geofenceActive = true;

  protected constructor(options: PollingOptions = {}) {
    this.pollingOptions = {
      adaptivePolling: options.adaptivePolling ?? false,
      highDemandIntervalMs: options.highDemandIntervalMs ?? 5_000,
      idleIntervalMs: options.idleIntervalMs ?? 60_000,
      idleAfterMs: options.idleAfterMs ?? 120_000,
    };
  }

  abstract readonly name: string;
  abstract connect(): Promise<void>;
  abstract listenForRides(callback: Parameters<RidePlatform['listenForRides']>[0]): void;
  abstract acceptRide(rideId: string): Promise<boolean>;
  abstract getMetadata(): ReturnType<RidePlatform['getMetadata']>;

  protected abstract poll(): Promise<void>;

  /** Change the polling interval used by the adapter at runtime. */
  setPollingInterval(ms: number): void {
    if (!Number.isFinite(ms) || ms < 1_000) throw new Error('Polling interval must be at least 1000ms');
    this.pollingIntervalMs = ms;
    this.restartPolling();
  }

  /** Enable or suspend polling based on the driver's current high-demand geofence. */
  setGeofenceActive(active: boolean): void {
    this.geofenceActive = active;
    if (active) this.restartPolling();
    else this.stopPolling();
  }

  /** Record nearby demand and switch between high-frequency and idle polling. */
  protected recordNearbyRides(count: number): void {
    if (count > 0) this.lastNearbyRideAt = Date.now();
    if (!this.pollingOptions.adaptivePolling) return;
    const idle = this.lastNearbyRideAt === null || Date.now() - this.lastNearbyRideAt > this.pollingOptions.idleAfterMs;
    this.setPollingInterval(idle ? this.pollingOptions.idleIntervalMs : this.pollingOptions.highDemandIntervalMs);
  }

  protected startPolling(): void {
    this.restartPolling();
  }

  protected stopPolling(): void {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    this.pollingTimer = null;
  }

  protected restartPolling(): void {
    this.stopPolling();
    if (!this.geofenceActive) return;
    this.pollingTimer = setInterval(() => { void this.poll(); }, this.pollingIntervalMs);
  }

  disconnect(): void {
    this.stopPolling();
  }
}