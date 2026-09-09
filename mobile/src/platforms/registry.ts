import Constants from 'expo-constants';
import type { RidePlatform } from './adapter';

type AdapterModule = Record<string, unknown>;
type PlatformConfig = { enabledPlatforms?: unknown };
type AdapterContext = ((path: string) => AdapterModule) & { keys: () => string[] };
type ContextRequire = typeof require & { context?: (directory: string, recursive: boolean, pattern: RegExp) => AdapterContext };

const platformLoaders: Record<string, () => Promise<AdapterModule>> = {
  inDrive: () => import('./indrive.adapter'),
};

function isRidePlatform(value: unknown): value is RidePlatform {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<RidePlatform>;
  return typeof candidate.name === 'string' && typeof candidate.connect === 'function' &&
    typeof candidate.listenForRides === 'function' && typeof candidate.acceptRide === 'function' &&
    typeof candidate.disconnect === 'function' && typeof candidate.getMetadata === 'function';
}

function discoveredLoaders(): Record<string, () => Promise<AdapterModule>> {
  const context = (require as ContextRequire).context?.('./', false, /^(?!\.\/base\.adapter\.ts$).*\.adapter\.ts$/);
  if (!context) return platformLoaders;
  return Object.fromEntries(context.keys().map((path) => {
    const name = path.replace(/^\.\//, '').replace(/\.adapter\.ts$/, '');
    return [name, () => Promise.resolve(context(path))];
  }));
}

function configuredPlatforms(): Set<string> | null {
  const extra = Constants.expoConfig?.extra as PlatformConfig | undefined;
  if (!Array.isArray(extra?.enabledPlatforms)) return null;
  return new Set(extra.enabledPlatforms.filter((name): name is string => typeof name === 'string'));
}

/** Discovers configured platform adapters and isolates failures per platform. */
export class PlatformRegistry {
  private readonly platforms = new Map<string, RidePlatform>();
  private initialized = false;

  /** Load all adapter modules that are enabled by app configuration. */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    const enabled = configuredPlatforms();
    await Promise.all(Object.entries(discoveredLoaders()).map(async ([name, load]) => {
      if (enabled && !enabled.has(name)) return;
      try {
        const module = await load();
        const adapter = Object.values(module).find(isRidePlatform);
        if (!adapter) throw new Error(`Adapter module ${name} did not export an adapter`);
        this.platforms.set(adapter.name, adapter);
      } catch (error) {
        console.warn(`[Driver Radar] Failed to load ${name} adapter`, error);
      }
    }));
    console.info('[Driver Radar] Loaded platforms:', [...this.platforms.keys()]);
  }

  /** Return all adapters that loaded successfully. */
  getActivePlatforms(): RidePlatform[] {
    return [...this.platforms.values()];
  }

  /** Find a loaded adapter by its platform name. */
  getPlatform(name: string): RidePlatform | undefined {
    return this.platforms.get(name);
  }
}

export const platformRegistry = new PlatformRegistry();