import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { ProBadge } from '@/components/RadarUI';
import { PlatformName, useDriver } from '@/context/DriverContext';
import { useColors } from '@/hooks/useColors';

const platformCopy: Array<{ name: PlatformName; icon: keyof typeof Ionicons.glyphMap; description: string }> = [
  { name: 'Uber', icon: 'car-outline', description: 'Ride requests and trip status' },
  { name: 'Bolt', icon: 'flash-outline', description: 'Ride requests and trip status' },
  { name: 'inDrive', icon: 'navigate-outline', description: 'Ride requests and trip status' },
];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { platforms, togglePlatform, driver, isPro, signOut } = useDriver();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: topInset + 18, paddingBottom: bottomInset + 95 }}>
        <View style={styles.headingRow}><View><Text style={[styles.kicker, { color: colors.primary }]}>SYSTEM / 04</Text><Text style={[styles.heading, { color: colors.foreground }]}>Connections</Text></View><ProBadge /></View>
        <View style={[styles.identityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.identityMark, { backgroundColor: colors.primary }]}><Text style={[styles.identityLetter, { color: colors.primaryForeground }]}>{driver.email.slice(0, 1).toUpperCase()}</Text></View>
          <View style={styles.identityCopy}><Text style={[styles.identityName, { color: colors.foreground }]}>{driver.email === 'demo@driverradar.ng' ? 'Demo driver' : driver.email}</Text><Text style={[styles.identitySub, { color: colors.mutedForeground }]}>{isPro ? 'Radar Pro member' : 'Free plan'} • Abuja, NG</Text></View>
          <Pressable testID="auth-link" onPress={() => router.push('/auth')}><Feather name="edit-3" size={16} color={colors.mutedForeground} /></Pressable>
        </View>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PLATFORM LISTENERS</Text>
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {platformCopy.map((platform, index) => (
            <View key={platform.name} style={[styles.platformRow, index < platformCopy.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
              <View style={[styles.platformIcon, { backgroundColor: colors.accent }]}><Ionicons name={platform.icon} size={18} color={colors.primary} /></View>
              <View style={styles.platformCopy}><Text style={[styles.platformName, { color: colors.foreground }]}>{platform.name}</Text><Text style={[styles.platformDescription, { color: colors.mutedForeground }]}>{platforms[platform.name] ? platform.description : 'Listener paused'}</Text></View>
              <Pressable testID={`platform-${platform.name}`} onPress={() => togglePlatform(platform.name)} style={[styles.switch, { backgroundColor: platforms[platform.name] ? colors.primary : colors.input }]}><View style={[styles.switchKnob, { backgroundColor: platforms[platform.name] ? colors.primaryForeground : colors.mutedForeground, alignSelf: platforms[platform.name] ? 'flex-end' : 'flex-start' }]} /></Pressable>
            </View>
          ))}
        </View>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        <Pressable testID="upgrade-link" onPress={() => router.push('/paywall')} style={[styles.menuRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.menuIcon, { backgroundColor: colors.accent }]}><Ionicons name="flash" size={16} color={colors.primary} /></View><View style={styles.menuCopy}><Text style={[styles.menuTitle, { color: colors.foreground }]}>Radar Pro</Text><Text style={[styles.menuSub, { color: colors.mutedForeground }]}>Unlimited platforms and priority pings</Text></View><Feather name="chevron-right" size={17} color={colors.mutedForeground} />
        </Pressable>
        <Pressable testID="sign-out" onPress={() => signOut()} style={[styles.menuRow, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 9 }]}>
          <View style={[styles.menuIcon, { backgroundColor: colors.muted }]}><Feather name="log-out" size={16} color={colors.mutedForeground} /></View><View style={styles.menuCopy}><Text style={[styles.menuTitle, { color: colors.foreground }]}>Sign out</Text><Text style={[styles.menuSub, { color: colors.mutedForeground }]}>Return to demo mode on this device</Text></View>
        </Pressable>
        <Text style={[styles.version, { color: colors.mutedForeground }]}>DRIVER RADAR v1.0.0 • Mock listeners enabled</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headingRow: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  kicker: { fontSize: 10, letterSpacing: 1.7, fontWeight: '800', marginBottom: 6 },
  heading: { fontSize: 28, fontWeight: '800', letterSpacing: -0.9 },
  identityCard: { marginHorizontal: 20, marginTop: 21, padding: 14, borderRadius: 17, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  identityMark: { width: 39, height: 39, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  identityLetter: { fontSize: 15, fontWeight: '900' },
  identityCopy: { flex: 1, marginLeft: 11 },
  identityName: { fontSize: 13, fontWeight: '800' },
  identitySub: { fontSize: 10, marginTop: 4 },
  sectionLabel: { fontSize: 10, letterSpacing: 1.3, fontWeight: '800', paddingHorizontal: 20, marginTop: 28, marginBottom: 10 },
  listCard: { marginHorizontal: 20, borderRadius: 17, borderWidth: 1, overflow: 'hidden' },
  platformRow: { padding: 14, flexDirection: 'row', alignItems: 'center' },
  platformIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  platformCopy: { flex: 1, marginLeft: 11 },
  platformName: { fontSize: 13, fontWeight: '800' },
  platformDescription: { fontSize: 10, marginTop: 3 },
  switch: { width: 43, height: 25, borderRadius: 14, padding: 3, justifyContent: 'center' },
  switchKnob: { width: 19, height: 19, borderRadius: 10 },
  menuRow: { marginHorizontal: 20, borderWidth: 1, borderRadius: 16, padding: 13, flexDirection: 'row', alignItems: 'center' },
  menuIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  menuCopy: { flex: 1, marginLeft: 11 },
  menuTitle: { fontSize: 13, fontWeight: '800' },
  menuSub: { fontSize: 10, marginTop: 3 },
  version: { textAlign: 'center', fontSize: 9, letterSpacing: 1.1, marginTop: 28 },
});