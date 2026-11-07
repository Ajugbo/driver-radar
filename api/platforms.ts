import { cors, methodGuard, type ApiRequest, type ApiResponse } from './_lib/http';
import { platformDiscoverySchema, type PlatformDiscovery } from '../packages/types';

const platforms: PlatformDiscovery[] = [
  { id: 'Uber', name: 'Uber', type: 'notification', packageName: 'com.ubercab.driver' },
  { id: 'Bolt', name: 'Bolt', type: 'notification', packageName: 'com.bolt.driver' },
  { id: 'inDrive', name: 'inDrive', type: 'notification', packageName: 'sinet.startup.inDriver' },
  { id: 'LetzGo', name: 'LetzGo', type: 'api', packageName: 'com.letzgo.driver' },
  { id: 'Rida', name: 'Rida', type: 'notification', packageName: 'com.rida.driver' },
];

function getConfiguredPlatforms(): PlatformDiscovery[] {
  const configured = process.env.PLATFORM_DISCOVERY_JSON;
  if (!configured) return [];

  let value: unknown;
  try {
    value = JSON.parse(configured);
  } catch {
    throw new Error('PLATFORM_DISCOVERY_JSON must contain valid JSON.');
  }

  const result = platformDiscoverySchema.array().safeParse(value);
  if (!result.success) {
    throw new Error(`PLATFORM_DISCOVERY_JSON is invalid: ${result.error.issues.map((issue) => issue.message).join(', ')}`);
  }
  return result.data;
}

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res, ['GET'])) return;
  try {
    const catalog = new Map(platforms.map((platform) => [platform.id, platform]));
    for (const platform of getConfiguredPlatforms()) {
      if (!catalog.has(platform.id)) catalog.set(platform.id, platform);
    }
    cors(res);
    res.status(200).json([...catalog.values()]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Platform discovery failed.';
    res.status(500).json({ error: message });
  }
}
