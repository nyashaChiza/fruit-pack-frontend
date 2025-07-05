import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../lib/api';
import { getToken, getUserId, logout } from '../../lib/auth';
import * as Font from 'expo-font';

export default function OrdersListScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await getToken();
        const userId = await getUserId(token);
        if (!token || !userId) {
          Alert.alert('Unauthorized', 'Please log in.');
          return;
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get(`/orders/user/${userId}/orders`);
        setOrders(response.data);
      } catch (err: any) {
        console.error('Fetch orders error:', err.response?.data || err.message);
        Alert.alert('Error', 'Could not fetch orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    Font.loadAsync({
      MyFont: require('../static/fonts/Inter-VariableFont_opsz,wght.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) return null;

  const renderOrder = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push({ pathname: '/screens/orders/[id]', params: { orderId: item.id } })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderText}>Order ID: #{item.id}</Text>
        <Text
          style={[
            styles.statusText,
            {
              backgroundColor:
                item.delivery_status === 'completed'
                  ? 'green'
                  : item.delivery_status === 'cancelled'
                  ? '#d32f2f'
                  : 'orange',
            },
          ]}
        >
          {item.delivery_status}
        </Text>
      </View>
      <Text style={styles.orderText}>
        Total: R{typeof item.total === 'number' ? item.total.toFixed(2) : '0.00'}
      </Text>
      <Text style={styles.orderText}>Date: {new Date(item.created).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Use LinearGradient for background */}
    <LinearGradient colors={['#dcedc1', '#a8e6cf']} style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.header}>My Orders</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#4caf50" />
          ) : (
            <FlatList
              data={orders.sort(
                (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
              )}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderOrder}
              contentContainerStyle={{ paddingBottom: 120 }}
            />
          )}
        </View>

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
  container: {
    padding: 16,
    flex: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: '#ffffffdd',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderText: {
    fontSize: 17,
    marginBottom: 4,
    fontWeight: '800',
    color: '#333',
  },
  statusText: {
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
    textTransform: 'capitalize',
    fontWeight: '800',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
