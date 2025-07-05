import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../../lib/api';
import { getToken, logout } from '../../../lib/auth';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      'MyFont': require('../../static/fonts/Inter-VariableFont_opsz,wght.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  useEffect(() => {
    const fetchToken = async () => {
      const savedToken = await getToken();
      setToken(savedToken);
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (!token || !orderId) return;
    const fetchOrder = async () => {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error('Error fetching order:', err);
        Alert.alert('Error', 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [token, orderId]);

  const confirmDelivery = async () => {
    try {
      await api.post(`/orders/${orderId}/confirm-delivery`);
      Alert.alert('Success', 'Order confirmed as completed');
      router.replace('/screens/orders');
    } catch (err) {
      Alert.alert('Error', 'Could not confirm delivery');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#388e3c" />
      </View>
    );
  }

  if (!order || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#1b5e20', fontSize: 16 }}>No order data found.</Text>
        <TouchableOpacity style={[styles.backButton, { marginTop: 20 }]} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statuses = [
    { key: 'pending', label: 'Ordered', description: 'Order received' },
    { key: 'processing', label: 'Processing', description: 'Preparing for delivery' },
    { key: 'shipped', label: 'Shipped', description: 'On the way' },
    { key: 'delivered', label: 'Delivered', description: 'Product delivered' },
    { key: 'completed', label: 'Completed', description: 'Order completed' },
  ];
  const currentStatusIndex = statuses.findIndex(s => s.key === order.delivery_status);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={['#a8e6cf', '#56ab2f']} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.heading}>Order Details</Text>

            {/* Order Info Card */}
            <View style={styles.card}>
              <Text style={styles.title}>Order ID: {order.id}</Text>
              <Text style={styles.price}>Total: R{order.total.toFixed(2)}</Text>
              <Text>Date: {new Date(order.created).toLocaleString()}</Text>
              <Text>Delivery Status: <Text style={styles.status}>{order.delivery_status}</Text></Text>
              <Text>Payment Status: <Text style={styles.status}>{order.payment_status}</Text></Text>
            </View>

            {/* Order Items */}
            <View style={styles.card}>
              <Text style={styles.subheading}>Items</Text>
              {order.items?.length > 0 ? (
                order.items.map(item => (
                  <View key={item.id} style={styles.item}>
                    <Text style={{ fontWeight: '600' }}>Product: {item.name}</Text>
                    <Text>Quantity: {item.quantity}</Text>
                    <Text>Price: R{item.price.toFixed(2)}</Text>
                  </View>
                ))
              ) : (
                <Text>No items found.</Text>
              )}
            </View>

            {/* Timeline + Buttons */}
            <View style={styles.card}>
              <Text style={styles.subheading}>Order Status Timeline</Text>
              {statuses.map((status, index) => (
                <View key={status.key} style={styles.timelineItem}>
                  <View
                    style={[
                      styles.statusCircle,
                      { backgroundColor: index <= currentStatusIndex ? '#388e3c' : '#9e9e9e' },
                    ]}
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={{
                      color: index <= currentStatusIndex ? '#2e7d32' : '#757575',
                      fontWeight: index === currentStatusIndex ? '700' : '400',
                    }}>
                      {status.label}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#555' }}>{status.description}</Text>
                  </View>
                </View>
              ))}

              {order.delivery_status === 'delivered' && (
                <TouchableOpacity style={styles.cartButton} onPress={confirmDelivery}>
                  <Text style={styles.cartButtonText}>Confirm Delivery</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Bottom Navigation */}
          <View style={styles.bottomNav}>
            <TouchableOpacity onPress={() => router.push('/screens/home')}>
              <Text style={styles.navText}>🏠 Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/screens/cart')}>
              <Text style={styles.navText}>🛒 Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/screens/orders')}>
              <Text style={styles.navText}>📦 Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await logout();
                router.replace('/screens/login');
              }}
            >
              <Text style={styles.navText}>👤 Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 120 },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#a8e6cf',
  },
  card: {
    backgroundColor: '#ffffffdd',
    marginTop: 24,
    padding: 20,
    borderRadius: 24,
    elevation: 5,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 12,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 6,
  },
  price: {
    fontSize: 20,
    color: '#388e3c',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 12,
  },
  item: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#c8e6c9',
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: '#f1f8e9',
  },
  statusCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  status: {
    fontWeight: '700',
    color: '#2e7d32',
  },
  cartButton: {
    backgroundColor: '#4caf50',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  cartButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#c8e6c9',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '700',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    zIndex: 100,
    elevation: 10,
  },
  navText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
});
