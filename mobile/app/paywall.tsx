import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { useDriver } from '@/context/DriverContext';
import { useColors } from '@/hooks/useColors';
import { getRegionalPricing } from '@/lib/currency-detector';

const benefits = ['Unlimited platform listeners', 'Priority ping animations', 'Advanced rating and zone filters', 'Weekly earnings analytics'];

export default function PaywallScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { driver } = useDriver();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const pricing = getRegionalPricing();
  
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleSubscribe = async () => {
    setIsCheckingOut(true);
    try {
      const res = await fetch('https://driver-radar.vercel.app/api/payment/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${driver.token || ''}` 
        },
        body: JSON.stringify({ 
          driverId: driver.id,
          currency: pricing.currencyCode, 
          basePriceUSD: pricing.basePriceUSD 
        })
      });
      
      const data = await res.json();
      
      if (data.checkoutUrl) {
        await Linking.openURL(data.checkoutUrl);
      } else {
        Alert.alert('Checkout Error', data.message || 'Could not start checkout process.');
      }
    } catch (e) {
      Alert.alert('Network Error', 'Unable to connect to the payment server.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingTop: topInset + 16, paddingBottom: bottomInset + 30 }}>
        <Pressable testID="close-paywall" onPress={() => router.back()} style={styles.close}><Feather name="x" size={20} color={colors.mutedForeground} /></Pressable>
        <View style={styles.hero}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}><Ionicons name="flash" size={25} color={colors.primaryForeground} /></View>
          <Text style={[styles.kicker, { color: colors.primary }]}>RADAR PRO</Text>
          <Text style={[styles.heading, { color: colors.foreground }]}>Drive with signal.</Text>
          <Text style={[styles.copy, { color: colors.mutedForeground }]}>Cut through the noise with a premium command layer for global drivers.</Text>
        </View>
        
        <View style={[styles.plan, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <View style={styles.planTop}>
            <View>
              <Text style={[styles.planName, { color: colors.foreground }]}>Pro driver</Text>
              <Text style={[styles.planSub, { color: colors.mutedForeground }]}>Monthly membership</Text>
            </View>
            <View style={[styles.price, { backgroundColor: colors.accent }]}>
              <Text style={[styles.priceValue, { color: colors.primary }]}>{pricing.displayPrice}</Text>
              <Text style={[styles.priceSub, { color: colors.mutedForeground }]}>/ month</Text>
            </View>
          </View>
          
          {benefits.map((benefit) => (
            <View key={benefit} style={styles.benefit}>
              <View style={[styles.check, { backgroundColor: colors.primary }]}><Feather name="check" size={11} color={colors.primaryForeground} /></View>
              <Text style={[styles.benefitText, { color: colors.foreground }]}>{benefit}</Text>
            </View>
          ))}
          
          <Pressable 
            testID="subscribe-button" 
            onPress={handleSubscribe} 
            disabled={isCheckingOut}
            style={({ pressed }) => [styles.cta, { backgroundColor: colors.primary, opacity: isCheckingOut || pressed ? 0.7 : 1 }]}
          >
            <Text style={[styles.ctaText, { color: colors.primaryForeground }]}>
              {isCheckingOut ? 'Processing...' : 'Subscribe Now'}
            </Text>
            <Feather name="arrow-up-right" size={16} color={colors.primaryForeground} />
          </Pressable>
        </View>
        
        {/* Removed the RevenueCat warning note */}
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
});
