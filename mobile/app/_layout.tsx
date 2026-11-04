import { ErrorBoundary } from '@/components/ErrorBoundary';
import React from 'react';
import { Alert } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { DriverProvider } from '@/context/DriverContext';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary
          onError={(error, componentStack) => {
            console.error('[Root React error]', error.message, error.stack, componentStack);
            Alert.alert('App error', `${error.message}\n\n${componentStack}`);
          }}
        >
          <DriverProvider>
            <Stack screenOptions={{ headerBackTitle: 'Back' }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false }} />
            </Stack>
          </DriverProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
