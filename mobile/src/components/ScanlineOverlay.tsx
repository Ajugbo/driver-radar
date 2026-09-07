import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function ScanlineOverlay() {
  const progress = useSharedValue(-0.2);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1.2, { duration: 4200, easing: Easing.linear }), -1, false);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: progress.value * 760 }] }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.grid} />
      <Animated.View style={[styles.scanline, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { ...StyleSheet.absoluteFillObject, opacity: 0.12, borderWidth: 1, borderColor: '#00F3FF' },
  scanline: { position: 'absolute', left: 0, right: 0, top: 0, height: 1, opacity: 0.3, backgroundColor: '#00F3FF' },
});
