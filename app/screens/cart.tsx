import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const initialCartItems = [
  {
    id: '1',
    name: 'Apple',
    price: 1.2,
    quantity: 2,
    supplier: 'Green Farm',
  },
  {
    id: '2',
    name: 'Banana',
    price: 0.8,
    quantity: 3,
    supplier: 'Tropical Fruits Co.',
  },
];

const CartScreen = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const incrementQty = (id) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQty = (id) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    Alert.alert('Checkout', `Total amount: $${getTotal().toFixed(2)}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.supplier}>Supplier: {item.supplier}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)} each</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => decrementQty(item.id)}
          style={styles.qtyBtn}
        >
          <Text style={styles.qtyBtnText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.quantity}>{item.quantity}</Text>

        <TouchableOpacity
          onPress={() => incrementQty(item.id)}
          style={styles.qtyBtn}
        >
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subtotalContainer}>
        <Text style={styles.subtotal}>
          ${(item.price * item.quantity).toFixed(2)}
        </Text>
        <TouchableOpacity
          onPress={() => removeItem(item.id)}
          style={styles.removeBtn}
        >
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#e0ffe9', '#a8e6cf', '#dcedc8']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Your Cart</Text>

        {cartItems.length === 0 ? (
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        ) : (
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        )}

        <View style={styles.footer}>
          <Text style={styles.totalText}>Total: ${getTotal().toFixed(2)}</Text>

          <TouchableOpacity
            style={[styles.checkoutBtn, cartItems.length === 0 && styles.disabledBtn]}
            onPress={handleCheckout}
            disabled={cartItems.length === 0}
          >
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
header: {
  fontSize: 32, // Slightly larger for emphasis
  fontFamily: 'Poppins_700Bold',
  color: '#1a4730', // Slightly deeper green for sophistication
  marginBottom: 24,
  textAlign: 'center', // Center aligns for balance
  letterSpacing: 0.5, // Improves readability
  textTransform: 'uppercase', // Optional: for stronger branding
},

  list: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#b5f7cd',
    borderRadius: 12,
    padding: 16,
    margin:15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  info: {
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#1b5e20',
  },
  supplier: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#2e7d32',
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#2e7d32',
    marginTop: 6,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  qtyBtn: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  qtyBtnText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
  },
  quantity: {
    marginHorizontal: 16,
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#1b5e20',
  },
  subtotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtotal: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#1b5e20',
  },
  removeBtn: {
    backgroundColor: '#e57373',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  removeText: {
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: '#d0f0e8',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 5,
  },
  totalText: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#00695c',
    marginBottom: 12,
  },
  checkoutBtn: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    paddingHorizontal: 100,
    borderRadius: 10,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
  disabledBtn: {
    backgroundColor: '#a5d6a7',
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Poppins_400Regular',
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default CartScreen;
