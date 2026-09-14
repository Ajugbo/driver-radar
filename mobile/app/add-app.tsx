import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { RideNotificationModule } = NativeModules;

export default function AddAppScreen() {
  const colors = useColors();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      checkPermission();
    }, [])
  );

  const checkPermission = async () => {
    try {
      const granted = await RideNotificationModule.checkUsageStatsPermission();
      setHasPermission(granted);
    } catch (e) {
      console.error(e);
    }
  };

  const requestPermission = () => {
    RideNotificationModule.openUsageStatsSettings();
    setTimeout(checkPermission, 2000);
  };

  const startScanning = async () => {
    setIsScanning(true);
    Alert.alert(
      "Ready to Scan",
      "Please minimize this app and open the ride-hailing app you want to add (e.g., Rida, Uber, Bolt). We will detect it automatically.",
      [{ text: "OK", onPress: () => scanLoop() }]
    );
  };

  const scanLoop = async () => {
    let attempts = 0;
    const maxAttempts = 30;
    
    const interval = setInterval(async () => {
      attempts++;
      try {
        const currentApp = await RideNotificationModule.getCurrentForegroundApp();
        
        if (currentApp && currentApp !== 'com.ajugbo.driverradar' && currentApp !== 'com.android.systemui') {
          clearInterval(interval);
          setIsScanning(false);
          
          const readableName = currentApp.split('.').pop()?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || currentApp;
          
          Alert.alert(
            "App Detected!",
            `We found: ${readableName}\nPackage: ${currentApp}\n\nDo you want to add this to your multi-apping list?`,
            [
              { text: "No", style: "cancel", onPress: () => setHasPermission(null) },
              { 
                text: "Yes, Add It", 
                onPress: async () => {
                  const existingApps = await AsyncStorage.getItem('monitored_apps');
                  const appsList = existingApps ? JSON.parse(existingApps) : [];
                  if (!appsList.includes(currentApp)) {
                    appsList.push(currentApp);
                    await AsyncStorage.setItem('monitored_apps', JSON.stringify(appsList));
                  }
                  Alert.alert("Success", `${readableName} has been added! The listener will now monitor it.`);
                  router.back();
                }
              }
            ]
          );
        }
        
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setIsScanning(false);
          Alert.alert("Timeout", "No new app detected. Please try again.");
        }
      } catch (e) {
        clearInterval(interval);
        setIsScanning(false);
        console.error(e);
      }
    }, 1000);
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Add New App</Text>
      </View>

      <View style={styles.content}>
        {!hasPermission ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="shield" size={48} color={colors.primary} style={{ marginBottom: 16 }} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Permission Required</Text>
            <Text style={[styles.cardText, { color: colors.mutedForeground }]}>
              To detect new apps, Driver Radar needs "Usage Access" permission. This is completely private.
            </Text>
            <Pressable onPress={requestPermission} style={[styles.button, { backgroundColor: colors.primary }]}>
              <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Grant Permission</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="plus-circle" size={48} color={colors.primary} style={{ marginBottom: 16 }} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Ready to Discover</Text>
            <Text style={[styles.cardText, { color: colors.mutedForeground }]}>
              Tap the button below, then immediately open the ride-hailing app you want to add.
            </Text>
            
            {isScanning ? (
              <View style={[styles.scanningBox, { borderColor: colors.border }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.scanningText, { color: colors.foreground }]}>Listening for new apps...</Text>
                <Text style={[styles.scanningSubtext, { color: colors.mutedForeground }]}>Open the target app now</Text>
              </View>
            ) : (
              <Pressable onPress={startScanning} style={[styles.button, { backgroundColor: colors.primary }]}>
                <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Start Scanning</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backButton: { marginRight: 16, padding: 8 },
  title: { fontSize: 20, fontWeight: '800' },
  content: { flex: 1, padding: 20 },
  card: { borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  cardText: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 24 },
  button: { width: '100%', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 16, fontWeight: '700' },
  scanningBox: { width: '100%', padding: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  scanningText: { fontSize: 16, fontWeight: '600', marginTop: 16 },
  scanningSubtext: { fontSize: 13, marginTop: 8 },
});
