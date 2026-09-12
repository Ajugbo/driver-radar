import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { api } from '@/lib/api';
import { formatNgn, useDriver } from '@/context/DriverContext';
import { useColors } from '@/hooks/useColors';

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token, currency } = useDriver();
  const analytics = useQuery({
    queryKey: ['analytics'],
    queryFn: api.analytics,
    enabled: Boolean(token),
  });
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const data = analytics.data;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: topInset + 18, paddingBottom: bottomInset + 95 }}>
        <View style={styles.headingRow}>
          <View>
            <Text style={[styles.kicker, { color: colors.primary }]}>PERFORMANCE / 04</Text>
            <Text style={[styles.heading, { color: colors.foreground }]}>Analytics</Text>
          </View>
          <Feather name="pie-chart" size={24} color={colors.primary} />
        </View>
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>Your accepted ride performance from connected platforms.</Text>
        {analytics.isLoading ? <StateMessage icon="loader" title="Loading analytics" text="Fetching your latest ride performance." colors={colors} /> : null}
        {analytics.isError ? <StateMessage icon="alert-circle" title="Analytics unavailable" text="We could not load your performance data. Try again shortly." colors={colors} /> : null}
        {data ? (
          <>
            <View style={styles.statsGrid}>
              <StatCard label="TOTAL EARNINGS" value={formatNgn(data.totalEarnings, currency)} colors={colors} />
              <StatCard label="TOTAL TRIPS" value={String(data.totalTrips)} colors={colors} />
            </View>
            <View style={[styles.averageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>AVERAGE FARE</Text>
              <Text style={[styles.averageValue, { color: colors.primary }]}>{formatNgn(data.averageFare, currency)}</Text>
            </View>
            {data.totalTrips === 0 ? <StateMessage icon="activity" title="No analytics yet" text="Accept a ride to start building your performance history." colors={colors} /> : (
              <View style={styles.platformSection}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>By platform</Text>
                {Object.entries(data.byPlatform).map(([platform, summary]) => (
                  <View key={platform} style={[styles.platformRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.platformName, { color: colors.foreground }]}>{platform}</Text>
                    <Text style={[styles.platformValue, { color: colors.mutedForeground }]}>{summary.trips} trips · {formatNgn(summary.earnings, currency)}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

function StateMessage({ icon, title, text, colors }: { icon: keyof typeof Feather.glyphMap; title: string; text: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon} size={23} color={colors.primary} />
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headingRow: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  kicker: { fontSize: 10, letterSpacing: 1.7, fontWeight: '800', marginBottom: 6 },
  heading: { fontSize: 28, fontWeight: '800', letterSpacing: -0.9 },
  intro: { paddingHorizontal: 20, fontSize: 13, marginTop: 9, marginBottom: 20 },
  statsGrid: { flexDirection: 'row', gap: 11, paddingHorizontal: 20, marginBottom: 11 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 17, padding: 14 },
  statLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  statValue: { fontSize: 21, fontWeight: '800', marginTop: 8 },
  averageCard: { marginHorizontal: 20, borderWidth: 1, borderRadius: 17, padding: 14, marginBottom: 24 },
  averageValue: { fontSize: 25, fontWeight: '800', marginTop: 8 },
  empty: { marginHorizontal: 20, borderWidth: 1, borderRadius: 18, padding: 24, alignItems: 'center' },
  emptyTitle: { marginTop: 10, fontSize: 15, fontWeight: '800' },
  emptyText: { textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: 5 },
  platformSection: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 19, fontWeight: '800', marginBottom: 12 },
  platformRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, paddingVertical: 14 },
  platformName: { fontSize: 14, fontWeight: '700' },
  platformValue: { fontSize: 12 },
});
