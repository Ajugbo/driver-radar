import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useDriver } from '@/context/DriverContext';
import { api } from '@/lib/api';
import { useColors } from '@/hooks/useColors';

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useDriver();
  const analyticsQuery = useQuery({
    queryKey: ['analytics'],
    queryFn: api.analytics,
    enabled: Boolean(token),
  });
  const analytics = analyticsQuery.data;
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  if (analyticsQuery.isLoading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading analytics...</Text>
      </View>
    );
  }

  if (analyticsQuery.error) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
        <Text style={[styles.emptyText, { color: colors.destructive }]}>
          {analyticsQuery.error instanceof Error ? analyticsQuery.error.message : 'Unable to load analytics.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: topInset + 18, paddingBottom: bottomInset + 30 }}>
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: colors.primary }]}>ANALYTICS / 05</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Performance Dashboard</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Total Earnings</Text>
        <Text style={[styles.bigNumber, { color: colors.primary }]}>₦{analytics?.totalEarnings.toLocaleString() ?? '—'}</Text>
        <Text style={[styles.subText, { color: colors.mutedForeground }]}>All-time</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="check-circle" size={20} color={colors.primary} />
          <Text style={[styles.statNumber, { color: colors.foreground }]}>{analytics?.totalTrips ?? '—'}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Trips</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="trending-up" size={20} color={colors.success} />
          <Text style={[styles.statNumber, { color: colors.foreground }]}>{analytics ? `${analytics.acceptanceRate}%` : '—'}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Acceptance Rate</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Daily Earnings (Last 7 Days)</Text>
        <View style={styles.chartPlaceholder}>
          {analytics?.dailyEarnings.length ? analytics.dailyEarnings.map((day) => (
            <View key={day.day} style={styles.barContainer}>
              <View style={[styles.bar, { height: `${(day.amount / analytics.maxDaily) * 100}%`, backgroundColor: colors.primary }]} />
              <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{day.day}</Text>
            </View>
          )) : <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No earnings data available yet</Text>}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  kicker: { fontSize: 10, letterSpacing: 1.7, fontWeight: '800', marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.9 },
  card: { marginHorizontal: 20, borderRadius: 17, borderWidth: 1, padding: 18, marginBottom: 15 },
  cardTitle: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  bigNumber: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  subText: { fontSize: 11, marginTop: 4 },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 15 },
  statCard: { flex: 1, borderRadius: 17, borderWidth: 1, padding: 15, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '800', marginTop: 8 },
  statLabel: { fontSize: 10, marginTop: 4 },
  chartPlaceholder: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 120, paddingTop: 20 },
  barContainer: { alignItems: 'center', flex: 1 },
  bar: { width: 20, borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 9, marginTop: 8 },
  loadingText: { fontSize: 14 },
  emptyText: { fontSize: 12 },
});
