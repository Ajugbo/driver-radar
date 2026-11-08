import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { RideCard } from '@/components/RadarUI';
import { useDriver } from '@/context/DriverContext';
import { useColors } from '@/hooks/useColors';

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { rides, acceptRide, declineRide } = useDriver();
  const completed = rides.filter((ride) => ride.status !== 'pending');
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
        </View>
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>A quick read on your connected-platform performance.</Text>
        <View style={styles.historyHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent activity</Text><Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>{completed.length} logged</Text></View>
        {completed.length ? completed.map((ride) => <RideCard key={ride.id} ride={ride} onAccept={() => acceptRide(ride.id)} onDecline={() => declineRide(ride.id)} />) : (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="activity" size={23} color={colors.primary} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>No ride history available</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Completed rides will appear when the connected API provides history.</Text></View>
        )}
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
  historyHeader: { paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 19, fontWeight: '800' },
  sectionCount: { fontSize: 11 },
  empty: { marginHorizontal: 20, borderWidth: 1, borderRadius: 18, padding: 24, alignItems: 'center' },
  emptyTitle: { marginTop: 10, fontSize: 15, fontWeight: '800' },
  emptyText: { textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: 5 },
});