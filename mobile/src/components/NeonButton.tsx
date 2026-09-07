import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';

interface NeonButtonProps {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function NeonButton({ label, icon, onPress, disabled = false, style, testID }: NeonButtonProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => { Haptics.selectionAsync().catch(() => undefined); onPress(); }}
      style={({ pressed }) => [styles.button, { opacity: disabled ? 0.42 : pressed ? 0.72 : 1 }, style]}
    >
      {icon ? <Feather name={icon} size={16} color="#031014" /> : null}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 50, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1, borderColor: '#00F3FF', backgroundColor: '#00F3FF', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, shadowColor: '#00F3FF', shadowOpacity: 0.8, shadowRadius: 14, elevation: 8 },
  label: { color: '#031014', fontFamily: 'monospace', fontSize: 12, fontWeight: '900', letterSpacing: 1.1, textTransform: 'uppercase' },
});
