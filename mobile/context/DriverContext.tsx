import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { api, driverApi, setAccessToken } from '@/lib/api';
import { hardcodedPlatforms, mergeDiscoveredPlatforms, PlatformDefinition } from '@/lib/platform-discovery';
import { scanInstalledPackages } from '@/lib/package-scanner';
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
  isLiveLetzGoApi: boolean;
  isFeedLoading: boolean;
  listenerError: string | null;
  isPro: boolean;
  lastSync: string;
  updateFilters: (next: Partial<Filters>) => void;
  togglePlatform: (platform: string) => void;
  toggleListener: () => void;
  toggleLiveLetzGoApi: () => void;
  acceptRide: (id: string) => void;
  declineRide: (id: string) => void;
  login: (phone: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  continueAsDemo: () => void;
  signOut: () => Promise<void>;
}

const STORAGE_KEY = '@driver-radar/state';
const PLATFORMS_STORAGE_KEY = '@driver-radar/platforms';
const seedRides: Ride[] = [
  { id: 'ride-001', platform: 'Bolt', fare: 4200, distance: 1.2, pickup: 'Maitama', dropoff: 'Wuse 2', rating: 4.86, eta: '2 min', status: 'pending', timestamp: 'Now' },
  { id: 'ride-002', platform: 'Uber', fare: 6800, distance: 2.4, pickup: 'Gwarinpa', dropoff: 'Central Area', rating: 4.92, eta: '4 min', status: 'pending', timestamp: '1 min' },
  { id: 'ride-003', platform: 'inDrive', fare: 3100, distance: 0.8, pickup: 'Jabi', dropoff: 'Airport Road', rating: 4.7, eta: '1 min', status: 'pending', timestamp: '2 min' },
  { id: 'ride-004', platform: 'Bolt', fare: 7600, distance: 3.8, pickup: 'Asokoro', dropoff: 'Katampe', rating: 4.78, eta: '6 min', status: 'accepted', timestamp: 'Today, 08:42' },
];
const defaultFilters: Filters = { minFare: 2500, maxRadius: 3, minRating: null, blacklistedZones: ['Airport Road'] };
const defaultPlatforms: Record<string, boolean> = Object.fromEntries(hardcodedPlatforms.map(({ id }) => [id, true]));
const demoDriver: DriverIdentity = { id: 0, email: 'demo@driverradar.ng', subscriptionTier: 'free' };

const DriverContext = createContext<DriverContextValue | null>(null);

