import { NativeModules, Platform } from 'react-native';
import type { PlatformDefinition, InstalledPackage } from './platform-discovery';
import { discoverPlatformsFromPackages } from './platform-discovery';

interface InstalledAppsBridge {
  getApps: () => Promise<InstalledPackage[]>;
}

export async function scanInstalledPackages(): Promise<PlatformDefinition[]> {
  if (Platform.OS !== 'android') return [];

  const scanner = NativeModules.RNAndroidInstalledApps as InstalledAppsBridge | undefined;
  if (!scanner?.getApps) {
    console.info('[Platforms] Installed-package scanner bridge is not available.');
    return [];
  }

  return discoverPlatformsFromPackages(await scanner.getApps());
}
