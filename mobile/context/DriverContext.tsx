import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError, api, driverApi, setAccessToken } from '@/lib/api';
import { hardcodedPlatforms, mergeDiscoveredPlatforms, PlatformDefinition } from '@/lib/platform-discovery';
import { scanInstalledPlatforms } from '@/lib/platform-scanner';
import type { PlatformDiscovery } from '../../packages/types';

export type PlatformName = 'Uber' | 'Bolt' | 'inDrive' | 'LetzGo' | 'Rida';
export type RideStatus = 'pending' | 'accepted' | 'declined' | 'expired';
export interface Ride {
  id: string;
  platform: string;
  fare: number;
  distance: number;
  pickup: string;
  dropoff: string;
  rating: number;
  eta: string;
  status: RideStatus;
  timestamp: string;
}
export interface Filters {
  minFare: number;
  maxRadius: number;
  minRating: number | null;
  blacklistedZones: string[];
}
interface DriverIdentity {
  id: number;
  email: string;
  subscriptionTier: 'free' | 'pro';
  token?: string;
  currency?: string;
}
interface DriverContextValue {
  rides: Ride[];
  visibleRides: Ride[];
  filters: Filters;
  platforms: Record<string, boolean>;
  availablePlatforms: PlatformDefinition[];
  driver: DriverIdentity;
  token: string | null;
  isHydrated: boolean;
  isListenerLive: boolean;
  isFeedLoading: boolean;
  listenerError: string | null;
  lastSync: string;
  updateFilters: (next: Partial<Filters>) => void;
  togglePlatform: (platform: string) => void;
  toggleListener: () => void;
  acceptRide: (id: string) => void;
  declineRide: (id: string) => void;
  login: (phone: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const STORAGE_KEY = '@driver-radar/state';
const TOKEN_STORAGE_KEY = '@driver-radar/token';
const PLATFORMS_STORAGE_KEY = '@driver-radar/platforms';
const defaultFilters: Filters = { minFare: 2500, maxRadius: 3, minRating: null, blacklistedZones: ['Airport Road'] };
const defaultPlatforms: Record<string, boolean> = Object.fromEntries(hardcodedPlatforms.map(({ id }) => [id, true]));
const emptyRides: Ride[] = [];

const DriverContext = createContext<DriverContextValue | null>(null);

export function DriverProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [rides, setRides] = useState<Ride[]>(emptyRides);
  const [filters, setFilters] = useState(defaultFilters);
  const [platforms, setPlatforms] = useState(defaultPlatforms);
  const [discoveredPlatforms, setDiscoveredPlatforms] = useState<PlatformDiscovery[]>([]);
  const [driver, setDriver] = useState<DriverIdentity>({ id: 0, email: '', subscriptionTier: 'free' });
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isListenerLive, setIsListenerLive] = useState(true);
  const [lastSync, setLastSync] = useState('Waiting for offers');
  const remoteRides = useQuery({
    queryKey: ['rides'],
    queryFn: () => driverApi.getOffers(),
    enabled: Boolean(token) && isListenerLive,
    staleTime: 15_000,
    refetchInterval: isListenerLive ? 15_000 : false,
  });

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(TOKEN_STORAGE_KEY),
      AsyncStorage.getItem(PLATFORMS_STORAGE_KEY),
    ]).then(([stored, storedToken, storedPlatforms]) => {
      let legacyDiscoveredPlatforms: PlatformDiscovery[] = [];
      if (stored) {
        const state = JSON.parse(stored) as Partial<{ filters: Filters; platforms: Record<string, boolean>; discoveredPlatforms: PlatformDiscovery[]; token: string | null }>;
        setFilters(state.filters ?? defaultFilters);
        setPlatforms({ ...defaultPlatforms, ...state.platforms });
        legacyDiscoveredPlatforms = state.discoveredPlatforms ?? [];
      }
      const savedPlatforms = storedPlatforms ? JSON.parse(storedPlatforms) as PlatformDiscovery[] : legacyDiscoveredPlatforms;
      setDiscoveredPlatforms((current) => mergeDiscoveredPlatforms([], savedPlatforms, current));
      setToken(storedToken);
      setAccessToken(storedToken);
      setIsHydrated(true);
    }).catch((error) => {
      console.warn('[Storage] Failed to restore driver state', error);
      setIsHydrated(true);
    });
  }, []);
  useEffect(() => {
    let active = true;
    Promise.all([
      api.platforms().catch((error) => {
        console.warn('[Platforms] API discovery failed', error);
        return [];
      }),
      scanInstalledPlatforms().catch((error) => {
        console.warn('[Platforms] Installed-package scan failed', error);
        return [];
      }),
    ]).then(([remotePlatforms, packagePlatforms]) => {
      if (active) {
        setDiscoveredPlatforms((current) => mergeDiscoveredPlatforms([], current, remotePlatforms, packagePlatforms));
      }
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (token && remoteRides.data?.offers) {
      setRides(remoteRides.data.offers);
      setLastSync(new Date().toLocaleTimeString());
    }
  }, [remoteRides.data, token]);
  useEffect(() => {
    setAccessToken(token);
    if (isHydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ filters, platforms })).catch((error) => console.warn('[Storage] Failed to save driver preferences', error));
  }, [filters, isHydrated, platforms, token]);
  useEffect(() => {
    if (isHydrated) AsyncStorage.setItem(PLATFORMS_STORAGE_KEY, JSON.stringify(discoveredPlatforms)).catch((error) => console.warn('[Storage] Failed to save discovered platforms', error));
  }, [discoveredPlatforms, isHydrated]);
  const visibleRides = useMemo(() => rides.filter((ride) =>
    ride.status === 'pending' && (platforms[ride.platform] ?? true) && ride.fare >= filters.minFare && ride.distance <= filters.maxRadius &&
    (filters.minRating === null || ride.rating >= filters.minRating) &&
    !filters.blacklistedZones.some((zone) => ride.pickup.toLowerCase().includes(zone.toLowerCase())),
  ), [filters, platforms, rides]);
  const availablePlatforms = useMemo(
    () => mergeDiscoveredPlatforms(hardcodedPlatforms, discoveredPlatforms),
    [discoveredPlatforms],
  );
  const updateFilters = (next: Partial<Filters>) => { setFilters((current) => ({ ...current, ...next })); setLastSync('Unsaved changes'); };
  const markRide = (id: string, status: 'accepted' | 'declined') => {
    setRides((current) => current.map((ride) => ride.id === id ? { ...ride, status, timestamp: 'Today, now' } : ride));
    if (token) api.decision(id, status).catch((error) => console.warn('[Rides] Failed to submit ride decision', error));
    Haptics.notificationAsync(status === 'accepted' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
  };
  const authenticate = async (mode: 'login' | 'register', identifier: string, password: string) => {
    const response = mode === 'login' ? await api.login(identifier, password) : await api.register(identifier, password);
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    setToken(response.token);
    setAccessToken(response.token);
    setDriver(response.driver);
    await queryClient.invalidateQueries({ queryKey: ['rides'] });
  };
  const signOut = useCallback(async () => {
    setToken(null);
    setAccessToken(null);
    setDriver({ id: 0, email: '', subscriptionTier: 'free' });
    setRides(emptyRides);
    setLastSync('Waiting for offers');
    setDiscoveredPlatforms([]);
    queryClient.removeQueries({ queryKey: ['rides'] });
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
      AsyncStorage.removeItem(PLATFORMS_STORAGE_KEY),
    ]);
  }, [queryClient]);
  useEffect(() => {
    if (remoteRides.error instanceof ApiError && remoteRides.error.status === 401) {
      console.warn('[Auth] Server rejected the saved session token.');
      signOut().catch((error) => console.error('[Auth] Failed to clear rejected session', error));
    }
  }, [remoteRides.error, signOut]);
  const value = useMemo<DriverContextValue>(() => ({
    rides, visibleRides, filters, platforms, availablePlatforms, driver, token, isHydrated, isListenerLive, isFeedLoading: Boolean(token) && remoteRides.isLoading, listenerError: remoteRides.error instanceof Error ? remoteRides.error.message : remoteRides.error ? 'Live ride feed unavailable.' : null, lastSync,
    updateFilters: (next) => { updateFilters(next); if (token) api.preferences(next).catch(() => undefined); },
    togglePlatform: (platform) => setPlatforms((current) => ({ ...current, [platform]: !(current[platform] ?? true) })),
    toggleListener: () => { setIsListenerLive((current) => !current); Haptics.selectionAsync().catch(() => undefined); },
    acceptRide: (id) => markRide(id, 'accepted'), declineRide: (id) => markRide(id, 'declined'),
    login: (phone, password) => authenticate('login', phone, password), register: (email, password) => authenticate('register', email, password),
    signOut,
  }), [availablePlatforms, driver, filters, isHydrated, isListenerLive, lastSync, platforms, remoteRides.error, remoteRides.isLoading, rides, token, visibleRides]);
  return <DriverContext.Provider value={value}>{children}</DriverContext.Provider>;
}

export function useDriver() {
  const context = useContext(DriverContext);
  if (!context) throw new Error('useDriver must be used within DriverProvider');
  return context;
}

export function formatNgn(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`;
}
