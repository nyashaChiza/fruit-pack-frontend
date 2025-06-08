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
import api from '../lib/api';
import { getToken } from '../lib/auth';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

const { width } = Dimensions.get('window');

const bannerImages = [
  'https://img.freepik.com/premium-vector/fresh-fruit-sale-banner-design_1302-28371.jpg',
  'https://img.freepik.com/premium-vector/tropical-fruits-sale-banner-template_1302-28418.jpg',
];

const fruits = [
  {
    id: '1',
    name: 'Orange',
    price: '$1.10',
    image: 'https://images.immediate.co.uk/production/volatile/sites/30/2020/02/oranges-08c4fda.jpg',
  },
  {
    id: '2',
    name: 'Mango',
    price: '$2.50',
    image: 'https://www.google.com/imgres?q=mango&imgurl=https%3A%2F%2Fexoticfruitbox.com%2Fwp-content%2Fuploads%2F2015%2F10%2Fmango.jpg&imgrefurl=https%3A%2F%2Fexoticfruitbox.com%2Fen%2Ftropical-fruits%2Fmangoes%2F&docid=cjBU-vyqYdy6vM&tbnid=1-wEslCr-8F5NM&vet=12ahUKEwjYnLysyeGNAxXVUaQEHZblMugQM3oECFYQAA..i&w=500&h=500&hcb=2&ved=2ahUKEwjYnLysyeGNAxXVUaQEHZblMugQM3oECFYQAA',
  },
];

export default function Home() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [token, setToken] = useState<string | null>(null);

  // Fetch token once on mount
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
  console.log('Token:', token); // Debugging line to check token value

  // Fetch categories when token is available
  useEffect(() => {
    if (!token) return; // Prevent calling API without token

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
  }, [token]); // ✅ token is now a dependency

  const handleFruitPress = (fruitId: string) => {
    router.push(`/fruit/${fruitId}`);
  };

  const renderFruitItem = ({ item }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => handleFruitPress(item.id)}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
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
          <Text style={styles.navText}>🏠 Home</Text>
          <Text style={styles.navText}>🛒 Cart</Text>
          <Text style={styles.navText}>👤 Profile</Text>
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
    paddingVertical: 12,
    borderTopColor: '#ddd',
    borderTopWidth: 1,
  },
  navText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
});
