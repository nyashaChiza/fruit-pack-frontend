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
import { getToken, getDriverDetails, logout } from '../../../lib/auth';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load fonts
  useEffect(() => {
    Font.loadAsync({
      'MyFont': require('../../static/fonts/Inter-VariableFont_opsz,wght.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  // Fetch token, driver details, and order in one flow
  useEffect(() => {
    const init = async () => {
      try {
        if (!orderId) {
          throw new Error('Missing order ID.');
        }

        const token = await getToken();
        const driver = await getDriverDetails(token);
        setDriverDetails(driver);

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error('Init error:', err);
        Alert.alert('Error', 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [orderId]);

  const claimOrder = async () => {
    if (!driverDetails?.id) {
      Alert.alert('Error', 'Missing driver info');
      return;
    }

    try {
      await api.post(`/claims/claim/order/${orderId}/driver/${driverDetails.id}`);
      Alert.alert('Success', 'Order Claim Successful');
      router.replace('/driver/home');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to claim order');
    }
  };

  const deliverOrder = async () => {
    try {
      setLoading(true);
      await api.put(`/orders/${orderId}/status`, {
        status: 'delivered',
      });
      Alert.alert('Success', 'Order marked as delivered!');
      router.replace('/driver/home');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#388e3c" />
      </View>
    );
  }

  if (!fontsLoaded || !order) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#1b5e20', fontSize: 16 }}>No order data found.</Text>
        <TouchableOpacity style={[styles.backButton, { marginTop: 20 }]} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={['#a8e6cf', '#56ab2f']} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.heading}>Order Details</Text>

            {/* Order Info */}
            <View style={styles.card}>
              <Text style={styles.title}>Order ID: {order.id}</Text>
              <Text style={styles.price}>Total: R{order.total.toFixed(2)}</Text>
              <Text>Date: {new Date(order.created).toLocaleString()}</Text>
              <Text>Delivery Status: <Text style={styles.status}>{order.delivery_status}</Text></Text>
              <Text>Payment Status: <Text style={styles.status}>{order.payment_status}</Text></Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.title}>Customer: {order.customer_name}</Text>
              <Text style={styles.price}>Address: {order.destination_address}</Text>
              <Text style={styles.price}>Contact: {order.customer_phone}</Text>
              
            </View>

            {/* Items */}
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
            
              <View style={styles.card}>
                <Text style={styles.subheading}>Actions</Text>
                {order.delivery_status === 'pending' && (
                <TouchableOpacity style={styles.cartButton} onPress={claimOrder}>
                  <Text style={styles.cartButtonText}>Claim Order</Text>
                </TouchableOpacity>
                )}
                {order.delivery_status === 'shipped' && (
                <TouchableOpacity style={styles.cartButton} onPress={deliverOrder}>
                  <Text style={styles.cartButtonText}>Mark As Delivered</Text>
                </TouchableOpacity>
                )}
              </View>
            
          </ScrollView>
          {/* Bottom Nav */}
          <View style={styles.bottomNav}>
            <TouchableOpacity onPress={() => router.push('/driver/home')}>
              <Text style={styles.navText}>🏠 Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={async () => {
              await logout();
              router.replace('/screens/login');
            }}>
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
    fontSize: 18,
    color: '#323833',
    fontWeight: '700',
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
