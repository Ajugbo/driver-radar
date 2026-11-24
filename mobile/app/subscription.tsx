import React, { useState } from 'react';
import { View, Text, Pressable, Linking, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubscription } from '@/hooks/useSubscription';

export default function SubscriptionScreen() {
  const { status, daysLeft, refresh } = useSubscription();
  const [busy, setBusy] = useState(false);

  const pay = async () => {
    setBusy(true);
    try {
      const token = await AsyncStorage.getItem('@driver-radar/token');
      const r = await fetch('https://driver-radar.vercel.app/api/subscription/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      });
      const j = await r.json();
      if (j.authorization_url) {
        await Linking.openURL(j.authorization_url);
      } else {
        alert(j.error || 'Failed to initialize payment');
      }
    } catch (e) {
      alert('Payment initialization failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={s.screen}>
      <Text style={s.title}>Driver Radar Pro</Text>
      <Text style={s.sub}>
        {status === 'trial' ? `Free trial: ${daysLeft} day(s) left.` :
         status === 'active' ? `Active: ${daysLeft} day(s) left.` :
         'Your trial has ended.'}
      </Text>
      <View style={s.card}>
        <Text style={s.price}>₦4,999</Text>
        <Text style={s.per}>per 7 days</Text>
        <Text style={s.feat}>• Live ride listening across Uber, Bolt, inDrive, Rida{'\n'}• One-tap handoff to the driver app{'\n'}• Filters, analytics and history</Text>
      </View>
      <Pressable style={[s.pay, busy && s.disabled]} onPress={pay} disabled={busy}>
        {busy ? <ActivityIndicator color="#020617" /> : <Text style={s.payText}>Pay ₦4,999</Text>}
      </Pressable>
      <Pressable style={s.ghost} onPress={async () => { await refresh(); router.back(); }}>
        <Text style={s.ghostText}>Refresh status</Text>
      </Pressable>
      <Pressable onPress={() => router.back()}><Text style={s.back}>Back</Text></Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020617', padding: 24, justifyContent: 'center' },
  title: { color: '#f8fafc', fontSize: 26, fontWeight: '800', textAlign: 'center' },
  sub: { color: '#94a3b8', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  card: { backgroundColor: '#0f172a', borderRadius: 18, padding: 22, borderWidth: 1, borderColor: '#1e293b' },
  price: { color: '#4ade80', fontSize: 34, fontWeight: '900' },
  per: { color: '#94a3b8', marginBottom: 14 },
  feat: { color: '#cbd5e1', lineHeight: 22 },
  pay: { backgroundColor: '#22c55e', borderRadius: 14, padding: 16, marginTop: 22, alignItems: 'center' },
  disabled: { opacity: 0.6 },
  payText: { color: '#020617', fontWeight: '800' },
  ghost: { borderRadius: 14, padding: 14, marginTop: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  ghostText: { color: '#e2e8f0' },
  back: { color: '#64748b', textAlign: 'center', marginTop: 18 },
});
