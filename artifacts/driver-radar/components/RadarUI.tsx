import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { DimensionValue, Pressable, StyleSheet, Text, View } from 'react-native';
import { Filters, formatNgn, PlatformName, Ride } from '@/context/DriverContext';
import { useColors } from '@/hooks/useColors';
import React, { useEffect } from 'react';

function platformColor(platform: PlatformName, colors: ReturnType<typeof useColors>) {
  if (platform === 'Uber') return colors.foreground;
  if (platform === 'Bolt') return colors.primary;
  return colors.warning;
}

export function SectionLabel({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: string }) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeader}>
      <View>
        {eyebrow ? <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text> : null}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      </View>
      {action ? <Text style={[styles.sectionAction, { color: colors.mutedForeground }]}>{action}</Text> : null}
    </View>
  );
}

function RadarPing({ top, left, color, delay }: { top: DimensionValue; left: DimensionValue; color: string; delay: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);
  useEffect(() => {
    const timeout = setTimeout(() => {
      scale.value = withRepeat(withSequence(withTiming(2.6, { duration: 1200 }), withTiming(1, { duration: 0 })), -1);
      opacity.value = withRepeat(withSequence(withTiming(0, { duration: 1200 }), withTiming(0.8, { duration: 0 })), -1);
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay, opacity, scale]);
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));
  return (
    <View style={[styles.ping, { top, left }]}>
      <Animated.View style={[styles.pingRing, { borderColor: color }, ringStyle]} />
      <View style={[styles.pingDot, { backgroundColor: color }]} />
    </View>
  );
}

export function RadarMap({ rides }: { rides: Ride[] }) {
  const colors = useColors();
  const pings = rides.slice(0, 5);
  return (
    <View style={[styles.radarMap, { backgroundColor: colors.card, borderColor: colors.line }]}>
      <View style={[styles.radarSweep, { borderColor: colors.primary }]} />
      <View style={[styles.radarRing, styles.radarRingLarge, { borderColor: colors.line }]} />
      <View style={[styles.radarRing, styles.radarRingMedium, { borderColor: colors.line }]} />
      <View style={[styles.radarRing, styles.radarRingSmall, { borderColor: colors.line }]} />
      <View style={[styles.crosshairHorizontal, { backgroundColor: colors.line }]} />
      <View style={[styles.crosshairVertical, { backgroundColor: colors.line }]} />
      {pings.map((ride, index) => (
        <RadarPing
          key={ride.id}
          top={`${22 + (index * 17) % 55}%` as DimensionValue}
          left={`${17 + (index * 21) % 68}%` as DimensionValue}
          color={platformColor(ride.platform, colors)}
          delay={index * 180}
        />
      ))}
      <View style={[styles.driverMarker, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
        <Ionicons name="navigate" size={15} color={colors.primaryForeground} />
      </View>
      <View style={[styles.mapLabel, { backgroundColor: colors.background }]}>
        <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
        <Text style={[styles.mapLabelText, { color: colors.foreground }]}>ABUJA • LIVE</Text>
      </View>
      <Text style={[styles.mapScale, { color: colors.mutedForeground }]}>2 KM RADIUS</Text>
    </View>
  );
}

export function RideCard({ ride, onAccept, onDecline }: { ride: Ride; onAccept: () => void; onDecline: () => void }) {
  const colors = useColors();
  const sourceColor = platformColor(ride.platform, colors);
  return (
    <View style={[styles.rideCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.rideTop}>
        <View style={styles.sourceRow}>
          <View style={[styles.sourceMark, { backgroundColor: sourceColor }]}>
            <MaterialCommunityIcons name="car-side" size={14} color={colors.primaryForeground} />
          </View>
          <View>
            <Text style={[styles.platformName, { color: colors.foreground }]}>{ride.platform}</Text>
            <Text style={[styles.rideMeta, { color: colors.mutedForeground }]}>{ride.timestamp}  •  {ride.eta} away</Text>
          </View>
        </View>
        <Text style={[styles.fare, { color: colors.primary }]}>{formatNgn(ride.fare)}</Text>
      </View>
      <View style={styles.routeRow}>
        <View style={styles.routeRail}>
          <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.routeLine, { backgroundColor: colors.line }]} />
          <View style={[styles.routeDot, { backgroundColor: colors.mutedForeground }]} />
        </View>
        <View style={styles.routeText}>
          <Text style={[styles.routeLabel, { color: colors.foreground }]}>{ride.pickup}</Text>
          <Text style={[styles.routeSub, { color: colors.mutedForeground }]}>Pickup • {ride.distance.toFixed(1)} km away</Text>
          <Text style={[styles.routeLabel, { color: colors.foreground, marginTop: 9 }]}>{ride.dropoff}</Text>
        </View>
        <View style={styles.rating}>
          <Ionicons name="star" size={13} color={colors.warning} />
          <Text style={[styles.ratingText, { color: colors.foreground }]}>{ride.rating.toFixed(2)}</Text>
        </View>
      </View>
      {ride.status === 'pending' ? (
        <View style={styles.actionRow}>
          <Pressable testID={`decline-${ride.id}`} onPress={onDecline} style={({ pressed }) => [styles.declineButton, { borderColor: colors.border, opacity: pressed ? 0.72 : 1 }]}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
            <Text style={[styles.declineText, { color: colors.mutedForeground }]}>Skip</Text>
          </Pressable>
          <Pressable testID={`accept-${ride.id}`} onPress={onAccept} style={({ pressed }) => [styles.acceptButton, { backgroundColor: colors.primary, opacity: pressed ? 0.72 : 1 }]}>
            <Feather name="check" size={16} color={colors.primaryForeground} />
            <Text style={[styles.acceptText, { color: colors.primaryForeground }]}>Accept ride</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.statusStrip, { backgroundColor: ride.status === 'accepted' ? colors.accent : colors.muted }]}>
          <Text style={[styles.statusText, { color: ride.status === 'accepted' ? colors.success : colors.mutedForeground }]}>
            {ride.status === 'accepted' ? 'ACCEPTED' : 'DECLINED'} • {ride.platform} listener
          </Text>
        </View>
      )}
    </View>
  );
}

