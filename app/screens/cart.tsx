import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { useCart } from '../../lib/CartContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../../lib/api';

export default function CartScreen() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load custom fonts
  useEffect(() => {
    Font.loadAsync({
      'MyFont': require('../static/fonts/Inter-VariableFont_opsz,wght.ttf'), // adjust path as needed
    }).then(() => setFontsLoaded(true));
  }, []);

  const handleCheckout = () => {
    router.push('screens/checkout');
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!fontsLoaded) return null;

  return (
    <LinearGradient colors={["#a8e6cf", "#dcedc1"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>🛒 Your Cart</Text>

        {cart.length === 0 ? (
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        ) : (
          cart.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image
                source={{ uri: `${api.defaults.baseURL}/products/images/${item.image_name}` }}
                style={styles.image}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>R{item.price.toFixed(2)}</Text>

                <View style={styles.controls}>
                  <TouchableOpacity
                    onPress={() =>
                      updateQuantity(item.id, Math.max(item.quantity - 1, 1))
                    }
                    style={styles.qtyButton}
                  >
                    <Text style={styles.qtyText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyCount}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    style={styles.qtyButton}
                  >
                    <Text style={styles.qtyText}>+</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => removeFromCart(item.id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>🗑 Remove Item</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {cart.length > 0 && (
        <View style={styles.checkoutCard}>
          <Text style={styles.total}>Total: R{total.toFixed(2)}</Text>

          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back </Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 120, // for bottom card space
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 32,
  },
  card: {
    backgroundColor: '#ffffffdd',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1b5e20',
  },
  price: {
    fontSize: 16,
    color: '#388e3c',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  qtyButton: {
    backgroundColor: '#c8e6c9',
    padding: 10,
    borderRadius: 10,
    width: 40,
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2e7d32',
  },
  qtyCount: {
    marginHorizontal: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#f44336',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  checkoutCard: {
    position: 'absolute',
    bottom: 0,
    width,
    backgroundColor: '#ffffffee',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  total: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 10,
    textAlign: 'center',
  },
  checkoutButton: {
    backgroundColor: '#4caf50',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: '#9e9e9e',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
