# Platform Integration Guide

Driver Radar adapters live in `mobile/src/platforms`. Each adapter implements
`RidePlatform` and is coordinated by `RideAggregator`. Adapters must not change
the UI, authentication, or backend endpoint contracts.

## Add a Platform

1. Copy the commented template below to `mobile/src/platforms/<platform>.adapter.ts`.
2. Set `name` to the platform name used by the API and `getMetadata()` to the
   platform branding and minimum fare.
3. Implement `connect()`, `listenForRides()`, `acceptRide()`, and `disconnect()`.
4. Use the shared API client or an authenticated platform client. Never store
   API keys in source control.
5. Add one static loader to `mobile/src/platforms/registry.ts`. Expo Metro
   requires adapter modules to be statically discoverable at build time; the
   registry then dynamically loads and isolates each adapter at runtime.
6. Add the platform name to `mobile/app.json` under `extra.enabledPlatforms`.
7. Run the validation checklist below before enabling the adapter in production.

## Configuration and API Keys

The app configuration shape is:

```json
{
  "expo": {
    "extra": {
      "enabledPlatforms": ["inDrive"],
      "batteryOptimization": false
    }
  }
}
```

Use `EXPO_PUBLIC_*` environment variables only for non-secret client
configuration. Platform access tokens must come from the authenticated backend
or the platform connection API, not from `app.json` or a committed file.

## Battery Optimization

Adapters extending `BaseRidePlatformAdapter` can opt into adaptive polling:

- 5 seconds while nearby rides are detected.
- 60 seconds after two minutes without nearby demand.
- No polling while `setGeofenceActive(false)` is active.

The default is conservative polling with adaptive mode disabled. This avoids
the battery cost of three independent GPS and polling loops while retaining a
single app-owned stream and runtime `setPollingInterval(ms)` control.

## Commented Uber Adapter Template

```ts
// import type { Ride } from '@/context/DriverContext';
// import { BaseRidePlatformAdapter } from './base.adapter';
//
// export class UberAdapter extends BaseRidePlatformAdapter {
//   readonly name = 'Uber';
//
//   constructor() {
//     super({ adaptivePolling: true });
//   }
//
//   async connect(): Promise<void> {
//     // Acquire or refresh the server-issued Uber connection here.
//   }
//
//   listenForRides(callback: (ride: Ride) => void): void {
//     // Start the platform stream and call callback for each normalized ride.
//   }
//
//   async acceptRide(rideId: string): Promise<boolean> {
//     // Retry transient failures and return false when acceptance is rejected.
//     return false;
//   }
//
//   getMetadata(): { color: string; icon: string; minFare: number } {
//     return { color: '#111111', icon: 'car-outline', minFare: 2500 };
//   }
// }
```

## Production Checklist

- TypeScript passes with no adapter errors.
- Connect, retry, accept, decline fallback, and disconnect paths are tested.
- A platform outage leaves the other adapters and the unified feed running.
- API keys are supplied by secure runtime configuration.
- Adaptive polling is explicitly enabled only after battery testing.
- The app shows the expected source count and existing cyberpunk screens render unchanged.