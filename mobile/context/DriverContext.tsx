import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAccessToken } from '@/lib/api';

export type PlatformName = 'Uber' | 'Bolt' | 'inDrive';
export type RideStatus = 'pending' | 'accepted' | 'declined' | 'expired';
export interface Ride {
  id: string;
  platform: PlatformName;
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
}
interface DriverContextValue {
  rides: Ride[];
  visibleRides: Ride[];
  filters: Filters;
  platforms: Record<PlatformName, boolean>;
  driver: DriverIdentity;
  token: string | null;
  isHydrated: boolean;
  isListenerLive: boolean;
  isPro: boolean;
  lastSync: string;
  updateFilters: (next: Partial<Filters>) => void;
  togglePlatform: (platform: PlatformName) => void;
  toggleListener: () => void;
  acceptRide: (id: string) => void;
  declineRide: (id: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  continueAsDemo: () => void;
  signOut: () => Promise<void>;
}

const STORAGE_KEY = '@driver-radar/state';
const seedRides: Ride[] = [
  { id: 'ride-001', platform: 'Bolt', fare: 4200, distance: 1.2, pickup: 'Maitama', dropoff: 'Wuse 2', rating: 4.86, eta: '2 min', status: 'pending', timestamp: 'Now' },
  { id: 'ride-002', platform: 'Uber', fare: 6800, distance: 2.4, pickup: 'Gwarinpa', dropoff: 'Central Area', rating: 4.92, eta: '4 min', status: 'pending', timestamp: '1 min' },
  { id: 'ride-003', platform: 'inDrive', fare: 3100, distance: 0.8, pickup: 'Jabi', dropoff: 'Airport Road', rating: 4.7, eta: '1 min', status: 'pending', timestamp: '2 min' },
  { id: 'ride-004', platform: 'Bolt', fare: 7600, distance: 3.8, pickup: 'Asokoro', dropoff: 'Katampe', rating: 4.78, eta: '6 min', status: 'accepted', timestamp: 'Today, 08:42' },
];
const defaultFilters: Filters = { minFare: 2500, maxRadius: 3, minRating: null, blacklistedZones: ['Airport Road'] };
const defaultPlatforms: Record<PlatformName, boolean> = { Uber: true, Bolt: true, inDrive: true };
const demoDriver: DriverIdentity = { id: 0, email: 'demo@driverradar.ng', subscriptionTier: 'free' };

function makeMockRide(index: number): Ride {
  const options: Array<Omit<Ride, 'id' | 'timestamp' | 'status'>> = [
    { platform: 'Uber', fare: 5300, distance: 1.6, pickup: 'Kubwa', dropoff: 'Garki', rating: 4.8, eta: '3 min' },
    { platform: 'Bolt', fare: 3900, distance: 1.1, pickup: 'Wuse 2', dropoff: 'Maitama', rating: 4.91, eta: '2 min' },
    { platform: 'inDrive', fare: 6100, distance: 2.7, pickup: 'Jabi', dropoff: 'Lugbe', rating: 4.73, eta: '5 min' },
  ];
  return { ...options[index % options.length], id: `live-${Date.now()}-${index}`, status: 'pending', timestamp: 'Just now' };
}

const DriverContext = createContext<DriverContextValue | null>(null);

export function DriverProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [rides, setRides] = useState(seedRides);
  const [filters, setFilters] = useState(defaultFilters);
  const [platforms, setPlatforms] = useState(defaultPlatforms);
  const [driver, setDriver] = useState(demoDriver);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isListenerLive, setIsListenerLive] = useState(true);
  const [lastSync, setLastSync] = useState('Just now');
  const remoteRides = useQuery({ queryKey: ['rides'], queryFn: api.rides, enabled: Boolean(token), staleTime: 15_000 });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        const state = JSON.parse(stored) as Partial<{ rides: Ride[]; filters: Filters; platforms: Record<PlatformName, boolean>; token: string | null; driver: DriverIdentity }>;
        setRides(state.rides ?? seedRides); setFilters(state.filters ?? defaultFilters); setPlatforms(state.platforms ?? defaultPlatforms);
        setToken(state.token ?? null); setDriver(state.driver ?? demoDriver); setAccessToken(state.token ?? null);
      }
      setIsHydrated(true);
    }).catch(() => setIsHydrated(true));
  }, []);
  useEffect(() => {
    if (token && remoteRides.data?.rides) setRides(remoteRides.data.rides);
  }, [remoteRides.data, token]);
  useEffect(() => {
    setAccessToken(token);
    if (isHydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ rides, filters, platforms, token, driver })).catch(() => undefined);
  }, [driver, filters, isHydrated, platforms, rides, token]);
  useEffect(() => {
    if (!isListenerLive) return;
    let index = 0;
    const interval = setInterval(() => { setRides((current) => [makeMockRide(index++), ...current].slice(0, 12)); setLastSync('Just now'); }, 18_000);
    return () => clearInterval(interval);
  }, [isListenerLive]);

  const visibleRides = useMemo(() => rides.filter((ride) =>
    ride.status === 'pending' && platforms[ride.platform] && ride.fare >= filters.minFare && ride.distance <= filters.maxRadius &&
    (filters.minRating === null || ride.rating >= filters.minRating) &&
    !filters.blacklistedZones.some((zone) => ride.pickup.toLowerCase().includes(zone.toLowerCase())),
  ), [filters, platforms, rides]);
  const updateFilters = (next: Partial<Filters>) => { setFilters((current) => ({ ...current, ...next })); setLastSync('Unsaved changes'); };
  const markRide = (id: string, status: 'accepted' | 'declined') => {
    setRides((current) => current.map((ride) => ride.id === id ? { ...ride, status, timestamp: 'Today, now' } : ride));
    if (token) api.decision(id, status).catch(() => undefined);
    Haptics.notificationAsync(status === 'accepted' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
  };
  const authenticate = async (mode: 'login' | 'register', email: string, password: string) => {
    const response = mode === 'login' ? await api.login(email, password) : await api.register(email, password);
    setToken(response.token); setAccessToken(response.token); setDriver(response.driver); await queryClient.invalidateQueries({ queryKey: ['rides'] });
  };
  const value = useMemo<DriverContextValue>(() => ({
    rides, visibleRides, filters, platforms, driver, token, isHydrated, isListenerLive, isPro: driver.subscriptionTier === 'pro', lastSync,
    updateFilters: (next) => { updateFilters(next); if (token) api.preferences(next).catch(() => undefined); },
    togglePlatform: (platform) => setPlatforms((current) => ({ ...current, [platform]: !current[platform] })),
    toggleListener: () => { setIsListenerLive((current) => !current); Haptics.selectionAsync().catch(() => undefined); },
    acceptRide: (id) => markRide(id, 'accepted'), declineRide: (id) => markRide(id, 'declined'),
    login: (email, password) => authenticate('login', email, password), register: (email, password) => authenticate('register', email, password),
    continueAsDemo: () => { setToken(null); setAccessToken(null); setDriver(demoDriver); }, signOut: async () => { setToken(null); setAccessToken(null); setDriver(demoDriver); await AsyncStorage.removeItem(STORAGE_KEY); },
  }), [driver, filters, isHydrated, isListenerLive, lastSync, platforms, rides, token, visibleRides]);
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