export function FilterSummary({ filters }: { filters: Filters }) {
  const colors = useColors();
  return (
    <View style={styles.filterSummary}>
      <View style={[styles.filterIcon, { backgroundColor: colors.accent }]}>
        <Feather name="sliders" size={15} color={colors.primary} />
      </View>
      <View style={styles.filterCopy}>
        <Text style={[styles.filterSummaryTitle, { color: colors.foreground }]}>Smart filters active</Text>
        <Text style={[styles.filterSummaryText, { color: colors.mutedForeground }]}>
          {formatNgn(filters.minFare)} min  •  {filters.maxRadius.toFixed(1)} km max pickup
        </Text>
      </View>
      <View style={[styles.filterCount, { borderColor: colors.primary }]}>
        <Text style={[styles.filterCountText, { color: colors.primary }]}>4</Text>
      </View>
    </View>
  );
}

export function SliderRail({ value, min, max, step, color, onChange }: { value: number; min: number; max: number; step: number; color: string; onChange: (value: number) => void }) {
  const colors = useColors();
  const percentage = `${Math.max(4, Math.min(96, ((value - min) / (max - min)) * 100))}%` as DimensionValue;
  return (
    <Pressable testID="slider-rail" onPress={() => onChange(value + step > max ? min : value + step)} style={styles.sliderWrap}>
      <View style={[styles.sliderTrack, { backgroundColor: colors.input }]}>
        <View style={[styles.sliderFill, { width: percentage, backgroundColor: color }]} />
        <View style={[styles.sliderThumb, { left: percentage, backgroundColor: color, shadowColor: color }]} />
      </View>
      <View style={styles.sliderLabels}>
        <Text style={[styles.sliderLabel, { color: colors.mutedForeground }]}>{min}</Text>
        <Text style={[styles.sliderLabel, { color: colors.mutedForeground }]}>{max}</Text>
      </View>
    </Pressable>
  );
}

