import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // 1. Read the token ONCE when the app starts
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('driverRadarToken');
        setHasToken(!!token);
      } catch (error) {
        console.error('Failed to read auth token', error);
        setHasToken(false);
      } finally {
        // 2. Only AFTER reading, allow the router to make decisions
        setIsHydrated(true);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    // 3. DO NOT redirect until hydration is complete
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!hasToken && !inAuthGroup) {
      // Not logged in, and not on auth screen -> go to auth
      router.replace('/auth');
    } else if (hasToken && inAuthGroup) {
      // Logged in, but stuck on auth screen -> go to tabs
      router.replace('/(tabs)');
    }
  }, [isHydrated, hasToken, segments, router]);

  // 4. Show a loading screen while checking storage (prevents the white flash)
  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#0ff" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
    </Stack>
  );
}