export function DriverProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [rides, setRides] = useState(seedRides);
  const [filters, setFilters] = useState(defaultFilters);
  const [platforms, setPlatforms] = useState(defaultPlatforms);
  const [discoveredPlatforms, setDiscoveredPlatforms] = useState<PlatformDiscovery[]>([]);
  const [driver, setDriver] = useState(demoDriver);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isListenerLive, setIsListenerLive] = useState(true);
  const [isLiveLetzGoApi, setIsLiveLetzGoApi] = useState(true);
  const [lastSync, setLastSync] = useState('Just now');
  useEffect(() => {
    console.log('[LetzGo] polling gate', {
      authenticated: Boolean(token),
      masterListenerEnabled: isListenerLive,
      liveLetzGoApiEnabled: isLiveLetzGoApi,
      platformEnabled: platforms.LetzGo,
      pollingEnabled: Boolean(token) && isListenerLive && isLiveLetzGoApi && platforms.LetzGo,
    });
  }, [isListenerLive, isLiveLetzGoApi, platforms.LetzGo, token]);
  const remoteRides = useQuery({
    queryKey: ['rides'],
    queryFn: async () => {
      try {
        const result = await driverApi.getOffers();
        console.log('[LetzGo] offers received', {
          count: result.offers.length,
          firstPlatform: result.offers[0]?.platform ?? null,
        });
        return result;
      } catch (error) {
        console.log('[LetzGo] offers request failed', error instanceof Error ? error.message : String(error));
        throw error;
      }
    },
    enabled: Boolean(token) && isListenerLive && isLiveLetzGoApi && platforms.LetzGo,
    staleTime: 15_000,
    refetchInterval: isListenerLive && isLiveLetzGoApi && platforms.LetzGo ? 15_000 : false,
  });

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(PLATFORMS_STORAGE_KEY)]).then(([stored, storedPlatforms]) => {
      let legacyDiscoveredPlatforms: PlatformDiscovery[] = [];
      if (stored) {
        const state = JSON.parse(stored) as Partial<{ rides: Ride[]; filters: Filters; platforms: Record<string, boolean>; discoveredPlatforms: PlatformDiscovery[]; isLiveLetzGoApi: boolean; token: string | null; driver: DriverIdentity }>;
        setRides(state.rides ?? seedRides); setFilters(state.filters ?? defaultFilters); setPlatforms({ ...defaultPlatforms, ...state.platforms });
        legacyDiscoveredPlatforms = state.discoveredPlatforms ?? [];
        setIsLiveLetzGoApi(state.isLiveLetzGoApi ?? true);
        setToken(state.token ?? null); setDriver(state.driver ?? demoDriver); setAccessToken(state.token ?? null);
      }
      const savedPlatforms = storedPlatforms ? JSON.parse(storedPlatforms) as PlatformDiscovery[] : legacyDiscoveredPlatforms;
      setDiscoveredPlatforms((current) => mergeDiscoveredPlatforms([], savedPlatforms, current));
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
      scanInstalledPackages().catch((error) => {
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
      setLastSync('Just now');
    }
  }, [remoteRides.data, token]);
  useEffect(() => {
    setAccessToken(token);
    if (isHydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ rides, filters, platforms, isLiveLetzGoApi, token, driver })).catch((error) => console.warn('[Storage] Failed to save driver state', error));
  }, [driver, filters, isHydrated, isLiveLetzGoApi, platforms, rides, token]);
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
    if (token) api.decision(id, status).catch(() => undefined);
    Haptics.notificationAsync(status === 'accepted' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
  };
  const authenticate = async (mode: 'login' | 'register', identifier: string, password: string) => {
    const response = mode === 'login' ? await api.login(identifier, password) : await api.register(identifier, password);
    setToken(response.token); setAccessToken(response.token); setDriver(response.driver); await queryClient.invalidateQueries({ queryKey: ['rides'] });
  };
  const value = useMemo<DriverContextValue>(() => ({
    rides, visibleRides, filters, platforms, availablePlatforms, driver, token, isHydrated, isListenerLive, isLiveLetzGoApi, isFeedLoading: Boolean(token) && remoteRides.isLoading, listenerError: remoteRides.error instanceof Error ? remoteRides.error.message : remoteRides.error ? 'Live ride feed unavailable.' : null, isPro: driver.subscriptionTier === 'pro', lastSync,
    updateFilters: (next) => { updateFilters(next); if (token) api.preferences(next).catch(() => undefined); },
    togglePlatform: (platform) => setPlatforms((current) => ({ ...current, [platform]: !(current[platform] ?? true) })),
    toggleListener: () => { setIsListenerLive((current) => !current); Haptics.selectionAsync().catch(() => undefined); },
    toggleLiveLetzGoApi: () => { setIsLiveLetzGoApi((current) => !current); Haptics.selectionAsync().catch(() => undefined); },
    acceptRide: (id) => markRide(id, 'accepted'), declineRide: (id) => markRide(id, 'declined'),
    login: (phone, password) => authenticate('login', phone, password), register: (email, password) => authenticate('register', email, password),
    continueAsDemo: () => { setToken(null); setAccessToken(null); setDriver(demoDriver); }, signOut: async () => { setToken(null); setAccessToken(null); setDriver(demoDriver); await AsyncStorage.removeItem(STORAGE_KEY); },
  }), [availablePlatforms, driver, filters, isHydrated, isListenerLive, isLiveLetzGoApi, lastSync, platforms, remoteRides.error, remoteRides.isLoading, rides, token, visibleRides]);
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
