import { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { login } from '../../lib/auth';
import { useRouter } from 'expo-router';

// === Reusable theme ===
const theme = {
  colors: {
    primary: '#4dd179',
    background: '#f0fdf4',
    textDark: '#2f855a',
    textLight: '#888',
    card: 'rgba(255, 255, 255, 0.95)',
  },
  spacing: {
    input: 12,
    cardPadding: 24,
    marginBottom: 16,
  },
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    try {
      setLoading(true);
      if (!username || !password) {
        Alert.alert('Username and password are required');
        setLoading(false);
        return;
      }
      const token = await login(username, password);

      Alert.alert('Login successful', 'Welcome back!');
      router.replace('/screens/home');
    } catch (err: any) {
      Alert.alert('Login failed', err?.response?.data?.detail || 'Unknown error');
      // Stay on login page; optionally, you can reset fields or highlight errors here
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.overlay} />

      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={theme.colors.textLight}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={theme.colors.textLight}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.BackButton]}
          onPress={() => router.push('/')}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: theme.spacing.cardPadding,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.input,
    borderRadius: 10,
    marginBottom: theme.spacing.marginBottom,
    fontSize: 16,
    color: '#222',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  BackButton: {
    backgroundColor: '#d3dbd7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
