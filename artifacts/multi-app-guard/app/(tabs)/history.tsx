import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { NeonButton } from '@/components/NeonButton';

const events = [
  { time: '10:42', title: 'Guardian handshake', detail: 'Primary workstation · active', tone: 'cyan' },
  { time: '10:12', title: 'Signal sweep complete', detail: 'No anomalies detected', tone: 'success' },
  { time: '09:42', title: 'Session renewed', detail: 'Local guardian token', tone: 'blue' },
];

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isPro } = useApp();

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 22, paddingBottom: insets.bottom + 108, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>TELEMETRY LOG</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Activity history</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>A record of guardian signals and system events.</Text>
      {isPro ? (
        <View style={[styles.list, { borderColor: colors.border, backgroundColor: colors.card }]}>
          {events.map((event, index) => (
            <View key={event.time} style={[styles.event, index < events.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
              <Text style={[styles.time, { color: colors.mutedForeground }]}>{event.time}</Text>
              <View style={styles.eventCopy}>
                <Text style={[styles.eventTitle, { color: colors.foreground }]}>{event.title}</Text>
                <Text style={[styles.eventDetail, { color: colors.mutedForeground }]}>{event.detail}</Text>
              </View>
              <View style={[styles.eventDot, { backgroundColor: colors[event.tone as 'cyan' | 'success' | 'blue'] }]} />
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.lockCard, { backgroundColor: colors.deep, borderColor: colors.border }]}>
          <View style={[styles.lockIcon, { backgroundColor: colors.accent }]}>
            <Feather name="lock" size={23} color={colors.primary} />
          </View>
          <Text style={[styles.lockTitle, { color: colors.foreground }]}>Unlock the telemetry log</Text>
          <Text style={[styles.lockBody, { color: colors.mutedForeground }]}>Pro keeps a 30-day history of every signal sweep, handshake, and alert.</Text>
          <NeonButton label="Unlock neural capacity" icon="zap" onPress={() => router.push('/paywall')} testID="unlock-history" />
          <Pressable onPress={() => router.push('/login')} testID="history-login">
            <Text style={[styles.link, { color: colors.primary }]}>Already linked? Sign in</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2.2 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 27, letterSpacing: -0.7, marginTop: 7 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 9, marginBottom: 24 },
  list: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  event: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  time: { fontFamily: 'Inter_700Bold', fontSize: 12, width: 38 },
  eventCopy: { flex: 1, gap: 4 },
  eventTitle: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  eventDetail: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  eventDot: { width: 8, height: 8, borderRadius: 4 },
  lockCard: { borderWidth: 1, borderRadius: 16, padding: 22, alignItems: 'center', gap: 13 },
  lockIcon: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  lockTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, textAlign: 'center' },
  lockBody: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: 5 },
  link: { fontFamily: 'Inter_600SemiBold', fontSize: 12, marginTop: 2 },
});