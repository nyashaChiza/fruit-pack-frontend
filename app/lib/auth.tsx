// lib/auth.ts
import api from './api';
import * as SecureStore from 'expo-secure-store';

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  await SecureStore.setItemAsync('token', res.data.access_token);
}

export async function signup(email: string, password: string) {
  const res = await api.post('/auth/signup', { email, password });
  await SecureStore.setItemAsync('token', res.data.access_token);
}

export async function logout() {
  await SecureStore.deleteItemAsync('token');
}

export async function getToken() {
  return await SecureStore.getItemAsync('token');
}

export async function saveToken(token: string) {
    await SecureStore.setItemAsync('token', token);   
}