export function ProBadge() {
  const colors = useColors();
  return (
    <View style={[styles.proBadge, { backgroundColor: colors.accent }]}>
      <Ionicons name="flash" size={12} color={colors.primary} />
      <Text style={[styles.proBadgeText, { color: colors.primary }]}>PRO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.8, marginBottom: 5 },
  sectionTitle: { fontSize: 21, fontWeight: '700', letterSpacing: -0.4 },
  sectionAction: { fontSize: 12, fontWeight: '600', paddingBottom: 2 },
  radarMap: { height: 286, borderRadius: 24, borderWidth: 1, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  radarSweep: { position: 'absolute', width: 260, height: 260, borderWidth: 1, borderRadius: 130, borderRightColor: 'transparent', borderBottomColor: 'transparent', transform: [{ rotate: '28deg' }], opacity: 0.45 },
  radarRing: { position: 'absolute', borderWidth: 1, borderRadius: 999 },
  radarRingLarge: { width: 250, height: 250 },
  radarRingMedium: { width: 170, height: 170 },
  radarRingSmall: { width: 88, height: 88 },
  crosshairHorizontal: { position: 'absolute', height: 1, width: '100%', opacity: 0.6 },
  crosshairVertical: { position: 'absolute', width: 1, height: '100%', opacity: 0.6 },
  ping: { position: 'absolute', width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  pingRing: { position: 'absolute', width: 15, height: 15, borderRadius: 12, borderWidth: 1 },
  pingDot: { width: 7, height: 7, borderRadius: 6 },
  driverMarker: { width: 30, height: 30, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
  mapLabel: { position: 'absolute', top: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 4 },
  mapLabelText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  mapScale: { position: 'absolute', bottom: 15, right: 16, fontSize: 9, letterSpacing: 1.2, fontWeight: '700' },
  rideCard: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 12 },
  rideTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sourceMark: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  platformName: { fontSize: 14, fontWeight: '700' },
  rideMeta: { fontSize: 11, marginTop: 3 },
  fare: { fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  routeRow: { flexDirection: 'row', marginTop: 18, minHeight: 74 },
  routeRail: { width: 18, alignItems: 'center', paddingTop: 4 },
  routeDot: { width: 7, height: 7, borderRadius: 5 },
  routeLine: { width: 1, height: 28, marginVertical: 3 },
  routeText: { flex: 1 },
  routeLabel: { fontSize: 13, fontWeight: '600' },
  routeSub: { fontSize: 11, marginTop: 3 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 1 },
  ratingText: { fontSize: 11, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 9, marginTop: 15 },
  declineButton: { height: 43, flex: 0.38, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  acceptButton: { height: 43, flex: 0.62, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  declineText: { fontSize: 12, fontWeight: '700' },
  acceptText: { fontSize: 12, fontWeight: '800' },
  statusStrip: { borderRadius: 10, paddingVertical: 9, paddingHorizontal: 11, marginTop: 10 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  filterSummary: { flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 16, borderWidth: 1, marginBottom: 18 },
  filterIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  filterCopy: { flex: 1, marginLeft: 11 },
  filterSummaryTitle: { fontSize: 12, fontWeight: '700' },
  filterSummaryText: { fontSize: 11, marginTop: 3 },
  filterCount: { width: 27, height: 27, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  filterCountText: { fontSize: 12, fontWeight: '800' },
  sliderWrap: { marginTop: 14 },
  sliderTrack: { height: 5, borderRadius: 4, position: 'relative', justifyContent: 'center' },
  sliderFill: { height: 5, borderRadius: 4 },
  sliderThumb: { position: 'absolute', width: 17, height: 17, borderRadius: 10, marginLeft: -8, shadowOpacity: 0.5, shadowRadius: 8, elevation: 5 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 },
  sliderLabel: { fontSize: 10 },
  proBadge: { borderRadius: 7, paddingHorizontal: 7, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  proBadgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
});