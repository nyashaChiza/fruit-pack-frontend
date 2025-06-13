import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
  Dimensions,
} from 'react-native';
import api from '../../lib/api';
import { getToken, logout } from '../../lib/auth';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

const { width } = Dimensions.get('window');

const bannerImages = [
  'https://img.freepik.com/premium-vector/fresh-fruit-sale-banner-design_1302-28371.jpg',
  'https://img.freepik.com/premium-vector/tropical-fruits-sale-banner-template_1302-28418.jpg',
];

export default function Home() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [fruits, setFruits] = useState([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        const savedToken = await getToken();
        setToken(savedToken);
      } catch (err) {
        console.error('Error fetching token:', err);
      }
    }
    fetchToken();
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchCategories = async () => {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get('/categories/');
        setCategories(res.data);
      } catch (err: any) {
        console.error('Error fetching categories:', err.response?.data || err.message);
      }
    };

    fetchCategories();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchFruits = async () => {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get('/products/');
        setFruits(res.data);
      } catch (err: any) {
        console.error('Error fetching fruits:', err.response?.data || err.message);
      }
    };

    fetchFruits();
  }, [token]);

  const handleFruitPress = (item) => {
    router.push({
      pathname: 'screens/details/[id]',
      params: { id: item.id },
    });
  };

  const renderFruitItem = ({ item }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => handleFruitPress(item)}>
      <Image source={{ uri: item.image_url }} style={styles.productImage} />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price?.toFixed(2)}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.searchBox}>
            <TextInput
              placeholder="Search fruits..."
              placeholderTextColor="#4CAF50"
              style={styles.searchInput}
            />
          </View>
          <Image
            source={{ uri: 'https://i.pravatar.cc/300' }}
            style={styles.avatar}
          />
        </View>

        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.banner}>
          {bannerImages.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.bannerImage} />
          ))}
        </ScrollView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(cat => (
              <View key={cat.id} style={styles.categoryCard}>
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={styles.categoryText}>{cat.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Fruits</Text>
          <FlatList
            data={fruits}
            renderItem={renderFruitItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => router.push('/screens/home')}>
            <Text style={styles.navText}>🏠 Home</Text>
          </TouchableOpacity>
          <Text style={styles.navText}>🛒 Cart</Text>
          <TouchableOpacity
            onPress={async () => {
              await logout();
              router.replace('/screens/login');
            }}
          >
            <Text style={styles.navText}>👤 Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e8f5e9',
  },
  container: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBox: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    fontSize: 16,
    color: '#2e7d32',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  banner: {
    marginBottom: 24,
  },
  bannerImage: {
    width: width - 32,
    height: 160,
    borderRadius: 16,
    marginRight: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1b5e20',
    marginBottom: 12,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginRight: 12,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#1b5e20',
    fontWeight: '500',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  productImage: {
    width: 100,
    height: 100,
  },
  productDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32',
  },
  productDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#2f332e',
  },
  productPrice: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
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
