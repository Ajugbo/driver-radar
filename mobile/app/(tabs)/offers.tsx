import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { driverApi } from '@/lib/api';
import { router } from 'expo-router';

interface Offer {
  id: number;
  customer_name: string;
  customer_phone: string;
  pickup_location: string;
  dropoff_location: string;
  total_fare: number;
  payment_method: string;
  seats_booked: number;
}

export default function OffersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchOffers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const response = await driverApi.getOffers();
      // Handle both { offers: [...] } and direct array [...] responses safely
      const data = response.offers || response;
      setOffers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch offers:', error);
      if (error.message?.includes('401')) {
        Alert.alert('Session Expired', 'Please log in again.', [
          { text: 'OK', onPress: () => router.replace('/auth') }
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Poll every 10 seconds
  useEffect(() => {
    fetchOffers();
    const interval = setInterval(() => {
      fetchOffers();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchOffers]);

  const handleAccept = async (rideId: number) => {
    setActionLoading(rideId);
    try {
      await driverApi.acceptRide(rideId);
      Alert.alert('Success', 'Ride accepted! Navigating to active ride...');
      fetchOffers(); // Refresh list
      // TODO: router.push(`/ride/${rideId}`) when active ride screen is built
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept ride');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (rideId: number) => {
    setActionLoading(rideId);
    try {
      await driverApi.declineRide(rideId);
      fetchOffers(); // Refresh list
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to decline ride');
    } finally {
      setActionLoading(null);
    }
  };

  const topInset = insets.top;
  const bottomInset = insets.bottom;

  if (loading && offers.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Fetching live offers...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={{ paddingTop: topInset + 18, paddingBottom: bottomInset + 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchOffers(true)} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: colors.primary }]}>SYSTEM / 02</Text>
          <Text style={[styles.heading, { color: colors.foreground }]}>Live Offers</Text>
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>{offers.length} Pending</Text>
          </View>
        </View>

        {offers.length === 0 ? (
          <View style={[styles.emptyState, { borderColor: colors.border }]}>
            <Feather name="inbox" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.foreground }]}>No active offers nearby</Text>
            <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>New ride requests will appear here automatically.</Text>
          </View>
        ) : (
          offers.map((offer) => (
            <View key={offer.id} style={[styles.offerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.offerHeader}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>{offer.customer_name.charAt(0)}</Text>
                </View>
                <View style={styles.customerInfo}>
                  <Text style={[styles.customerName, { color: colors.foreground }]}>{offer.customer_name}</Text>
                  <Text style={[styles.customerPhone, { color: colors.mutedForeground }]}>{offer.customer_phone}</Text>
                </View>
                <View style={[styles.fareBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.fareText, { color: colors.primaryForeground }]}>₦{offer.total_fare.toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.routeContainer}>
                <View style={styles.routePoint}>
                  <Ionicons name="location" size={16} color={colors.primary} />
                  <Text style={[styles.routeText, { color: colors.foreground }]} numberOfLines={2}>{offer.pickup_location}</Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routePoint}>
                  <Ionicons name="flag" size={16} color={colors.destructive || '#ef4444'} />
                  <Text style={[styles.routeText, { color: colors.foreground }]} numberOfLines={2}>{offer.dropoff_location}</Text>
                </View>
              </View>

              <View style={styles.offerFooter}>
                <View style={styles.metaRow}>
                  <Feather name="users" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{offer.seats_booked} Seat(s)</Text>
                </View>
                <View style={styles.metaRow}>
                  <Feather name={offer.payment_method === 'cash' ? 'banknote' : 'credit-card'} size={14} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{offer.payment_method === 'cash' ? 'Cash' : 'Wallet'}</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Pressable 
                  onPress={() => handleDecline(offer.id)} 
                  disabled={!!actionLoading}
                  style={[styles.actionButton, styles.declineBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.actionText, { color: colors.mutedForeground }]}>Decline</Text>
                </Pressable>
                <Pressable 
                  onPress={() => handleAccept(offer.id)} 
                  disabled={!!actionLoading}
                  style={[styles.actionButton, styles.acceptBtn, { backgroundColor: colors.primary, opacity: actionLoading === offer.id ? 0.7 : 1 }]}
                >
                  {actionLoading === offer.id ? (
                    <ActivityIndicator size="small" color={colors.primaryForeground} />
                  ) : (
                    <Text style={[styles.actionText, { color: colors.primaryForeground, fontWeight: '800' }]}>Accept Ride</Text>
                  )}
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  kicker: { fontSize: 10, letterSpacing: 1.7, fontWeight: '800', marginBottom: 6 },
  heading: { fontSize: 28, fontWeight: '800', letterSpacing: -0.9 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 8 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  emptyState: { marginHorizontal: 20, padding: 40, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center' },
  emptyText: { fontSize: 16, fontWeight: '700', marginTop: 16 },
  emptySubtext: { fontSize: 13, marginTop: 8, textAlign: 'center' },
  offerCard: { marginHorizontal: 20, marginBottom: 16, borderRadius: 16, borderWidth: 1, padding: 16 },
  offerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '900' },
  customerInfo: { flex: 1, marginLeft: 12 },
  customerName: { fontSize: 14, fontWeight: '800' },
  customerPhone: { fontSize: 12, marginTop: 2 },
  fareBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  fareText: { fontSize: 14, fontWeight: '900' },
  routeContainer: { marginBottom: 16 },
  routePoint: { flexDirection: 'row', alignItems: 'flex-start' },
  routeText: { flex: 1, marginLeft: 10, fontSize: 13, lineHeight: 18 },
  routeLine: { width: 1, height: 20, backgroundColor: '#333', marginLeft: 7, marginVertical: 4 },
  offerFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, paddingTop: 12, borderTopWidth: 1, borderColor: '#333' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  declineBtn: { backgroundColor: 'transparent' },
  acceptBtn: { borderWidth: 0 },
  actionText: { fontSize: 14, fontWeight: '700' },
});
