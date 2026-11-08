import type { PlatformDefinition, InstalledPackage } from './platform-discovery';
import { discoverPlatformsFromPackages } from './platform-discovery';

export interface PlatformScannerAdapter {
  getInstalledPackages(): Promise<InstalledPackage[]>;
}

const jsOnlyAdapter: PlatformScannerAdapter = {
  async getInstalledPackages() {
    console.info('[Platforms] Installed-app enumeration requires a native scanner adapter.');
    return [];
  },
};

export async function scanInstalledPlatforms(
  adapter: PlatformScannerAdapter = jsOnlyAdapter,
): Promise<PlatformDefinition[]> {
  return discoverPlatformsFromPackages(await adapter.getInstalledPackages());
}
