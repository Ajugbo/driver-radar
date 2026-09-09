import type { Ride } from '@/context/DriverContext';
import type { RidePlatform } from '@/src/platforms/adapter';
import { platformRegistry, PlatformRegistry } from '@/src/platforms/registry';

export type RideErrorHandler = (platform: string, error: unknown) => void;

/** Coordinates independent platform adapters into one ride stream. */
export class RideAggregator {
  private readonly registry: PlatformRegistry;
  private readonly ridesById = new Map<string, Ride>();
  private platforms: RidePlatform[] = [];

  constructor(registry: PlatformRegistry = platformRegistry) {
    this.registry = registry;
  }

  /** Connect each active platform and forward rides without allowing one failure to stop others. */
  async start(onRide: (ride: Ride) => void, onError?: RideErrorHandler): Promise<void> {
    await this.registry.initialize();
    this.platforms = this.registry.getActivePlatforms();
    await Promise.all(this.platforms.map(async (platform) => {
      try {
        await platform.connect();
        platform.listenForRides((ride) => {
          this.ridesById.set(ride.id, ride);
          onRide(ride);
        });
      } catch (error) {
        onError?.(platform.name, error);
      }
    }));
  }

  /** Accept a ride through its owning adapter, returning false when unavailable or rejected. */
  async acceptRide(ride: Ride): Promise<boolean> {
    const platform = this.registry.getPlatform(ride.platform);
    if (!platform) return false;
    try {
      return await platform.acceptRide(ride.id);
    } catch {
      return false;
    }
  }

  /** Stop all active adapters and release their timers and listeners. */
  stop(): void {
    this.platforms.forEach((platform) => {
      try {
        platform.disconnect();
      } catch {
        // A failing adapter must not prevent other platforms from stopping.
      }
    });
    this.platforms = [];
    this.ridesById.clear();
  }
}

export const rideAggregator = new RideAggregator();