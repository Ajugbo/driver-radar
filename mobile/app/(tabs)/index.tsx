import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { FilterSummary, RadarMap, RideCard, SectionLabel } from '@/components/RadarUI';
import { DriverView } from '@/src/components/DriverView';
import { useDriver } from '@/context/DriverContext';
import { useColors } from '@/hooks/useColors';

export default function RadarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { visibleRides, filters, availablePlatforms, isListenerLive, isFeedLoading, listenerError, toggleListener, acceptRide, declineRide, lastSync, driver } = useDriver();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const pendingCount = visibleRides.length;

  return (
    <DriverView isLive={isListenerLive} isLoading={isFeedLoading} error={listenerError} newRide={visibleRides[0]} onToggle={toggleListener}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: topInset + 14, paddingBottom: bottomInset + 100 }}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.kicker, { color: colors.primary }]}>DRIVER RADAR / 01</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Good morning, driver.</Text>
          </View>
          <Pressable testID="profile-button" onPress={() => router.push('/auth')} style={[styles.avatar, { borderColor: colors.primary, backgroundColor: colors.accent }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{driver.email.slice(0, 1).toUpperCase() || 'D'}</Text>
          </Pressable>
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
          <SectionLabel eyebrow="AVAILABLE SOURCES" title="Platform network" action={`${availablePlatforms.length} platforms`} />
          <View style={styles.platformList}>
            {availablePlatforms.map((platform) => (
              <View key={platform.id} style={[styles.platformChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.platformChipName, { color: colors.foreground }]}>{platform.name}</Text>
                <Text style={[styles.platformChipType, { color: colors.mutedForeground }]}>{platform.type === 'api' ? 'API' : 'NOTIFICATIONS'}</Text>
              </View>
            ))}
          </View>
          <SectionLabel eyebrow="UNIFIED STREAM" title="Incoming requests" action={`${new Set(visibleRides.map((ride) => ride.platform)).size} sources`} />
          {visibleRides.length ? visibleRides.map((ride) => <RideCard key={ride.id} ride={ride} onAccept={() => acceptRide(ride.id)} onDecline={() => declineRide(ride.id)} />) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="radio" size={22} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Radar is clear</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No ride matches your active filters. New pings will appear here automatically.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </DriverView>
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
  content: { paddingHorizontal: 20 },
  platformList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 19 },
  platformChip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 11, paddingVertical: 8 },
  platformChipName: { fontSize: 11, fontWeight: '800' },
  platformChipType: { fontSize: 8, letterSpacing: 0.6, marginTop: 3 },
  radarMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2, marginTop: 11, marginBottom: 19 },
  countWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pulseDot: { width: 7, height: 7, borderRadius: 4 },
  countText: { fontSize: 12, fontWeight: '700' },
  radiusText: { fontSize: 11 },
  emptyCard: { borderWidth: 1, borderRadius: 18, padding: 24, alignItems: 'center', marginBottom: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '800', marginTop: 10 },
  emptyText: { fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 6, maxWidth: 270 },
});
