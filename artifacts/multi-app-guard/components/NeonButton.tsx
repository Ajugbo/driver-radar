import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface NeonButtonProps {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'quiet' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function NeonButton({
  label,
  icon,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  testID,
}: NeonButtonProps) {
  const colors = useColors();
  const backgroundColor =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
        ? colors.destructive
        : colors.secondary;
  const textColor =
    variant === 'primary' || variant === 'danger'
      ? colors.primaryForeground
      : colors.secondaryForeground;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: disabled ? 0.42 : pressed ? 0.74 : 1 },
        style,
      ]}
    >
      {icon ? <Feather name={icon} size={16} color={textColor} /> : null}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});