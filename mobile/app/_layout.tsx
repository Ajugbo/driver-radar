import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DriverProvider } from '@/context/DriverContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
  },
});

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 👇 FIX: Use the EXACT same key as DriverContext and auth.tsx
        const token = await AsyncStorage.getItem('@driver-radar/token');
        setHasToken(!!token);
      } catch (error) {
        console.error('Failed to read auth token', error);
        setHasToken(false);
      } finally {
        setIsHydrated(true);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!hasToken && !inAuthGroup) {
      router.replace('/auth');
    } else if (hasToken && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isHydrated, hasToken, segments, router]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#0ff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <DriverProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth" />
          </Stack>
        </DriverProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
