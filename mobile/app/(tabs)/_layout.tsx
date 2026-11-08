import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useDriver } from '@/context/DriverContext';
import { useColors } from '@/hooks/useColors';

export default function TabLayout() {
  const colors = useColors();
  const { isHydrated, token } = useDriver();

  if (!isHydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></View>;
  }

  if (!token) return <Redirect href="/auth" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: { position: 'absolute', backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.background, borderTopWidth: Platform.OS === 'web' ? 1 : 0, borderTopColor: colors.border, elevation: 0 },
        tabBarBackground: () => Platform.OS === 'ios'
          ? <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          : <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />,
      }}
    >
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ title: 'Radar', tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} /> }} />
      <Tabs.Screen name="filters" options={{ title: 'Filters', tabBarIcon: ({ color }) => <Feather name="sliders" size={22} color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ color }) => <Feather name="clock" size={22} color={color} /> }} />
      <Tabs.Screen name="analytics" options={{ title: 'Analytics', tabBarIcon: ({ color }) => <Feather name="trending-up" size={22} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <Feather name="settings" size={22} color={color} /> }} />
    </Tabs>
  );
}
