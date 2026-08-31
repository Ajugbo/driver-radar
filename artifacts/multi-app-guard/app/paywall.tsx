import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { NeonButton } from '@/components/NeonButton';

const benefits = [
  { icon: 'layers' as const, title: 'Unlimited device slots', body: 'Monitor your entire device network.' },
  { icon: 'activity' as const, title: '30-day telemetry history', body: 'Review every sweep and handshake.' },
  { icon: 'zap' as const, title: 'Real-time guardian updates', body: 'Get the signal as it changes.' },
];

export default function PaywallScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { upgradeToPro } = useApp();

  const activate = () => {
    upgradeToPro();
    Alert.alert('Neural Capacity unlocked', 'Your Pro features are now active in this preview.');
    router.back();
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: insets.bottom + 24, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" testID="close-paywall" style={styles.close}>
        <Feather name="x" size={22} color={colors.mutedForeground} />
      </Pressable>
      <View style={styles.hero}>
        <View style={[styles.icon, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
          <Feather name="zap" size={28} color={colors.primary} />
        </View>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>NEURAL CAPACITY</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Go beyond{'\n'}the single node.</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Pro turns your guardian from a local watchtower into a full network command layer.</Text>
      </View>
      <View style={[styles.benefits, { borderColor: colors.border, backgroundColor: colors.card }]}>
        {benefits.map((benefit) => (
          <View key={benefit.title} style={styles.benefit}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.deep }]}>
              <Feather name={benefit.icon} size={17} color={colors.primary} />
            </View>
            <View style={styles.benefitCopy}>
              <Text style={[styles.benefitTitle, { color: colors.foreground }]}>{benefit.title}</Text>
              <Text style={[styles.benefitBody, { color: colors.mutedForeground }]}>{benefit.body}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={[styles.priceCard, { borderColor: colors.primary, backgroundColor: colors.deep }]}>
        <View>
          <Text style={[styles.priceLabel, { color: colors.primary }]}>PRO ACCESS</Text>
          <Text style={[styles.price, { color: colors.foreground }]}>$4.99<Text style={[styles.period, { color: colors.mutedForeground }]}> / month</Text></Text>
        </View>
        <Text style={[styles.annual, { color: colors.success }]}>or $49.99 / year</Text>
      </View>
      <NeonButton label="Unlock neural capacity" icon="unlock" onPress={activate} testID="activate-pro" />
      <Text style={[styles.footnote, { color: colors.mutedForeground }]}>Includes a 7-day trial. Cancel anytime. Purchases are handled securely by RevenueCat when billing is connected.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  close: { alignSelf: 'flex-end', padding: 8, marginRight: -8 },
  hero: { paddingTop: 18, gap: 12, marginBottom: 24 },
  icon: { width: 64, height: 64, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2.2 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 34, letterSpacing: -1.3, lineHeight: 38 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20 },
  benefits: { borderWidth: 1, borderRadius: 15, paddingVertical: 3, marginBottom: 15 },
  benefit: { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 13 },
  benefitIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  benefitCopy: { flex: 1, gap: 4 },
  benefitTitle: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  benefitBody: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  priceCard: { borderWidth: 1, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 15 },
  priceLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.3, marginBottom: 6 },
  price: { fontFamily: 'Inter_700Bold', fontSize: 25 },
  period: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  annual: { fontFamily: 'Inter_700Bold', fontSize: 10, marginBottom: 3 },
  footnote: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 12 },
});