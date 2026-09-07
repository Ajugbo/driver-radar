import React, { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ride } from '@/context/DriverContext';
import { useColors } from '@/hooks/useColors';
import { Hologram } from './Hologram';
import { ScanlineOverlay } from './ScanlineOverlay';
import cyberpunkColors from './colors';

interface DriverViewProps {
  children: ReactNode;
  isLive: boolean;
  isLoading: boolean;
  error: string | null;
  newRide?: Ride;
  onToggle: () => void;
}

export function DriverView({ children, isLive, isLoading, error, newRide, onToggle }: DriverViewProps) {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScanlineOverlay />
      <View style={[styles.statusBar, { borderColor: isLive ? cyberpunkColors.cyan : colors.border, backgroundColor: colors.card }]}>
        <View style={styles.statusCopy}>
          <View style={[styles.statusDot, { backgroundColor: isLive ? cyberpunkColors.green : cyberpunkColors.red }]} />
          <Text style={[styles.statusText, { color: colors.foreground }]}>{isLive ? 'LIVE FEED CONNECTED' : 'FEED PAUSED'}</Text>
          {isLoading ? <ActivityIndicator size="small" color={cyberpunkColors.cyan} /> : null}
        </View>
        <Pressable accessibilityRole="button" onPress={onToggle} style={[styles.toggle, { borderColor: isLive ? cyberpunkColors.cyan : colors.border }]}>
          <Ionicons name={isLive ? 'pause' : 'play'} size={13} color={isLive ? cyberpunkColors.cyan : colors.mutedForeground} />
        </Pressable>
      </View>
      {error ? <Text style={[styles.error, { color: cyberpunkColors.red }]}>[LINK ERROR] {error}</Text> : null}
      <Hologram ride={newRide} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusBar: { marginHorizontal: 20, marginTop: 10, minHeight: 42, paddingHorizontal: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: cyberpunkColors.cyan, shadowOpacity: 0.45, shadowRadius: 9, elevation: 4 },
  statusCopy: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontFamily: 'monospace', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  toggle: { width: 27, height: 27, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  error: { marginHorizontal: 21, marginTop: 7, fontFamily: 'monospace', fontSize: 9, fontWeight: '700' },
});
