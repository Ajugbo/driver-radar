import { Feather, Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthRequest } from 'expo-auth-session/providers/google';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useState } from 'react';
import { useDriver } from '@/context/DriverContext';
import { useColors } from '@/hooks/useColors';

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, register } = useDriver();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

const [request, response, promptAsync] = useAuthRequest(
  {
    androidClientId: '1042109660708-pn4c4g5b4crjeqs906ehruj72u5ol1ot.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  },
  {}
);
  const [error, setError] = useState('');

React.useEffect(() => {
  if (response?.type === 'success') {
    const { id_token } = response.params;
    fetch('https://driver-radar.vercel.app/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: id_token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.token) {
          AsyncStorage.setItem('driverRadarToken', data.token);
          router.replace('/(tabs)');
        } else {
          setError(data.error || 'Authentication failed');
        }
      })
      .catch(() => setError('Network error'));
  }
}, [response]);
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const submit = async () => {
    setError('');
    if ((mode === 'login' ? credential.trim().length < 5 : !credential.includes('@')) || password.length < 8) {
      setError(mode === 'login' ? 'Use a valid phone number and a password with at least 8 characters.' : 'Use a valid email and a password with at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      await (mode === 'login' ? login(credential.trim(), password) : register(credential.trim(), password));
      router.replace('/(tabs)');
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
        <View style={styles.hero}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}><Ionicons name="navigate" size={25} color={colors.primaryForeground} /></View>
          <Text style={[styles.kicker, { color: colors.primary }]}>DRIVER RADAR</Text>
          <Text style={[styles.heading, { color: colors.foreground }]}>{mode === 'login' ? 'Welcome back.' : 'Join the network.'}</Text>
          <Text style={[styles.copy, { color: colors.mutedForeground }]}>{mode === 'login' ? 'Sign in to sync your filters, connections, and ride history.' : 'Create your driver account and start filtering the noise.'}</Text>
        </View>
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>{mode === 'login' ? 'PHONE NUMBER' : 'EMAIL'}</Text>
          <TextInput testID={mode === 'login' ? 'phone-input' : 'email-input'} value={credential} onChangeText={setCredential} autoCapitalize="none" keyboardType={mode === 'login' ? 'phone-pad' : 'email-address'} placeholder={mode === 'login' ? '+234 800 000 0000' : 'you@example.com'} placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} />
          
          <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 14 }]}>PASSWORD</Text>
          <View style={[styles.passwordContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <TextInput 
              testID="password-input" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry={!showPassword} 
              placeholder="Minimum 8 characters" 
              placeholderTextColor={colors.mutedForeground} 
              style={[styles.inputInner, { color: colors.foreground }]} 
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
          
          <Pressable testID="submit-auth" onPress={submit} disabled={busy} style={({ pressed }) => [styles.submit, { backgroundColor: colors.primary, opacity: busy || pressed ? 0.65 : 1 }]}><Text style={[styles.submitText, { color: colors.primaryForeground }]}>{busy ? 'Connecting...' : mode === 'login' ? 'Sign in' : 'Create account'}</Text><Feather name="arrow-up-right" size={17} color={colors.primaryForeground} /></Pressable>
          
          <Pressable testID="google-auth" onPress={() => promptAsync()} disabled={!request} style={[styles.google, { borderColor: colors.border, opacity: !request ? 0.5 : 1 }]}><Ionicons name="logo-google" size={16} color={colors.foreground} /><Text style={[styles.googleText, { color: colors.foreground }]}>Continue with Google</Text></Pressable>
        </View>
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>{mode === 'login' ? 'New to Driver Radar?' : 'Already have an account?'}</Text>
          <Pressable onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setCredential(''); setError(''); }}><Text style={[styles.footerLink, { color: colors.primary }]}>{mode === 'login' ? 'Create account' : 'Sign in'}</Text></Pressable>
        </View>
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
  passwordContainer: { height: 50, borderWidth: 1, borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  inputInner: { flex: 1, fontSize: 14, height: '100%' },
  eyeIcon: { padding: 10 },
  error: { fontSize: 11, lineHeight: 16, marginTop: 10 },
  submit: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 19 },
  submitText: { fontSize: 13, fontWeight: '900' },
  google: { height: 50, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, marginTop: 10 },
  googleText: { fontSize: 13, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 25 },
  footerText: { fontSize: 12 },
  footerLink: { fontSize: 12, fontWeight: '800' },
});
