import { Feather, Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { countryCodeForCurrency, formatCurrency } from '@/lib/currency-detector';
import { useDriver } from '@/context/DriverContext';
import { useColors } from '@/hooks/useColors';

const benefits = ['Unlimited platform listeners', 'Priority ping animations', 'Advanced rating and zone filters', 'Weekly earnings analytics'];

export default function PaywallScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const { currency, token } = useDriver();
  const [subscription, setSubscription] = useState<{ tier: 'free' | 'trial' | 'pro'; allowed: boolean; daysRemaining: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) void api.subscription().then((response) => setSubscription(response.subscription)).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load subscription status.'));
  }, [token]);

  const subscribe = async () => {
    setBusy(true);
    setError('');
    try {
      const response = await api.checkout(countryCodeForCurrency(currency), currency);
      await Linking.openURL(response.checkout.checkoutUrl);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to start checkout.');
    } finally {
      setBusy(false);
    }
  };
  const statusCopy = subscription?.tier === 'trial' && subscription.allowed
    ? `🎁 3-DAY FREE TRIAL ACTIVE • ${subscription.daysRemaining} days remaining`
    : subscription?.tier === 'pro' && subscription.allowed
      ? `✅ PRO: ${subscription.daysRemaining} days remaining`
      : subscription?.tier === 'pro' ? 'Subscription Expired' : 'Start Free Trial';
  const actionCopy = subscription?.tier === 'pro' && subscription.allowed ? 'Renew subscription' : subscription?.tier === 'trial' && subscription.allowed ? 'View billing' : subscription?.tier === 'pro' ? 'Subscribe again' : 'Start free trial';
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingTop: topInset + 16, paddingBottom: bottomInset + 30 }}>
        <Pressable testID="close-paywall" onPress={() => router.back()} style={styles.close}><Feather name="x" size={20} color={colors.mutedForeground} /></Pressable>
        <View style={styles.hero}><View style={[styles.logo, { backgroundColor: colors.primary }]}><Ionicons name="flash" size={25} color={colors.primaryForeground} /></View><Text style={[styles.kicker, { color: colors.primary }]}>RADAR PRO</Text><Text style={[styles.heading, { color: colors.foreground }]}>Drive with signal.</Text><Text style={[styles.copy, { color: colors.mutedForeground }]}>Cut through the noise with a premium command layer for connected drivers.</Text></View>
        <View style={[styles.plan, { backgroundColor: colors.card, borderColor: colors.primary }]}><View style={styles.planTop}><View><Text style={[styles.planName, { color: colors.foreground }]}>Pro driver</Text><Text style={[styles.planSub, { color: colors.mutedForeground }]}>{statusCopy}</Text></View><View style={[styles.price, { backgroundColor: colors.accent }]}><Text style={[styles.priceValue, { color: colors.primary }]}>{formatCurrency(4999, currency)}</Text><Text style={[styles.priceSub, { color: colors.mutedForeground }]}>/ 7 days</Text></View></View>{benefits.map((benefit) => <View key={benefit} style={styles.benefit}><View style={[styles.check, { backgroundColor: colors.primary }]}><Feather name="check" size={11} color={colors.primaryForeground} /></View><Text style={[styles.benefitText, { color: colors.foreground }]}>{benefit}</Text></View>)}<Pressable testID="connect-billing" onPress={subscribe} disabled={busy || !token} style={[styles.cta, { backgroundColor: colors.primary, opacity: busy || !token ? 0.6 : 1 }]}><Text style={[styles.ctaText, { color: colors.primaryForeground }]}>{busy ? 'Opening checkout...' : actionCopy}</Text><Feather name="arrow-up-right" size={16} color={colors.primaryForeground} /></Pressable></View>
        {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
        <View style={[styles.note, { backgroundColor: colors.muted }]}><Ionicons name="information-circle-outline" size={17} color={colors.warning} /><Text style={[styles.noteText, { color: colors.mutedForeground }]}>Secure checkout is handled by the regional payment provider for your detected currency.</Text></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  close: { marginLeft: 20, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingHorizontal: 34, marginTop: 19 },
  logo: { width: 60, height: 60, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  kicker: { fontSize: 10, fontWeight: '900', letterSpacing: 2.1 },
  heading: { fontSize: 31, fontWeight: '800', letterSpacing: -1.1, marginTop: 10 },
  copy: { fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 9 },
  plan: { marginHorizontal: 20, borderWidth: 1, borderRadius: 22, padding: 18, marginTop: 30 },
  planTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  planName: { fontSize: 19, fontWeight: '800' },
  planSub: { fontSize: 11, marginTop: 4 },
  price: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12 },
  priceValue: { fontSize: 15, fontWeight: '900' },
  priceSub: { fontSize: 9, textAlign: 'right', marginTop: 2 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 13 },
  check: { width: 19, height: 19, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  benefitText: { fontSize: 12, fontWeight: '600' },
  cta: { height: 49, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, marginTop: 10 },
  ctaText: { fontSize: 12, fontWeight: '900' },
  note: { marginHorizontal: 20, borderRadius: 15, padding: 13, flexDirection: 'row', gap: 9, marginTop: 14 },
  noteText: { flex: 1, fontSize: 10, lineHeight: 15 },
  error: { marginHorizontal: 20, marginTop: 12, fontSize: 11, lineHeight: 16 },
});