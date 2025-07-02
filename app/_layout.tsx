import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useFonts, Poppins_400Regular } from '@expo-google-fonts/poppins';
import { CartProvider } from '../lib/CartContext';
import { StripeProvider } from '@stripe/stripe-react-native';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RdCtN3kUzyeaRBl78k621VUBkmeaOl8yqzwpTaKdNWkTP4RoKfc5X07fSrV9fnESdxR67nAnZ3KmEMCq3k3oH7e00YyRLb5VV';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    MyFont: require('../app/static/fonts/Inter-VariableFont_opsz,wght.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.fruitpack"
      urlScheme="fruitpack"
    >
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </CartProvider>
    </StripeProvider>
  );
}
