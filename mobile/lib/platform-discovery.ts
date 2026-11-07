import type { PlatformDiscovery } from '../../packages/types';
import platformConfig from '../config/platforms.json';

export type PlatformDefinition = PlatformDiscovery;

export const hardcodedPlatforms = platformConfig as PlatformDefinition[];

export interface InstalledPackage {
  packageName: string;
  appName?: string;
}

const packageSignatures: Record<string, PlatformDefinition> = {
  'com.uber.driver': { id: 'Uber', name: 'Uber', type: 'notification', packageName: 'com.uber.driver' },
  'com.ubercab.driver': { id: 'Uber', name: 'Uber', type: 'notification', packageName: 'com.ubercab.driver' },
  'com.bolt.driver': { id: 'Bolt', name: 'Bolt', type: 'notification', packageName: 'com.bolt.driver' },
  'ee.mtakso.driver': { id: 'Bolt', name: 'Bolt', type: 'notification', packageName: 'ee.mtakso.driver' },
  'sinet.startup.inDriver': { id: 'inDrive', name: 'inDrive', type: 'notification', packageName: 'sinet.startup.inDriver' },
  'com.indrive.driver': { id: 'inDrive', name: 'inDrive', type: 'notification', packageName: 'com.indrive.driver' },
  'com.rida.driver': { id: 'Rida', name: 'Rida', type: 'notification', packageName: 'com.rida.driver' },
  'com.letzgo.driver': { id: 'LetzGo', name: 'LetzGo', type: 'api', packageName: 'com.letzgo.driver' },
};

export function discoverPlatformsFromPackages(packages: InstalledPackage[]): PlatformDefinition[] {
  const found = new Map<string, PlatformDefinition>();
  for (const installed of packages) {
    const signature = packageSignatures[installed.packageName];
    if (signature && !found.has(signature.id)) {
      found.set(signature.id, { ...signature, name: installed.appName || signature.name });
    }
  }
  return [...found.values()];
}

export function mergeDiscoveredPlatforms(
  baseline: PlatformDefinition[],
  ...sources: PlatformDefinition[][]
): PlatformDefinition[] {
  const merged = new Map<string, PlatformDefinition>();
  for (const platform of baseline) merged.set(platform.id, platform);
  for (const source of sources) {
    for (const platform of source) {
      if (!merged.has(platform.id)) merged.set(platform.id, platform);
    }
  }
  return [...merged.values()];
}
