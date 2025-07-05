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
import { getToken, getDriverDetails } from '../../lib/auth';

export default function CompletedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [driverDetails, setDriverDetails] = useState(null);

  useEffect(() => {
    const fetchDriverDetails = async () => {
      const token = await getToken();
      const driverDetails = await getDriverDetails(token);
      setDriverDetails(driverDetails);
    };
    fetchDriverDetails();
  }, []);

  useEffect(() => {
    const fetchAssignedOrders = async () => {
      if (!driverDetails) return; // Wait for driverDetails to be loaded
      try {
        const token = await getToken();
        if (!token) return;

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get(`/orders/driver/${driverDetails.id}/delivered-orders`);
        setOrders(res.data);
      } catch (err) {
        Alert.alert('Notice', err.response?.data?.detail || 'Could not fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedOrders();
  }, [driverDetails]); // <-- depend on driverDetails

  return (
    <LinearGradient colors={['#a8e6cf', '#dcedc1']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Completed Deliveries</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4caf50" style={{ marginTop: 32 }} />
        ) : orders.length === 0 ? (
          <Text style={styles.emptyText}>No assigned orders found.</Text>
        ) : (
          orders.map((order) => (
            <TouchableOpacity key={order.id} style={styles.card}  onPress={() => router.push({ pathname: '/driver/orders/[id]', params: { orderId: order.id } })}>
              <Text style={styles.cardTitle}>Order #{order.id}</Text>
              <Text style={styles.cardText}>Customer: {order.customer_name}</Text>
              <Text style={styles.cardText}>Address: {order.destination_address}</Text>
              <Text style={styles.cardText}>Delivery Status: {order.delivery_status}</Text>
              <Text style={styles.cardText}>Payment Status: {order.payment_status}</Text>
               <Text style={styles.cardText}>Payment Method: {order.payment_method}</Text>
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
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginTop: 40,
  },
});
