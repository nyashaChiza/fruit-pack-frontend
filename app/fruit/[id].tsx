import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const FruitDetailScreen = () => {
  const router = useRouter();
  const {
    name = 'Apple',
    price = '$1.20',
    supplier = 'Green Farm',
    discount = '10%',
    createdAt = '2025-06-01',
    imageUrl = 'https://domf5oio6qrcr.cloudfront.net/medialibrary/11525/0a5ae820-7051-4495-bcca-61bf02897472.jpg',
    supplierUrl = 'https://example.com/supplier',
  } = useLocalSearchParams();

  return (
    <LinearGradient
      colors={['#c8decb', '#234027']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Image Card */}
          <View style={styles.imageCard}>
            <Image source={{ uri: imageUrl }} style={styles.image} />
          </View>

          {/* Info Card */}
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.meta}>Created: {createdAt}</Text>
            <Text style={styles.detail}>Price: {price}</Text>
            <Text style={styles.detail}>Discount: {discount}</Text>
            <Text style={styles.detail}>Supplier: {supplier}</Text>

            {/* Visit Supplier */}
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => Linking.openURL(supplierUrl)}
            >
              <Text style={styles.linkButtonText}>Visit Supplier</Text>
            </TouchableOpacity>

            {/* Add to Cart */}
            <TouchableOpacity style={styles.cartButton}>
              <Text style={styles.cartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  backButton: {
    marginTop: 16,
    marginLeft: 16,
  },
  backText: {
    fontSize: 16,
    color: '#2e7d32',
  },
  imageCard: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#ffffffcc', // semi-transparent white
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  detail: {
    fontSize: 18,
    color: '#2e7d32',
    marginBottom: 8,
  },
  linkButton: {
    backgroundColor: '#c8e6c9',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#004d40',
    fontSize: 16,
    fontWeight: '600',
  },
  cartButton: {
    backgroundColor: '#2e7d32',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FruitDetailScreen;
