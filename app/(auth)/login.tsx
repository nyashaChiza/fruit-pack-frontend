// app/(auth)/login.tsx
import { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import api from '../lib/api';
import { saveToken } from '../lib/auth';
import { useRouter } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleLogin() {
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.access_token;
      await saveToken(token);
      router.replace('/home'); // Redirect after login
    } catch (err: any) {
      Alert.alert('Login failed', err?.response?.data?.detail || 'Unknown error');
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Email</Text>
      <TextInput onChangeText={setEmail} value={email} autoCapitalize="none" style={{ borderWidth: 1 }} />
      <Text>Password</Text>
      <TextInput onChangeText={setPassword} value={password} secureTextEntry style={{ borderWidth: 1 }} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
