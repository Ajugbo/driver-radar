import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';

export function ScanlineOverlay() {
  const colors = useColors();
  const progress = useSharedValue(-0.2);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1.2, { duration: 4200, easing: Easing.linear }),
      -1,
      false,
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * 760 }],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.grid, { borderColor: colors.border }]} />
      <Animated.View style={[styles.scanline, animatedStyle, { backgroundColor: colors.cyan }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
    borderWidth: 1,
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1,
    opacity: 0.24,
  },
});