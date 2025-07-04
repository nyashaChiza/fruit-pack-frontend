import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../../lib/api';
import { getToken } from '../../lib/auth';

export default function AvailableOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get(`/orders/available/orders`); // adjust endpoint if different
        setOrders(res.data);
      } catch (err) {
        Alert.alert('Notice', err.response?.data?.detail || 'No available orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOrderPress = (orderId) => {
    router.push({ pathname: '/driver/orders/[id]', params: { id: orderId } });
  };

  return (
    <LinearGradient colors={['#a8e6cf', '#dcedc1']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Available Orders</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4caf50" style={{ marginTop: 32 }} />
        ) : orders.length === 0 ? (
          <Text style={styles.emptyText}>No orders found.</Text>
        ) : (
          orders.map((order) => (
            <TouchableOpacity key={order.id} style={styles.card} onPress={() => router.push({ pathname: '/driver/orders/[id]', params: { orderId: order.id } })}>
              <Text style={styles.cardTitle}>Order #{order.id}</Text>
              <Text style={styles.cardText}>Customer: {order.customer_name}</Text>
              <Text style={styles.cardText}>Address: {order.destination_address}</Text>
              <Text style={styles.cardText}>Payment Status: {order.payment_status}</Text>
              <Text style={styles.cardText}>Delivery Status: {order.delivery_status}</Text>
              <Text style={styles.cardText}>Total Amount: R{order.total.toFixed(2)}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffffdd',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2e7d32',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginTop: 40,
  },
  cardStatus: {
    color: '#388e3c',
    fontWeight: '900',
     fontSize: 16,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#388e3c',
  }
});
