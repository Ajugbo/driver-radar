import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { NeonButton } from '@/components/NeonButton';
import { ScanlineOverlay } from '@/components/ScanlineOverlay';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signIn } = useApp();
  const [email, setEmail] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const submit = async () => {
    if (!email.includes('@')) {
      Alert.alert('Neural Link required', 'Enter a valid email address to continue.');
      return;
    }
    setIsBusy(true);
    await signIn(email);
    setIsBusy(false);
    router.dismiss();
  };

  return (
    <KeyboardAvoidingView style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScanlineOverlay />
      <View style={styles.content}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" testID="close-login" style={styles.close}>
          <Feather name="x" size={22} color={colors.mutedForeground} />
        </Pressable>
        <View style={[styles.logo, { borderColor: colors.primary, backgroundColor: colors.deep }]}>
          <Feather name="shield" size={31} color={colors.primary} />
        </View>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>SECURE AUTHENTICATION</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Establish your{'\n'}Neural Link</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Sync your device network, unlock telemetry history, and carry your guardian state across sessions.</Text>
        <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>EMAIL ADDRESS</Text>
        <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="operator@network.com" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]} testID="email-input" />
        <NeonButton label={isBusy ? 'Connecting' : 'Connect neural link'} icon={isBusy ? undefined : 'log-in'} onPress={submit} disabled={isBusy} testID="submit-login" />
        <Text style={[styles.helper, { color: colors.mutedForeground }]}>Google OAuth becomes available once your Supabase project is connected.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 22, justifyContent: 'center', gap: 13 },
  close: { position: 'absolute', top: 14, right: 20, padding: 8 },
  logo: { width: 72, height: 72, borderRadius: 23, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2.2 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 32, letterSpacing: -1.2, lineHeight: 36 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, marginBottom: 9 },
  inputLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.4, marginTop: 8 },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, fontFamily: 'Inter_500Medium', fontSize: 14, marginBottom: 4 },
  helper: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 5 },
});