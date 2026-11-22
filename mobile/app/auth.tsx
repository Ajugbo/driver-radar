import { Feather, Ionicons } from '@expo/vector-icons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useState, useEffect } from 'react'; // 👈 Added useEffect
import { useDriver } from '@/context/DriverContext';
import { useColors } from '@/hooks/useColors';

GoogleSignin.configure({
  webClientId: '1042109660708-344vbt0keehimbl1m629it924pjtr9jo.apps.googleusercontent.com',
});

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, register } = useDriver();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState('');
  
  // 👇 NEW: State to safely trigger navigation AFTER storage is confirmed
  const [isReadyToNavigate, setIsReadyToNavigate] = useState(false);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  // 👇 NEW: This effect ONLY runs when storage is successfully saved
  useEffect(() => {
    if (isReadyToNavigate) {
      router.replace('/(tabs)');
    }
  }, [isReadyToNavigate]);

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

    const handleGoogleSignIn = async () => {
    setError('');
    setGoogleBusy(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken) throw new Error('No ID token returned');
      
      const res = await fetch('https://driver-radar.vercel.app/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      
      const data = await res.json();
      
      if (data && typeof data.token === 'string' && data.token.trim().length > 0) {
        
        // 1. Save the token
        await AsyncStorage.setItem('driverRadarToken', data.token);
        
        // 2. Save the driver profile (tabs might be expecting this)
        if (data.driver) {
          await AsyncStorage.setItem('driverRadarDriver', JSON.stringify(data.driver));
        }
        
        // 3. THE FIX: Micro-delay to let AsyncStorage and React state synchronize
        // before Expo Router attempts to unmount this screen and mount (tabs).
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 4. Use push instead of replace (more reliable for crossing group boundaries)
        router.push('/(tabs)');
        
      } else {
        const keys = data ? Object.keys(data).join(', ') : 'none';
        setError(`Auth failed: Missing token. Keys: [${keys}]`);
      }
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) setError('Sign in cancelled');
      else if (err.code === statusCodes.IN_PROGRESS) setError('Sign in already in progress');
      else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) setError('Google Play Services unavailable');
      else setError('Google Sign-In failed: ' + (err.message || 'Unknown error'));
    } finally {
      setGoogleBusy(false);
    }
  };
  
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: topInset + 18, paddingBottom: bottomInset + 30 }}>
        <Pressable testID="close-auth" onPress={() => router.back()} style={styles.close}>
          <Feather name="x" size={20} color={colors.mutedForeground} />
        </Pressable>
        <View style={styles.hero}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Ionicons name="navigate" size={25} color={colors.primaryForeground} />
          </View>
          <Text style={[styles.kicker, { color: colors.primary }]}>DRIVER RADAR</Text>
          <Text style={[styles.heading, { color: colors.foreground }]}>{mode === 'login' ? 'Welcome back.' : 'Join the network.'}</Text>
          <Text style={[styles.copy, { color: colors.mutedForeground }]}>{mode === 'login' ? 'Sign in to sync your filters, connections, and ride history.' : 'Create your driver account and start filtering the noise.'}</Text>
        </View>
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>{mode === 'login' ? 'PHONE NUMBER' : 'EMAIL'}</Text>
          <TextInput testID={mode === 'login' ? 'phone-input' : 'email-input'} value={credential} onChangeText={setCredential} autoCapitalize="none" keyboardType={mode === 'login' ? 'phone-pad' : 'email-address'} placeholder={mode === 'login' ? '+234 800 000 0000' : 'you@example.com'} placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} />
          <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 14 }]}>PASSWORD</Text>
          <View style={[styles.passwordContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <TextInput testID="password-input" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholder="Minimum 8 characters" placeholderTextColor={colors.mutedForeground} style={[styles.inputInner, { color: colors.foreground }]} />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>
          {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
          <Pressable testID="submit-auth" onPress={submit} disabled={busy} style={({ pressed }) => [styles.submit, { backgroundColor: colors.primary, opacity: busy || pressed ? 0.65 : 1 }]}>
            <Text style={[styles.submitText, { color: colors.primaryForeground }]}>{busy ? 'Connecting...' : mode === 'login' ? 'Sign in' : 'Create account'}</Text>
            <Feather name="arrow-up-right" size={17} color={colors.primaryForeground} />
          </Pressable>
          <Pressable testID="google-auth" onPress={handleGoogleSignIn} disabled={googleBusy} style={[styles.google, { borderColor: colors.border, opacity: googleBusy ? 0.5 : 1 }]}>
            <Ionicons name="logo-google" size={16} color={colors.foreground} />
            <Text style={[styles.googleText, { color: colors.foreground }]}>{googleBusy ? 'Connecting...' : 'Continue with Google'}</Text>
          </Pressable>
        </View>
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>{mode === 'login' ? 'New to Driver Radar?' : 'Already have an account?'}</Text>
          <Pressable onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setCredential(''); setError(''); }}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>{mode === 'login' ? 'Create account' : 'Sign in'}</Text>
          </Pressable>
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
