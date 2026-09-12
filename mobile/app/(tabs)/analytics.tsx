import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDriver } from '@/context/DriverContext';
import { useColors } from '@/hooks/useColors';
import { router } from 'expo-router';

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { driver, isPro } = useDriver();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  useEffect(() => {
    if (isPro) {
      fetchAnalytics();
    }
  }, [isPro]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://driver-radar.vercel.app/api/analytics', {
        headers: { 'Authorization': `Bearer ${driver.token || ''}` }
      });
      const data = await res.json();
      setAnalytics(data);
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isPro) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.lockedContainer, { backgroundColor: colors.card }]}>
          <View style={[styles.lockIcon, { backgroundColor: colors.accent }]}>
            <Feather name="lock" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.lockedTitle, { color: colors.foreground }]}>Pro Analytics</Text>
          <Text style={[styles.lockedText, { color: colors.mutedForeground }]}>
            Upgrade to Radar Pro to unlock deep insights into your earnings, acceptance rates, and performance trends.
          </Text>
          <View style={[styles.blurPreview, { backgroundColor: colors.background }]}>
            <View style={[styles.fakeCard, { backgroundColor: colors.card }]} />
            <View style={[styles.fakeCard, { backgroundColor: colors.card }]} />
          </View>
          <View style={styles.ctaWrap}>
            <Text style={[styles.ctaText, { color: colors.mutedForeground }]}>Available with Pro membership</Text>
          </View>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: topInset + 18, paddingBottom: bottomInset + 30 }}>
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: colors.primary }]}>ANALYTICS / 05</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Performance Dashboard</Text>
      </View>

      {/* Earnings Overview */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Total Earnings</Text>
        <Text style={[styles.bigNumber, { color: colors.primary }]}>{driver.currency || '₦'}{analytics?.totalEarnings?.toLocaleString() || 0}</Text>
        <Text style={[styles.subText, { color: colors.mutedForeground }]}>This week</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="check-circle" size={20} color={colors.primary} />
          <Text style={[styles.statNumber, { color: colors.foreground }]}>{analytics?.totalTrips || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Trips</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="trending-up" size={20} color={colors.success} />
          <Text style={[styles.statNumber, { color: colors.foreground }]}>{analytics?.acceptanceRate || 0}%</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Acceptance Rate</Text>
        </View>
      </View>

      {/* Daily Chart Placeholder */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Daily Earnings (Last 7 Days)</Text>
        <View style={styles.chartPlaceholder}>
          {analytics?.dailyEarnings?.map((day: any, i: number) => (
            <View key={i} style={styles.barContainer}>
              <View style={[styles.bar, { height: `${(day.amount / (analytics.maxDaily || 1)) * 100}%`, backgroundColor: colors.primary }]} />
              <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{day.day}</Text>
            </View>
          )) || <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No data available yet</Text>}
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
  lockedContainer: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  lockIcon: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  lockedTitle: { fontSize: 22, fontWeight: '800', marginBottom: 10 },
  lockedText: { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 25 },
  blurPreview: { width: '100%', height: 100, borderRadius: 12, opacity: 0.3, marginBottom: 20 },
  fakeCard: { height: 45, borderRadius: 8, marginVertical: 5, width: '100%' },
  ctaWrap: { alignItems: 'center' },
  ctaText: { fontSize: 11, fontWeight: '600' },
  loadingText: { fontSize: 14 },
  emptyText: { fontSize: 12 },
});
