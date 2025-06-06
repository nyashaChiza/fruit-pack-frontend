// app/(auth)/signup.tsx
import { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import api from '../lib/api';
import { saveToken } from '../lib/auth';
import { router } from 'expo-router';



export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSignup() {
    try {
      const res = await api.post('/signup', { email, password });
      await saveToken(res.data.token);
      router.replace('/');
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Signup</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} />
      <Button title="Sign up" onPress={handleSignup} />
    </View>
  );
}
