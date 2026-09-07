import React from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScanlineOverlay } from '@/src/components/ScanlineOverlay';
import { NeonButton } from '@/src/components/NeonButton';
import cyberpunkColors from '@/src/components/colors';

export default function LandingPage() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 }]}>
      <ScanlineOverlay />
      <View style={styles.topline}><Text style={styles.system}>SYSTEM ONLINE</Text><View style={styles.onlineDot} /></View>
      <View style={styles.hero}>
        <Text style={styles.kicker}>DRIVER NETWORK / 001</Text>
        <Text style={styles.title}>DRIVER{ '\n' }RADAR</Text>
        <Text style={styles.copy}>A unified signal layer for every ride request in your radius.</Text>
      </View>
      <View style={styles.radar}>
        <View style={styles.sweep} />
        <View style={[styles.ring, styles.ringLarge]} />
        <View style={[styles.ring, styles.ringMedium]} />
        <View style={[styles.ring, styles.ringSmall]} />
        <View style={[styles.ping, styles.pingOne]} /><View style={[styles.ping, styles.pingTwo]} /><View style={[styles.ping, styles.pingThree]} />
        <View style={styles.center}><Ionicons name="navigate" size={22} color={cyberpunkColors.background} /></View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.prompt}>[ READY FOR DRIVER INPUT ]</Text>
        <NeonButton label="Enter driver mode" icon="arrow-right" onPress={() => router.replace('/(tabs)')} />
        <Pressable onPress={() => router.push('/auth')}><Text style={styles.login}>AUTHENTICATE OPERATOR</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: cyberpunkColors.background, paddingHorizontal: 24, justifyContent: 'space-between' },
  topline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  system: { color: cyberpunkColors.green, fontFamily: 'monospace', fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: cyberpunkColors.green, shadowColor: cyberpunkColors.green, shadowOpacity: 1, shadowRadius: 10 },
  hero: { marginTop: 30 },
  kicker: { color: cyberpunkColors.hotPink, fontFamily: 'monospace', fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  title: { color: cyberpunkColors.foreground, fontFamily: 'monospace', fontSize: 40, fontWeight: '900', letterSpacing: 2, lineHeight: 46, marginTop: 12 },
  copy: { color: cyberpunkColors.muted, fontFamily: 'monospace', fontSize: 12, lineHeight: 19, marginTop: 14, maxWidth: 280 },
  radar: { alignSelf: 'center', width: 250, height: 250, borderRadius: 125, borderWidth: 1, borderColor: cyberpunkColors.cyan, alignItems: 'center', justifyContent: 'center', shadowColor: cyberpunkColors.cyan, shadowOpacity: 0.6, shadowRadius: 25, elevation: 10, overflow: 'hidden' },
  sweep: { position: 'absolute', width: 250, height: 1, backgroundColor: cyberpunkColors.cyan, transform: [{ rotate: '-35deg' }], opacity: 0.8 },
  ring: { position: 'absolute', borderWidth: 1, borderColor: cyberpunkColors.line, borderRadius: 999 },
  ringLarge: { width: 210, height: 210 }, ringMedium: { width: 140, height: 140 }, ringSmall: { width: 70, height: 70 },
  ping: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: cyberpunkColors.hotPink, shadowColor: cyberpunkColors.hotPink, shadowOpacity: 1, shadowRadius: 8 },
  pingOne: { top: 67, left: 154 }, pingTwo: { top: 153, left: 76, backgroundColor: cyberpunkColors.amber }, pingThree: { top: 107, left: 190 },
  center: { width: 42, height: 42, borderRadius: 21, backgroundColor: cyberpunkColors.cyan, alignItems: 'center', justifyContent: 'center', shadowColor: cyberpunkColors.cyan, shadowOpacity: 1, shadowRadius: 16 },
  footer: { gap: 15 },
  prompt: { color: cyberpunkColors.muted, fontFamily: 'monospace', fontSize: 9, letterSpacing: 1, textAlign: 'center' },
  login: { color: cyberpunkColors.cyan, fontFamily: 'monospace', fontSize: 10, fontWeight: '800', letterSpacing: 1, textAlign: 'center' },
});
