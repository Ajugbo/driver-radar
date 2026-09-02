import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useState } from 'react';
import { ProBadge, SectionLabel, SliderRail } from '@/components/RadarUI';
import { useDriver } from '@/context/DriverContext';
import { useColors } from '@/hooks/useColors';

export default function FiltersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { filters, updateFilters, isPro } = useDriver();
  const [zone, setZone] = useState('');
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const addZone = () => {
    const value = zone.trim();
    if (!value || filters.blacklistedZones.includes(value)) return;
    updateFilters({ blacklistedZones: [...filters.blacklistedZones, value] });
    setZone('');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: topInset + 18, paddingBottom: bottomInset + 95 }}>
        <View style={styles.headingRow}>
          <View>
            <Text style={[styles.kicker, { color: colors.primary }]}>CONTROL ROOM / 02</Text>
            <Text style={[styles.heading, { color: colors.foreground }]}>Smart filters</Text>
          </View>
          <ProBadge />
        </View>
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>Shape the requests that reach your radar. Changes apply instantly to every connected listener.</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <View style={styles.labelWrap}>
              <View style={[styles.iconBox, { backgroundColor: colors.accent }]}><Ionicons name="cash-outline" size={16} color={colors.primary} /></View>
              <View><Text style={[styles.label, { color: colors.foreground }]}>Minimum fare</Text><Text style={[styles.helper, { color: colors.mutedForeground }]}>Ignore low-value requests</Text></View>
            </View>
            <Text style={[styles.value, { color: colors.primary }]}>₦{filters.minFare.toLocaleString('en-NG')}</Text>
          </View>
          <SliderRail value={filters.minFare} min={1000} max={7000} step={500} color={colors.primary} onChange={(value) => updateFilters({ minFare: value })} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <View style={styles.labelWrap}>
              <View style={[styles.iconBox, { backgroundColor: colors.accent }]}><Ionicons name="location-outline" size={17} color={colors.primary} /></View>
              <View><Text style={[styles.label, { color: colors.foreground }]}>Pickup radius</Text><Text style={[styles.helper, { color: colors.mutedForeground }]}>Maximum distance to pickup</Text></View>
            </View>
            <Text style={[styles.value, { color: colors.primary }]}>{filters.maxRadius.toFixed(1)} km</Text>
          </View>
          <SliderRail value={filters.maxRadius} min={1} max={8} step={0.5} color={colors.blue} onChange={(value) => updateFilters({ maxRadius: value })} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <View style={styles.labelWrap}>
              <View style={[styles.iconBox, { backgroundColor: colors.accent }]}><Ionicons name="star-outline" size={17} color={colors.warning} /></View>
              <View><Text style={[styles.label, { color: colors.foreground }]}>Minimum rating</Text><Text style={[styles.helper, { color: colors.mutedForeground }]}>Optional quality filter</Text></View>
            </View>
            <Pressable testID="rating-toggle" onPress={() => updateFilters({ minRating: filters.minRating === null ? 4.7 : null })} style={[styles.switch, { backgroundColor: filters.minRating !== null ? colors.primary : colors.input }]}>
              <View style={[styles.switchKnob, { backgroundColor: filters.minRating !== null ? colors.primaryForeground : colors.mutedForeground, alignSelf: filters.minRating !== null ? 'flex-end' : 'flex-start' }]} />
            </Pressable>
          </View>
          {filters.minRating !== null ? <SliderRail value={filters.minRating} min={4} max={5} step={0.1} color={colors.warning} onChange={(value) => updateFilters({ minRating: Number(value.toFixed(1)) })} /> : null}
          {!isPro ? <View style={[styles.lockRow, { backgroundColor: colors.muted }]}><Feather name="lock" size={12} color={colors.warning} /><Text style={[styles.lockText, { color: colors.mutedForeground }]}>Rating filters are part of Radar Pro</Text></View> : null}
        </View>

        <SectionLabel eyebrow="EXCLUSION ZONES" title="Blacklisted areas" action={`${filters.blacklistedZones.length} active`} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.zoneInputRow}>
            <TextInput testID="zone-input" value={zone} onChangeText={setZone} onSubmitEditing={addZone} placeholder="Add an area..." placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.input, backgroundColor: colors.background }]} returnKeyType="done" />
            <Pressable testID="add-zone" onPress={addZone} style={[styles.addButton, { backgroundColor: colors.primary }]}><Feather name="plus" size={18} color={colors.primaryForeground} /></Pressable>
          </View>
          <View style={styles.chips}>
            {filters.blacklistedZones.map((item) => (
              <Pressable key={item} onPress={() => updateFilters({ blacklistedZones: filters.blacklistedZones.filter((zoneName) => zoneName !== item) })} style={[styles.chip, { backgroundColor: colors.accent, borderColor: colors.line }]}>
                <Text style={[styles.chipText, { color: colors.accentForeground }]}>{item}</Text>
                <Feather name="x" size={12} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
        </View>
        <Text style={[styles.footerNote, { color: colors.mutedForeground }]}>Tap any slider to cycle through calibrated values. Your current profile is saved locally and can sync to the API when signed in.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headingRow: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  kicker: { fontSize: 10, letterSpacing: 1.7, fontWeight: '800', marginBottom: 6 },
  heading: { fontSize: 28, fontWeight: '800', letterSpacing: -0.9 },
  intro: { paddingHorizontal: 20, fontSize: 13, lineHeight: 20, marginTop: 9, marginBottom: 22, maxWidth: 370 },
  card: { borderRadius: 18, borderWidth: 1, marginHorizontal: 20, padding: 16, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconBox: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '700' },
  helper: { fontSize: 11, marginTop: 3 },
  value: { fontSize: 15, fontWeight: '800' },
  switch: { width: 43, height: 25, borderRadius: 14, padding: 3, justifyContent: 'center' },
  switchKnob: { width: 19, height: 19, borderRadius: 10 },
  lockRow: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 9, borderRadius: 9, marginTop: 13 },
  lockText: { fontSize: 10, fontWeight: '600' },
  zoneInputRow: { flexDirection: 'row', gap: 9 },
  input: { flex: 1, height: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, fontSize: 13 },
  addButton: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  chipText: { fontSize: 11, fontWeight: '700' },
  footerNote: { paddingHorizontal: 20, fontSize: 11, lineHeight: 17, marginTop: 4 },
});