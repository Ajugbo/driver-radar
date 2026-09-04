import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { FilterSummary, RadarMap, RideCard, SectionLabel } from '@/components/RadarUI';
import { useDriver, formatNgn } from '@/context/DriverContext';
import { useColors } from '@/hooks/useColors';

export default function RadarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { visibleRides, filters, rides, isListenerLive, toggleListener, acceptRide, declineRide, lastSync, driver } = useDriver();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const pendingCount = visibleRides.length;
  const todayAccepted = rides.filter((ride) => ride.status === 'accepted');
  const todayTotal = todayAccepted.reduce((total, ride) => total + ride.fare, 0);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: topInset + 14, paddingBottom: bottomInset + 100 }}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.kicker, { color: colors.primary }]}>DRIVER RADAR / 01</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Good morning, driver.</Text>
          </View>
          <Pressable testID="profile-button" onPress={() => router.push('/auth')} style={[styles.avatar, { borderColor: colors.primary, backgroundColor: colors.accent }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{driver.email.slice(0, 1).toUpperCase()}</Text>
          </Pressable>
        </View>

        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statusLeft}>
            <View style={[styles.liveOrb, { backgroundColor: isListenerLive ? colors.success : colors.mutedForeground }]}>
              <View style={[styles.liveOrbInner, { backgroundColor: colors.card }]} />
            </View>
            <View>
              <Text style={[styles.statusLabel, { color: colors.foreground }]}>{isListenerLive ? 'LISTENER ONLINE' : 'LISTENER PAUSED'}</Text>
              <Text style={[styles.statusSub, { color: colors.mutedForeground }]}>{isListenerLive ? 'Watching 3 platform sources' : 'Tap resume to scan again'}</Text>
            </View>
          </View>
          <Pressable testID="listener-toggle" onPress={toggleListener} style={({ pressed }) => [styles.toggle, { borderColor: isListenerLive ? colors.success : colors.border, opacity: pressed ? 0.65 : 1 }]}>
            <Ionicons name={isListenerLive ? 'pause' : 'play'} size={14} color={isListenerLive ? colors.success : colors.mutedForeground} />
          </Pressable>
        </View>

        <View style={[styles.earningsCard, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={[styles.earningsEyebrow, { color: colors.primaryForeground }]}>TODAY'S ACCEPTED FARES</Text>
            <Text style={[styles.earningsValue, { color: colors.primaryForeground }]}>{formatNgn(todayTotal || 12400)}</Text>
          </View>
          <View style={[styles.earningsBadge, { backgroundColor: colors.primaryForeground }]}>
            <Feather name="trending-up" size={13} color={colors.primary} />
            <Text style={[styles.earningsBadgeText, { color: colors.primary }]}>+18%</Text>
          </View>
        </View>

        <View style={styles.content}>
          <SectionLabel eyebrow="LIVE MAP" title="Request radar" action={`${lastSync}`} />
          <RadarMap rides={visibleRides} />

          <View style={styles.radarMeta}>
            <View style={styles.countWrap}>
              <View style={[styles.pulseDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.countText, { color: colors.foreground }]}>{pendingCount} nearby {pendingCount === 1 ? 'request' : 'requests'}</Text>
            </View>
            <Text style={[styles.radiusText, { color: colors.mutedForeground }]}>Within {filters.maxRadius.toFixed(1)} km</Text>
          </View>

          <FilterSummary filters={filters} />
          <SectionLabel eyebrow="UNIFIED STREAM" title="Incoming requests" action="3 sources" />
          {visibleRides.length ? visibleRides.map((ride) => <RideCard key={ride.id} ride={ride} onAccept={() => acceptRide(ride.id)} onDecline={() => declineRide(ride.id)} />) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="radio" size={22} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Radar is clear</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No ride matches your active filters. New pings will appear here automatically.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  kicker: { fontSize: 10, letterSpacing: 1.7, fontWeight: '800', marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.7 },
  avatar: { width: 42, height: 42, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '800' },
  statusCard: { marginHorizontal: 20, borderRadius: 17, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  liveOrb: { width: 30, height: 30, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  liveOrbInner: { width: 12, height: 12, borderRadius: 7 },
  statusLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  statusSub: { fontSize: 11, marginTop: 3 },
  toggle: { height: 32, width: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  earningsCard: { marginHorizontal: 20, borderRadius: 20, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  earningsEyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 1.2, opacity: 0.72 },
  earningsValue: { fontSize: 29, fontWeight: '800', marginTop: 4, letterSpacing: -1 },
  earningsBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  earningsBadgeText: { fontSize: 11, fontWeight: '800' },
  content: { paddingHorizontal: 20 },
  radarMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2, marginTop: 11, marginBottom: 19 },
  countWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pulseDot: { width: 7, height: 7, borderRadius: 4 },
  countText: { fontSize: 12, fontWeight: '700' },
  radiusText: { fontSize: 11 },
  emptyCard: { borderWidth: 1, borderRadius: 18, padding: 24, alignItems: 'center', marginBottom: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '800', marginTop: 10 },
  emptyText: { fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 6, maxWidth: 270 },
});