export type GuardianState = 'IDLE' | 'SCANNING' | 'ACTIVE' | 'ERROR';

export interface GuardStatus {
  state: GuardianState;
  latency: number | null;
  checkedAt: string;
  message: string;
}

const validStates: GuardianState[] = ['IDLE', 'SCANNING', 'ACTIVE', 'ERROR'];

function normalizeState(value: unknown): GuardianState {
  const next = String(value ?? '').toUpperCase() as GuardianState;
  return validStates.includes(next) ? next : 'IDLE';
}

export async function fetchGuardStatus(deviceId: string): Promise<GuardStatus> {
  const endpoint = process.env.EXPO_PUBLIC_GUARD_API_URL;
  if (!endpoint) {
    throw new Error('Guardian endpoint is not configured.');
  }

  const started = Date.now();
  const separator = endpoint.includes('?') ? '&' : '?';
  const response = await fetch(
    `${endpoint}${separator}deviceId=${encodeURIComponent(deviceId)}`,
  );

  if (!response.ok) {
    throw new Error(`Guardian signal returned ${response.status}.`);
  }

  const payload: unknown = await response.json();
  const record =
    typeof payload === 'object' && payload !== null
      ? (payload as Record<string, unknown>)
      : {};
  const state = normalizeState(record.status ?? record.state ?? record.guardianStatus);

  return {
    state,
    latency: Date.now() - started,
    checkedAt: new Date().toISOString(),
    message:
      state === 'ACTIVE'
        ? 'Protection layer is online.'
        : state === 'SCANNING'
          ? 'Guardian is sweeping the device signal.'
          : state === 'ERROR'
            ? 'Signal integrity needs attention.'
            : 'Guardian is standing by.',
  };
}