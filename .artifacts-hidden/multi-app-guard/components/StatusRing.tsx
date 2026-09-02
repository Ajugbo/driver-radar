import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import type { GuardianState } from '@/services/guardApi';

const stateCopy: Record<GuardianState, string> = {
  IDLE: 'STANDBY',
  SCANNING: 'SCANNING',
  ACTIVE: 'ACTIVE',
  ERROR: 'ERROR',
};

export function StatusRing({ state }: { state: GuardianState }) {
  const colors = useColors();
  const pulse = useSharedValue(1);
  const color =
    state === 'ACTIVE'
      ? colors.cyan
      : state === 'SCANNING'
        ? colors.amber
        : state === 'ERROR'
          ? colors.red
          : colors.blue;

  useEffect(() => {
    pulse.value =
      state === 'IDLE'
        ? 1
        : withRepeat(
            withSequence(
              withTiming(1.08, { duration: 850, easing: Easing.inOut(Easing.ease) }),
              withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            false,
          );
  }, [pulse, state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    borderColor: color,
    shadowColor: color,
  }));

  return (
    <Animated.View style={[styles.ring, animatedStyle, { backgroundColor: colors.deep }]}>
      <View style={[styles.innerRing, { borderColor: color }]}>
        <Text style={[styles.status, { color }]}>{stateCopy[state]}</Text>
        <View style={[styles.dot, { backgroundColor: color }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: 184,
    height: 184,
    borderRadius: 92,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.65,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  innerRing: {
    width: 146,
    height: 146,
    borderRadius: 73,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  status: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    letterSpacing: 2.8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});