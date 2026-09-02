import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface GuardDevice {
  id: string;
  label: string;
  addedAt: string;
}

interface AppContextValue {
  devices: GuardDevice[];
  isLoaded: boolean;
  isGuest: boolean;
  email: string | null;
  isPro: boolean;
  addDevice: (id: string, label: string) => Promise<void>;
  removeDevice: (id: string) => Promise<void>;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  upgradeToPro: () => void;
  restorePurchases: () => void;
}

const STORAGE_KEY = '@multi-app-guard/state';
const defaultDevice: GuardDevice = {
  id: 'GUARD-7A31',
  label: 'Primary workstation',
  addedAt: '2026-08-31T10:42:00.000Z',
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<GuardDevice[]>([defaultDevice]);
  const [email, setEmail] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted) return;
        if (raw) {
          const saved = JSON.parse(raw) as {
            devices?: GuardDevice[];
            email?: string | null;
            isPro?: boolean;
          };
          setDevices(saved.devices?.length ? saved.devices : [defaultDevice]);
          setEmail(saved.email ?? null);
          setIsPro(saved.isPro ?? false);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setIsLoaded(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ devices, email, isPro }),
    ).catch(() => undefined);
  }, [devices, email, isLoaded, isPro]);

  const value = useMemo<AppContextValue>(
    () => ({
      devices,
      isLoaded,
      isGuest: !email,
      email,
      isPro,
      addDevice: async (id, label) => {
        const normalizedId = id.trim().toUpperCase();
        const normalizedLabel = label.trim() || 'Unlabeled node';
        if (!normalizedId) throw new Error('Enter a device ID.');
        if (devices.some((device) => device.id === normalizedId)) {
          throw new Error('That device is already linked.');
        }
        if (!isPro && devices.length >= 1) {
          throw new Error('Free mode includes one device slot.');
        }
        setDevices((current) => [
          ...current,
          { id: normalizedId, label: normalizedLabel, addedAt: new Date().toISOString() },
        ]);
      },
      removeDevice: async (id) => {
        setDevices((current) => current.filter((device) => device.id !== id));
      },
      signIn: async (nextEmail) => setEmail(nextEmail.trim().toLowerCase()),
      signOut: async () => setEmail(null),
      upgradeToPro: () => setIsPro(true),
      restorePurchases: () => setIsPro(true),
    }),
    [devices, email, isLoaded, isPro],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider.');
  return context;
}