import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../../lib/api';
import { getToken, getDriverDetails, logout } from '../../lib/auth';

export default function DriverClaims() {
  const [claims, setClaims] = useState([]);
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
    const fetchClaims = async () => {
      if (!driverDetails) return; // Wait for driverDetails to be loaded
      try {
        const token = await getToken();
        if (!token) return;

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get(`/claims/driver/${driverDetails.id}/claims`);
        setClaims(res.data);
      } catch (err) {
        Alert.alert('Notice', err.response?.data?.detail || 'Could not fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [driverDetails]); // <-- depend on driverDetails

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <LinearGradient colors={['#a8e6cf', '#dcedc1']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Claims</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4caf50" style={{ marginTop: 32 }} />
        ) : claims.length === 0 ? (
          <Text style={styles.emptyText}>No claims found.</Text>
        ) : (
          claims.map((claim) => (
            <TouchableOpacity key={claim.id} style={styles.card} >
              <Text style={styles.cardTitle}>Claim #{claim.id}</Text>
              <Text style={styles.cardText}>Customer: {claim.order_id}</Text>
              <Text style={styles.cardText}>Address: {claim.status}</Text>
              <Text style={styles.cardText}>created: {new Date(claim.created).toLocaleString()}</Text>
              
            </TouchableOpacity>
          ))
        )}
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
      </ScrollView>
    </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        paddingBottom: 100,
        paddingTop: 0,
        minHeight: '100%',
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
    navText: {
        fontSize: 16,
        color: '#4CAF50',
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
});
