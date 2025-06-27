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
import { getToken } from '../../lib/auth';
import { useStripe } from '@stripe/stripe-react-native';

export default function CheckoutScreen() {
  const { cartItems, clearCart } = useContext(CartContext);
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'cash' | 'paypal' | null>(null);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // ✅ Deep link listener for Stripe returnURL
  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      if (url.includes('checkout-complete')) {
        Alert.alert('✅ Payment Completed via Redirect');
        router.replace('/screens/home'); // Optional redirect after payment
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);
  const handlePlaceOrder = async () => {
    if (!name || !address || !phone || !selectedMethod) {
      Alert.alert('Missing Info', 'Please fill in all fields and select a payment method.');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Unauthorized', 'Please log in first.');
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const payload = {
        full_name: name,
        address,
        phone,
        payment_method: selectedMethod,
        items: cartItems.map(item => ({
          product_id: item.id,
          price: item.price,
          quantity: item.quantity,
        })),
      };

      const response = await api.post('cart/checkout/', payload);
      const { order_id, client_secret, amount } = response.data;

      if (selectedMethod === 'card') {
        const init = await initPaymentSheet({ paymentIntentClientSecret: client_secret, returnURL: 'fruitpack://order' });

        if (init.error) {
          throw new Error(init.error.message);
        }

        const result = await presentPaymentSheet();

        if (result.error) {
          Alert.alert('Payment Failed', result.error.message);
          return;
        }

        Alert.alert('✅ Payment Successful', `Order ID: ${order_id}\nTotal: $${amount}`);
      } else {
        Alert.alert('✅ Order Created', `Order ID: ${order_id}\nTotal: $${amount}`);
      }

      clearCart();
      router.replace('/screens/home');
    } catch (err: any) {
      console.error('Checkout error:', err.response?.data || err.message);
      Alert.alert('❌ Error', err.response?.data?.detail || 'Something went wrong.');
    }
  };

  return (
    <LinearGradient colors={['#a8e6cf', '#dcedc1']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Checkout</Text>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.subHeader}>Order Summary</Text>
          {cartItems.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemText}>{item.name} × {item.quantity}</Text>
              <Text style={styles.itemText}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalText}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Shipping Info */}
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

        {/* Payment Method */}
        <View style={styles.card}>
          <Text style={styles.subHeader}>Select Payment Method</Text>
          {['card', 'cash', 'paypal'].map((method) => (
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

        {/* Confirm Order */}
        <TouchableOpacity style={styles.confirmButton} onPress={handlePlaceOrder}>
          <Text style={styles.confirmButtonText}>Place Order</Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 80,
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
});
// This code defines a CheckoutScreen component that allows users to review their cart items, enter shipping information, select a payment method, and place an order. It uses the Stripe API for card payments and handles errors gracefully. The UI is styled with React Native's StyleSheet and includes a linear gradient background for aesthetics.
// The component also integrates with a CartContext to manage cart state and uses Expo Router for navigation