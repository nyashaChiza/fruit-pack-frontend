// screens/driver/Home.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getToken,getUserDetails, getDriverDetails,logout } from '../../lib/auth';
import api from '../../lib/api';
import { useRouter } from 'expo-router';
import * as Font from 'expo-font';
import * as Location from 'expo-location';

export default function DriverHomeScreen() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [online, setOnline] = useState(true);
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [driverDetails, setDriverDetails] = useState<any>(null);

    // Fetch user details and token on mount
    useEffect(() => {
        const fetchUserDetails = async () => {  
            const savedToken = await getToken();
            setUserDetails(await getUserDetails(savedToken));
        };
        fetchUserDetails();
    }, []);

    // Fetch driver details on mount
    useEffect(() => {
        const fetchDriverDetails = async () => {
            const savedToken = await getToken();
            setToken(savedToken);
            const driver = await getDriverDetails(savedToken);
            setDriverDetails(driver);
        };
        fetchDriverDetails();
    }, []);


    useEffect(() => {
        const fetchToken = async () => {
        const savedToken = await getToken();
        setToken(savedToken);
        };
        fetchToken();
    }, []);

  useEffect(() => {
    Font.loadAsync({
      'MyFont': require('../static/fonts/Inter-VariableFont_opsz,wght.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

const handleToggleAvailability = async () => {
    const newStatus = online ? 'offline' : 'available';
    setOnline(!online);
    try {
        if (driverDetails?.id) {
            const token = await getToken();
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            await api.patch(`/drivers/${driverDetails.id}/status`, { status: newStatus });
        }
    } catch (err: any) {
        Alert.alert('Error', err?.response?.data?.detail || 'Failed to update status');
        setOnline(online); // revert on error
    }
};

  const shareLiveLocation = async () => {
    try {
      // Ask for location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to share your live location.');
        return;
      }

      // Get current location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Get token for authorization
      const token = await getToken();
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Post location to the API
      await api.post(`/drivers/driver/${driverDetails.id}/location`, { latitude, longitude });

      Alert.alert('Success', 'Live location shared!');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to share location');
    }
  };

  const Card = ({ title, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={['#a8e6cf', '#dcedc1']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Welcome, {userDetails?.full_name || ''}</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusText}>
                {driverDetails?.status === 'busy'
                  ? '🟡 Busy'
                  : driverDetails?.status === 'available'
                  ? '🟢 Available'
                  : '🔴 Offline'}
              </Text>
              <Switch value={online} onValueChange={handleToggleAvailability} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Your Tasks</Text>

          <Card title="📦 Assigned Orders" onPress={() => router.push('/driver/assignedOrders')} />
          <Card title="🆓 Available Orders" onPress={() => router.push('/driver/unassignedOrders')} />
          <Card title="✅ Completed Deliveries" onPress={() => router.push('/driver/deliveries')} />
          <Card title="📥 Order Claims" onPress={() => router.push('/driver/orderClaims')} />
          <Card title="📍 Share Live Location" onPress={shareLiveLocation} />
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity
            onPress={async () => {
              await logout();
              router.replace('/screens/login');
            }}
          >
            <Text style={styles.navText}>👤 Logout</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1b5e20',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statusText: {
    marginRight: 8,
    fontSize: 16,
    color: '#2e7d32',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffffdd',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1b5e20',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    alignItems: 'center',
    borderTopColor: '#ccc',
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
