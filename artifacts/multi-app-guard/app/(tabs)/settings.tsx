import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { NeonButton } from '@/components/NeonButton';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { devices, email, isGuest, isPro, removeDevice, signOut, restorePurchases } = useApp();

  const remove = (id: string) => {
    Alert.alert('Unlink device?', 'The device will stop appearing in your local guardian list.', [
      { text: 'Keep linked', style: 'cancel' },
      { text: 'Unlink', style: 'destructive', onPress: () => removeDevice(id) },
    ]);
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 22, paddingBottom: insets.bottom + 108, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>SYSTEM CONFIG</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Tune your guardian network and access level.</Text>

      <View style={[styles.accountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.accountIcon, { backgroundColor: colors.accent }]}>
          <Feather name={isGuest ? 'user' : 'shield'} size={20} color={colors.primary} />
        </View>
        <View style={styles.accountCopy}>
          <Text style={[styles.accountLabel, { color: colors.mutedForeground }]}>{isGuest ? 'GUEST ACCESS' : 'NEURAL LINK'}</Text>
          <Text style={[styles.accountValue, { color: colors.foreground }]}>{email ?? 'Not connected'}</Text>
        </View>
        <Pressable onPress={() => (isGuest ? router.push('/login') : signOut())} testID="account-action">
          <Text style={[styles.actionLink, { color: colors.primary }]}>{isGuest ? 'Sign in' : 'Sign out'}</Text>
        </Pressable>
      </View>

      <Text style={[styles.section, { color: colors.mutedForeground }]}>LINKED DEVICES</Text>
      <View style={[styles.deviceList, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {devices.map((device) => (
          <View key={device.id} style={styles.deviceRow}>
            <View style={[styles.deviceGlyph, { backgroundColor: colors.deep }]}>
              <Feather name="cpu" size={18} color={colors.primary} />
            </View>
            <View style={styles.deviceCopy}>
              <Text style={[styles.deviceName, { color: colors.foreground }]}>{device.label}</Text>
              <Text style={[styles.deviceId, { color: colors.mutedForeground }]}>{device.id}</Text>
            </View>
            <Pressable onPress={() => remove(device.id)} accessibilityRole="button" testID={`remove-${device.id}`}>
              <Feather name="trash-2" size={17} color={colors.destructive} />
            </Pressable>
          </View>
        ))}
      </View>

      <Text style={[styles.section, { color: colors.mutedForeground }]}>ACCESS LEVEL</Text>
      <View style={[styles.proCard, { borderColor: isPro ? colors.primary : colors.border, backgroundColor: colors.deep }]}>
        <View style={styles.proTop}>
          <View style={[styles.proBadge, { backgroundColor: isPro ? colors.primary : colors.accent }]}>
            <Feather name="zap" size={15} color={isPro ? colors.primaryForeground : colors.primary} />
          </View>
          <View style={styles.proCopy}>
            <Text style={[styles.proTitle, { color: colors.foreground }]}>{isPro ? 'PRO CAPACITY ACTIVE' : 'FREE CAPACITY'}</Text>
            <Text style={[styles.proBody, { color: colors.mutedForeground }]}>{isPro ? 'Unlimited nodes and full telemetry history.' : 'One node and standard refresh interval.'}</Text>
          </View>
        </View>
        {!isPro ? <NeonButton label="View Pro access" icon="arrow-up-right" onPress={() => router.push('/paywall')} testID="open-paywall" /> : <Text style={[styles.activeText, { color: colors.success }]}>● Entitlement verified</Text>}
      </View>

      <View style={[styles.rowCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.rowCopy}>
          <Text style={[styles.rowTitle, { color: colors.foreground }]}>Restore purchases</Text>
          <Text style={[styles.rowBody, { color: colors.mutedForeground }]}>Check your active subscription.</Text>
        </View>
        <Pressable onPress={() => { restorePurchases(); Alert.alert('Entitlements restored', 'Your Neural Capacity has been refreshed.'); }} testID="restore-purchases">
          <Feather name="refresh-cw" size={18} color={colors.primary} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2.2 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 27, letterSpacing: -0.7, marginTop: 7 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 9, marginBottom: 24 },
  accountCard: { borderWidth: 1, borderRadius: 14, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  accountIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  accountCopy: { flex: 1, gap: 4 },
  accountLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2 },
  accountValue: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  actionLink: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  section: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6, marginTop: 26, marginBottom: 10 },
  deviceList: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  deviceRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  deviceGlyph: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  deviceCopy: { flex: 1, gap: 4 },
  deviceName: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  deviceId: { fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 1.1 },
  proCard: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 17 },
  proTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  proBadge: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  proCopy: { flex: 1, gap: 4 },
  proTitle: { fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.4 },
  proBody: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16 },
  activeText: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.3 },
  rowCard: { borderWidth: 1, borderRadius: 14, padding: 15, marginTop: 12, flexDirection: 'row', alignItems: 'center' },
  rowCopy: { flex: 1, gap: 4 },
  rowTitle: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  rowBody: { fontFamily: 'Inter_400Regular', fontSize: 11 },
});