import React, { useContext, useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CartContext } from '../../lib/CartContext';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../lib/api';
import { getToken, logout } from '../../lib/auth';
import { useStripe } from '@stripe/stripe-react-native';
import * as Font from 'expo-font';
import * as Location from 'expo-location';

export default function CheckoutScreen() {
  const { cartItems, clearCart } = useContext(CartContext);
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'cash' | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationError, setLocationError] = useState('');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
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
      setLatitude(latitude);
      setLongitude(longitude);
    } catch (error) {
      Alert.alert('Error', 'Failed to get location.');
    }
  };


  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    })();
  }, []);

  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      if (url.includes('orders')) {
        Alert.alert('✅ Payment Completed via Redirect');
        router.replace('/screens/orders');
      }
    };
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    Font.loadAsync({
      MyFont: require('../static/fonts/Inter-VariableFont_opsz,wght.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  const handlePlaceOrder = async () => {
    if (!name || !address || !phone || !selectedMethod) {
      Alert.alert('Missing Info', 'Please fill in all fields and select a payment method.');
      return;
    }
    if (!latitude || !longitude) {
      Alert.alert('Location Required', 'Please select your delivery location on the map.');
      return;
    }


    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Unauthorized', 'Please log in first.');
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // For now, latitude and longitude are set to 0. Replace with real values if available.
      const payload = {
        full_name: name,
        address,
        latitude,
        longitude,
        phone,
        payment_method: selectedMethod,
        items: cartItems.map(item => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const response = await api.post('cart/checkout/', payload);
      const { order_id, client_secret, amount } = response.data;

      if (selectedMethod === 'card') {
        const init = await initPaymentSheet({
          paymentIntentClientSecret: client_secret,
          returnURL: 'fruitpack://orders'
        });

        if (init.error) throw new Error(init.error.message);

        const result = await presentPaymentSheet();
        if (result.error) {
          Alert.alert('Payment Failed', result.error.message);
          return;
        }

        Alert.alert('✅ Payment Successful', `Order ID: ${order_id}`);
      } else {
        Alert.alert('✅ Order Created', `Order ID: ${order_id}`);
      }

      clearCart();
      router.replace('/screens/orders');
    } catch (err: any) {
      console.error('Checkout error:', err.response?.data || err.message);
      Alert.alert('❌ Error', err.response?.data?.detail || 'Something went wrong.');
    }
  };

  if (!fontsLoaded) return null;

  return (
    <LinearGradient colors={['#a8e6cf', '#dcedc1']} style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>Checkout</Text>

          <View style={styles.card}>
            <Text style={styles.subHeader}>Order Summary</Text>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemText}>
                  {item.name} × {item.quantity}
                </Text>
                <Text style={styles.itemText}>R{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Total:</Text>
              <Text style={styles.totalText}>R{total.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.subHeader}>Shipping Information</Text>
            <TextInput
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Shipping Address"
              value={address}
              onChangeText={setAddress}
              style={styles.input}
            />
            <TextInput
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <View style={[styles.card, { height: 300 }]}>
            <Text style={styles.subHeader}>Tap to Set Your Location</Text>
            {latitude && longitude ? (
              <>
                {/* Map placeholder or preview */}
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#777', marginBottom: 8 }}>
                    Latitude: {latitude?.toFixed(5)}, Longitude: {longitude?.toFixed(5)}
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#4caf50',
                      padding: 12,
                      borderRadius: 10,
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                    onPress={shareLiveLocation}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Share Live Location</Text>
                  </TouchableOpacity>
                  <Text style={{ color: '#888', fontSize: 12 }}>
                    (Tap to update your current location)
                  </Text>
                </View>
              </>
              // <MapView
              //   style={{ flex: 1, borderRadius: 12 }}
              //   initialRegion={{
              //     latitude,
              //     longitude,
              //     latitudeDelta: 0.01,
              //     longitudeDelta: 0.01,
              //   }}
              //   onPress={(e) => {
              //     const { latitude, longitude } = e.nativeEvent.coordinate;
              //     setLatitude(latitude);
              //     setLongitude(longitude);
              //   }}
              // >
              //   <Marker coordinate={{ latitude, longitude }} />
              // </MapView>
            ) : (
              <Text style={{ color: '#777' }}>{locationError || 'Loading map...'}</Text>
            )}
          </View>


          <View style={styles.card}>
            <Text style={styles.subHeader}>Select Payment Method</Text>
            {['card', 'cash'].map(method => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentOption,
                  selectedMethod === method && styles.paymentOptionSelected,
                ]}
                onPress={() => setSelectedMethod(method as any)}
              >
                <Text style={styles.paymentText}>{method.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={handlePlaceOrder}>
            <Text style={styles.confirmButtonText}>Place Order</Text>
          </TouchableOpacity>

          
        </ScrollView>

        {/* Fixed Bottom Navigation */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 160, // room for nav
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2e7d32',
  },
  card: {
    backgroundColor: '#ffffffdd',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b5e20',
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#9e9e9e',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  paymentOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    marginVertical: 6,
    alignItems: 'center',
  },
  paymentOptionSelected: {
    borderColor: '#4caf50',
    backgroundColor: '#e8f5e9',
  },
  paymentText: {
    fontSize: 16,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 15,
    left: 6,
    right: 6,
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
