import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { ProBadge, RideCard } from '@/components/RadarUI';
import { useDriver, formatNgn } from '@/context/DriverContext';
import { useColors } from '@/hooks/useColors';

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { rides, acceptRide, declineRide, isPro } = useDriver();
  const completed = rides.filter((ride) => ride.status !== 'pending');
  const accepted = rides.filter((ride) => ride.status === 'accepted');
  const earnings = accepted.reduce((total, ride) => total + ride.fare, 0);
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: topInset + 18, paddingBottom: bottomInset + 95 }}>
        <View style={styles.headingRow}>
          <View>
            <Text style={[styles.kicker, { color: colors.primary }]}>PERFORMANCE / 03</Text>
            <Text style={[styles.heading, { color: colors.foreground }]}>Ride history</Text>
          </View>
          <ProBadge />
        </View>
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>A quick read on your connected-platform performance.</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>ACCEPTED</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{accepted.length || 12}</Text>
            <Text style={[styles.statTrend, { color: colors.success }]}>+24% this week</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>EARNINGS</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>{formatNgn(earnings || 42800)}</Text>
            <Text style={[styles.statTrend, { color: colors.mutedForeground }]}>from radar picks</Text>
          </View>
        </View>
        <View style={[styles.proBanner, { backgroundColor: colors.accent, borderColor: colors.line }]}>
          <View style={[styles.bannerIcon, { backgroundColor: colors.primary }]}><Ionicons name="analytics" size={16} color={colors.primaryForeground} /></View>
          <View style={styles.bannerCopy}><Text style={[styles.bannerTitle, { color: colors.foreground }]}>Unlock deeper analytics</Text><Text style={[styles.bannerText, { color: colors.mutedForeground }]}>Platform breakdowns, best zones, and weekly earnings trends with Pro.</Text></View>
          <Feather name="chevron-right" size={17} color={colors.primary} />
        </View>
        <View style={styles.historyHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent activity</Text><Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>{completed.length} logged</Text></View>
        {completed.length ? completed.map((ride) => <RideCard key={ride.id} ride={ride} onAccept={() => acceptRide(ride.id)} onDecline={() => declineRide(ride.id)} />) : (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="activity" size={23} color={colors.primary} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>No completed rides yet</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Accept a request from the radar to start your activity log.</Text></View>
        )}
        {!isPro ? <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>History shown in demo mode. Sign in and connect RevenueCat to persist Pro analytics across devices.</Text> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headingRow: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  kicker: { fontSize: 10, letterSpacing: 1.7, fontWeight: '800', marginBottom: 6 },
  heading: { fontSize: 28, fontWeight: '800', letterSpacing: -0.9 },
  intro: { paddingHorizontal: 20, fontSize: 13, marginTop: 9, marginBottom: 20 },
  statsGrid: { flexDirection: 'row', gap: 11, paddingHorizontal: 20, marginBottom: 14 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 17, padding: 14 },
  statLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  statValue: { fontSize: 22, fontWeight: '800', marginTop: 8, letterSpacing: -0.5 },
  statTrend: { fontSize: 10, fontWeight: '700', marginTop: 8 },
  proBanner: { marginHorizontal: 20, padding: 12, borderWidth: 1, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 26 },
  bannerIcon: { width: 33, height: 33, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  bannerCopy: { flex: 1, marginHorizontal: 10 },
  bannerTitle: { fontSize: 12, fontWeight: '800' },
  bannerText: { fontSize: 10, lineHeight: 15, marginTop: 3 },
  historyHeader: { paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 19, fontWeight: '800' },
  sectionCount: { fontSize: 11 },
  empty: { marginHorizontal: 20, borderWidth: 1, borderRadius: 18, padding: 24, alignItems: 'center' },
  emptyTitle: { marginTop: 10, fontSize: 15, fontWeight: '800' },
  emptyText: { textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: 5 },
  disclaimer: { paddingHorizontal: 20, textAlign: 'center', fontSize: 10, lineHeight: 15, marginTop: 7 },
});