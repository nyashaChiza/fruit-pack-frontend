import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import api from '../../../lib/api';
import { getToken } from '../../../lib/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../../../lib/CartContext';
import * as Font from 'expo-font';

export default function FruitDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingImage, setLoadingImage] = useState(true);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { addToCart } = useCart();


  // Fetch user token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const savedToken = await getToken();
        setToken(savedToken);
      } catch (err) {
        console.error('Error fetching token:', err);
      }
    };
    fetchToken();
  }, []);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!token || !id) return;

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err: any) {
        console.error(`Error fetching product with ID ${id}:`, err?.response?.data || err.message);
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [token, id]);

  // Download product image to local cache
  useEffect(() => {
    const fetchImage = async () => {
      if (!token || !product?.image) {
        return;
      }

      try {
        const imageUrl = `${api.defaults.baseURL}products/images/${product.image}`;
        const localUri = `${FileSystem.cacheDirectory}${product.image}`;

        const { uri } = await FileSystem.downloadAsync(imageUrl, localUri, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'image/*',
          },
        });

        setLocalImageUri(uri);
      } catch (err: any) {
        console.error('Error downloading image:', err?.message || err);
        setLocalImageUri(null); // fallback
      } finally {
        setLoadingImage(false);
      }
    };

    fetchImage();
  }, [token, product?.image]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_name: product.image_name,
    });
    Alert.alert(`${product.name} added to cart!`);
  };

  // Load custom fonts
  useEffect(() => {
    Font.loadAsync({
      'MyFont': require('../../static/fonts/Inter-VariableFont_opsz,wght.ttf'), // adjust path as needed
    }).then(() => setFontsLoaded(true));
  }, []);

  // Show loading screen
  if (loadingProduct || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4caf50" />
      </View>
    );
  }

  // Show error if product not found
  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#fff' }}>Product not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#a8e6cf", "#dcedc1"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {loadingImage ? (
          <ActivityIndicator size="large" color="#4caf50" style={{ height: 300 }} />
        ) : localImageUri ? (
          <Image source={{ uri: localImageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#666' }}>Image not available</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>R{Number(product.price).toFixed(2)}</Text>
          

          {product.discount && (
            <Text style={styles.discount}>
              {Number(product.discount) * 100}% OFF
            </Text>
          )}

          <Text style={styles.description}>{product.description}</Text>
          <Text style={styles.category}>{product.category_name}</Text>

          <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
            <Text style={styles.cartButtonText}>🛒 Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#a8e6cf',
  },
  image: {
    width: '100%',
    height: 300,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: '#e0f2f1',
  },
  card: {
    backgroundColor: '#ffffffdd',
    marginTop: 34, // 👈 this pulls the card *up* over the image
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
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
  },
  category: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f241e',
    marginBottom: 16,
  },
  cartButton: {
    backgroundColor: '#4caf50',
    padding: 14,
    borderRadius: 16,
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
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '700',
  },
});
