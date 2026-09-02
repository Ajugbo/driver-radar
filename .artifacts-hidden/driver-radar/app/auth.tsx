import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useState } from 'react';
import { useDriver } from '@/context/DriverContext';
import { useColors } from '@/hooks/useColors';

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, register, continueAsDemo } = useDriver();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const submit = async () => {
    setError('');
    if (!email.includes('@') || password.length < 8) {
      setError('Use a valid email and a password with at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      await (mode === 'login' ? login(email, password) : register(email, password));
      router.dismiss();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to reach the driver server.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: topInset + 18, paddingBottom: bottomInset + 30 }}>
        <Pressable testID="close-auth" onPress={() => router.back()} style={styles.close}><Feather name="x" size={20} color={colors.mutedForeground} /></Pressable>
        <View style={styles.hero}><View style={[styles.logo, { backgroundColor: colors.primary }]}><Ionicons name="navigate" size={25} color={colors.primaryForeground} /></View><Text style={[styles.kicker, { color: colors.primary }]}>DRIVER RADAR</Text><Text style={[styles.heading, { color: colors.foreground }]}>{mode === 'login' ? 'Welcome back.' : 'Join the network.'}</Text><Text style={[styles.copy, { color: colors.mutedForeground }]}>{mode === 'login' ? 'Sign in to sync your filters, connections, and ride history.' : 'Create your driver account and start filtering the noise.'}</Text></View>
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>EMAIL</Text>
          <TextInput testID="email-input" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} />
          <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 14 }]}>PASSWORD</Text>
          <TextInput testID="password-input" value={password} onChangeText={setPassword} secureTextEntry placeholder="Minimum 8 characters" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} />
          {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
          <Pressable testID="submit-auth" onPress={submit} disabled={busy} style={({ pressed }) => [styles.submit, { backgroundColor: colors.primary, opacity: busy || pressed ? 0.65 : 1 }]}><Text style={[styles.submitText, { color: colors.primaryForeground }]}>{busy ? 'Connecting...' : mode === 'login' ? 'Sign in' : 'Create account'}</Text><Feather name="arrow-up-right" size={17} color={colors.primaryForeground} /></Pressable>
          <Pressable testID="google-auth" onPress={() => setError('Google OAuth is scaffolded for the next provider connection. Use email/password for this preview.')} style={[styles.google, { borderColor: colors.border }]}><Ionicons name="logo-google" size={16} color={colors.foreground} /><Text style={[styles.googleText, { color: colors.foreground }]}>Continue with Google</Text></Pressable>
        </View>
        <View style={styles.footer}><Text style={[styles.footerText, { color: colors.mutedForeground }]}>{mode === 'login' ? 'New to Driver Radar?' : 'Already have an account?'}</Text><Pressable onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}><Text style={[styles.footerLink, { color: colors.primary }]}>{mode === 'login' ? 'Create account' : 'Sign in'}</Text></Pressable></View>
        <Pressable testID="demo-mode" onPress={() => { continueAsDemo(); router.dismiss(); }} style={styles.demo}><Text style={[styles.demoText, { color: colors.mutedForeground }]}>Continue in local demo mode</Text></Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  close: { marginLeft: 20, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingHorizontal: 34, marginTop: 18 },
  logo: { width: 60, height: 60, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  kicker: { fontSize: 10, fontWeight: '900', letterSpacing: 2.1 },
  heading: { fontSize: 31, fontWeight: '800', letterSpacing: -1.1, marginTop: 10 },
  copy: { fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 9 },
  form: { paddingHorizontal: 22, marginTop: 33 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 7 },
  input: { height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, fontSize: 14 },
  error: { fontSize: 11, lineHeight: 16, marginTop: 10 },
  submit: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 19 },
  submitText: { fontSize: 13, fontWeight: '900' },
  google: { height: 50, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, marginTop: 10 },
  googleText: { fontSize: 13, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 25 },
  footerText: { fontSize: 12 },
  footerLink: { fontSize: 12, fontWeight: '800' },
  demo: { alignItems: 'center', marginTop: 29, padding: 10 },
  demoText: { fontSize: 11, fontWeight: '600' },
});