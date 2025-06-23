import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function FruitDetail() {
  const {
    name,
    price,
    discount,
    description,
    supplier,
    imageUrl,
    supplierUrl,
    createdAt,
  } = useLocalSearchParams();

  const router = useRouter();

  const handleVisitSupplier = async () => {
    if (supplierUrl) {
      const supported = await Linking.canOpenURL(String(supplierUrl));
      if (supported) {
        await Linking.openURL(String(supplierUrl));
      } else {
        Alert.alert("Can't open the supplier URL");
      }
    }
  };

  const handleAddToCart = () => {
    // You may want to add this to a global cart store or backend here
    Alert.alert(`${name} added to cart!`);
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: String(imageUrl) }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.price}>${Number(price).toFixed(2)}</Text>
        {discount && (
          <Text style={styles.discount}>
            {Number(discount) * 100}% OFF
          </Text>
        )}
        <Text style={styles.description}>{description}</Text>

        <Text style={styles.label}>Supplier</Text>
        <Text style={styles.supplier}>{supplier}</Text>

        <TouchableOpacity style={styles.linkButton} onPress={handleVisitSupplier}>
          <Text style={styles.linkButtonText}>🌐 Visit Supplier</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
          <Text style={styles.cartButtonText}>🛒 Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>🔙 Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e8f5e9',
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    color: '#388e3c',
    marginBottom: 4,
  },
  discount: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#777',
    marginTop: 8,
  },
  supplier: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  linkButton: {
    backgroundColor: '#81c784',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  linkButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  cartButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  cartButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#c8e6c9',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#2e7d32',
  },
});
