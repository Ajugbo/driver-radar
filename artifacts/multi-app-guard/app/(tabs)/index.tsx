import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { fetchGuardStatus, type GuardianState, type GuardStatus } from '@/services/guardApi';
import { NeonButton } from '@/components/NeonButton';
import { ScanlineOverlay } from '@/components/ScanlineOverlay';
import { StatusRing } from '@/components/StatusRing';

const defaultStatus: GuardStatus = {
  state: 'ACTIVE',
  latency: 84,
  checkedAt: '2026-08-31T10:42:00.000Z',
  message: 'Protection layer is online.',
};

const stateColorKey: Record<GuardianState, 'cyan' | 'blue' | 'amber' | 'red'> = {
  ACTIVE: 'cyan',
  IDLE: 'blue',
  SCANNING: 'amber',
  ERROR: 'red',
};

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { devices, isGuest, isPro, addDevice } = useApp();
  const [selectedId, setSelectedId] = useState(devices[0]?.id ?? '');
  const [status, setStatus] = useState<GuardStatus>(defaultStatus);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newId, setNewId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [formError, setFormError] = useState('');

  const selectedDevice = devices.find((device) => device.id === selectedId) ?? devices[0];
  const refresh = useCallback(async () => {
    if (!selectedDevice) return;
    setRefreshing(true);
    setStatus((current) => ({ ...current, state: 'SCANNING', message: 'Guardian is sweeping the device signal.' }));
    try {
      const next = await fetchGuardStatus(selectedDevice.id);
      setStatus(next);
    } catch {
      setStatus((current) => ({
        ...current,
        state: 'ERROR',
        latency: null,
        checkedAt: new Date().toISOString(),
        message: 'Unable to reach the guardian signal.',
      }));
    } finally {
      setRefreshing(false);
    }
  }, [selectedDevice]);

  useEffect(() => {
    if (!selectedDevice) return;
    setSelectedId(selectedDevice.id);
  }, [selectedDevice]);

  const submitDevice = async () => {
    setFormError('');
    try {
      await addDevice(newId, newLabel);
      setSelectedId(newId.trim().toUpperCase());
      setNewId('');
      setNewLabel('');
      setIsAddOpen(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to link device.');
    }
  };

  const statusColor = colors[stateColorKey[status.state]];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScanlineOverlay />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 104 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>MULTI-APP GUARD</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Guardian Status</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            testID="open-login"
            onPress={() => router.push('/login')}
            style={({ pressed }) => [styles.avatarButton, { borderColor: colors.border, backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 }]}
          >
            <Feather name={isGuest ? 'user' : 'shield'} size={18} color={colors.primary} />
          </Pressable>
        </View>

        <View style={[styles.modeBanner, { borderColor: colors.border, backgroundColor: colors.deep }]}>
          <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.modeText, { color: colors.mutedForeground }]}>
            {isGuest ? 'GUEST MODE · LOCAL SIGNALS ONLY' : 'NEURAL LINK CONNECTED'}
          </Text>
          {!isPro ? <Text style={[styles.freeText, { color: colors.amber }]}>FREE</Text> : null}
        </View>

        <View style={styles.nodeHeader}>
          <View>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>MONITORED NODE</Text>
            <Text style={[styles.deviceName, { color: colors.foreground }]}>{selectedDevice?.label ?? 'No node linked'}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            testID="add-device"
            onPress={() => setIsAddOpen(true)}
            style={({ pressed }) => [styles.addButton, { borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}
          >
            <Feather name="plus" size={18} color={colors.primary} />
          </Pressable>
        </View>
        <Text style={[styles.deviceId, { color: colors.mutedForeground }]}>{selectedDevice?.id ?? 'LINK A DEVICE TO BEGIN'}</Text>

        <View style={styles.ringWrap}>
          <StatusRing state={status.state} />
          <Text style={[styles.signalMessage, { color: colors.foreground }]}>{status.message}</Text>
          <Text style={[styles.checkedAt, { color: colors.mutedForeground }]}>
            LAST CHECK {new Date(status.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <View style={[styles.metrics, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.metric}>
            <Text style={[styles.metricValue, { color: statusColor }]}>{status.latency ? `${status.latency}` : '—'}</Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>MS LATENCY</Text>
          </View>
          <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
          <View style={styles.metric}>
            <Text style={[styles.metricValue, { color: colors.foreground }]}>{devices.length}/{isPro ? '∞' : '1'}</Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>NODE SLOTS</Text>
          </View>
          <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
          <View style={styles.metric}>
            <Text style={[styles.metricValue, { color: colors.foreground }]}>30s</Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>REFRESH</Text>
          </View>
        </View>

        <NeonButton label={refreshing ? 'Scanning signal' : 'Run signal check'} icon={refreshing ? undefined : 'radio'} onPress={refresh} disabled={refreshing || !selectedDevice} testID="refresh-status" />

        <View style={[styles.infoCard, { backgroundColor: colors.deep, borderColor: colors.border }]}>
          <Feather name="lock" size={16} color={colors.primary} />
          <View style={styles.infoCopy}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>Your signal is isolated</Text>
            <Text style={[styles.infoBody, { color: colors.mutedForeground }]}>Device IDs stay on this device until you activate a Neural Link.</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={isAddOpen} animationType="slide" transparent onRequestClose={() => setIsAddOpen(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border, paddingBottom: insets.bottom + 18 }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleRow}>
              <View>
                <Text style={[styles.eyebrow, { color: colors.primary }]}>NEW CONNECTION</Text>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Link a device</Text>
              </View>
              <Pressable onPress={() => setIsAddOpen(false)} accessibilityRole="button" testID="close-add-device">
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>DEVICE ID</Text>
            <TextInput value={newId} onChangeText={setNewId} placeholder="e.g. GUARD-8B21" placeholderTextColor={colors.mutedForeground} autoCapitalize="characters" style={[styles.input, { backgroundColor: colors.deep, borderColor: colors.border, color: colors.foreground }]} testID="device-id-input" />
            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>DISPLAY LABEL</Text>
            <TextInput value={newLabel} onChangeText={setNewLabel} placeholder="e.g. Studio laptop" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.deep, borderColor: colors.border, color: colors.foreground }]} testID="device-label-input" />
            {formError ? <Text style={[styles.formError, { color: colors.red }]}>{formError}</Text> : null}
            <NeonButton label="Link device" icon="link-2" onPress={submitDevice} testID="submit-device" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2.2 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 27, letterSpacing: -0.7, marginTop: 6 },
  avatarButton: { width: 42, height: 42, borderWidth: 1, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  modeBanner: { minHeight: 34, borderWidth: 1, borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  modeText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 0.8, flex: 1 },
  freeText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1 },
  nodeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.8 },
  deviceName: { fontFamily: 'Inter_700Bold', fontSize: 19, marginTop: 5 },
  deviceId: { fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.5, marginTop: -10 },
  addButton: { width: 38, height: 38, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ringWrap: { alignItems: 'center', gap: 10, paddingVertical: 4 },
  signalMessage: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  checkedAt: { fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 1.2 },
  metrics: { minHeight: 84, borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 8 },
  metric: { alignItems: 'center', flex: 1, gap: 4 },
  metricValue: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  metricLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 0.7 },
  metricDivider: { width: 1, height: 34 },
  infoCard: { borderWidth: 1, borderRadius: 12, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoCopy: { flex: 1, gap: 4 },
  infoTitle: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  infoBody: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1, padding: 20, gap: 11 },
  modalHandle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: 'rgba(65, 96, 106, 0.8)', marginBottom: 7 },
  modalTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 24, marginTop: 5 },
  inputLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.4, marginTop: 4 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 13, fontFamily: 'Inter_500Medium', fontSize: 14 },
  formError: { fontFamily: 'Inter_500Medium', fontSize: 11 },
});