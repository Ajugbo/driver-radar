import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Ride, formatNgn, useDriver } from '@/context/DriverContext';
import cyberpunkColors from './colors';

export function Hologram({ ride }: { ride?: Ride }) {
  const opacity = useSharedValue(0.72);
  const { currency } = useDriver();
  useEffect(() => {
    opacity.value = withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0.72, { duration: 900 })), -1, true);
  }, [opacity]);
  const glowStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!ride) return null;
  return (
    <Animated.View style={[styles.card, glowStyle]}>
      <View style={styles.header}>
        <Text style={styles.kicker}>NEW SIGNAL / {ride.platform.toUpperCase()}</Text>
        <Text style={styles.fare}>{formatNgn(ride.fare, currency)}</Text>
      </View>
      <Text style={styles.route}>{ride.pickup} {'>'} {ride.dropoff}</Text>
      <Text style={styles.meta}>{ride.distance.toFixed(1)} KM AWAY  •  ETA {ride.eta}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, marginBottom: 14, padding: 13, borderWidth: 1, borderColor: cyberpunkColors.hotPink, backgroundColor: cyberpunkColors.card, shadowColor: cyberpunkColors.hotPink, shadowOpacity: 0.8, shadowRadius: 12, elevation: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { color: cyberpunkColors.hotPink, fontFamily: 'monospace', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  fare: { color: cyberpunkColors.cyan, fontFamily: 'monospace', fontSize: 15, fontWeight: '900' },
  route: { color: cyberpunkColors.foreground, fontFamily: 'monospace', fontSize: 13, fontWeight: '700', marginTop: 9 },
  meta: { color: cyberpunkColors.muted, fontFamily: 'monospace', fontSize: 9, fontWeight: '700', letterSpacing: 0.8, marginTop: 6 },
});
