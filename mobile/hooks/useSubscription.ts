import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TRIAL_KEY = '@driver-radar/trial-start';
const SUB_KEY = '@driver-radar/sub-expires';
const TRIAL_DAYS = 7;
const DAY = 86400000;

export type SubStatus = 'trial' | 'active' | 'expired';

export function useSubscription() {
  const [ready, setReady] = useState(false);
  const [trialStart, setTrialStart] = useState(0);
  const [subExpires, setSubExpires] = useState(0);

  const load = useCallback(async () => {
    // Local trial start (source of truth for trial phase)
    let t = Number(await AsyncStorage.getItem(TRIAL_KEY)) || 0;
    if (!t) { t = Date.now(); await AsyncStorage.setItem(TRIAL_KEY, String(t)); }
    setTrialStart(t);

    // Server-verified subscription (overrides local if active)
    try {
      const token = await AsyncStorage.getItem('@driver-radar/token');
      if (token) {
        const r = await fetch('https://driver-radar.vercel.app/api/subscription/status', {
          headers: { Authorization: 'Bearer ' + token },
        });
        const j = await r.json();
        if (j.active && j.expiresAt) {
          setSubExpires(j.expiresAt);
          return;
        }
      }
    } catch {}

    // Fallback to local storage only if server unreachable or inactive
    const s = Number(await AsyncStorage.getItem(SUB_KEY)) || 0;
    setSubExpires(s);
  }, []);

  useEffect(() => { load(); }, [load]);

  const now = Date.now();
  const trialEnds = trialStart + TRIAL_DAYS * DAY;
  const status: SubStatus = subExpires > now ? 'active' : now < trialEnds ? 'trial' : 'expired';
  const daysLeft = Math.max(0, Math.ceil((status === 'active' ? subExpires - now : trialEnds - now) / DAY));

  const refresh = useCallback(() => load(), [load]);

  return { ready, status, daysLeft, trialEnds, refresh };
}
