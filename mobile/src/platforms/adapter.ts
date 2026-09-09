import type { Ride } from '@/context/DriverContext';

/** Integration contract implemented by every supported ride platform. */
export interface RidePlatform {
  /** Human-readable platform name used by the UI and configuration. */
  readonly name: string;
  /** Establish the platform connection. */
  connect(): Promise<void>;
  /** Start receiving rides from the platform. */
  listenForRides(callback: (ride: Ride) => void): void;
  /** Accept a ride on the platform. */
  acceptRide(rideId: string): Promise<boolean>;
  /** Release listeners and other platform resources. */
  disconnect(): void;
  /** Return display metadata and the platform's minimum fare. */
  getMetadata(): { color: string; icon: string; minFare: number };
}