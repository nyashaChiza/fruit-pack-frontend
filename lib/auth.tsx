// lib/auth.ts
import api from './api';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { jwtDecode } from "jwt-decode"


export async function login(username: string, password: string): Promise<string> {
  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');

    const response = await api.post('/auth/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const token = response.data?.access_token;
    if (!token) {
      throw new Error('No access token returned from API.');
    }

    if (Platform.OS === 'web') {
      localStorage.setItem('token', token);
    } else {
      await SecureStore.setItemAsync('token', token);
    }
    return token;
  } catch (error: any) {
    console.error('Login failed:', error?.response?.data || error.message);
    throw new Error(error?.response?.data?.detail || 'Login failed. Please try again.');
  }
}


export async function signup(email: string, password: string) {
  const res = await api.post('/auth/signup', { email, password });
  await SecureStore.setItemAsync('token', res.data.access_token);
}

export async function logout() {
  await SecureStore.deleteItemAsync('token');
}

export const getToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync('token'); 
    return token;
  } catch (error) {
    console.error('SecureStore error:', error);
    return null;
  }
};

export async function saveToken(token: string) {
  await SecureStore.setItemAsync('token', token); // ✅ Correct usage
}

export function getUserId(token: string): string | null {
  try {
    const decoded = jwtDecode(token);
    return decoded.sub || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

export async function getUserDetails(token: string) {
  const userId = getUserId(token);
  if (!userId) {
    throw new Error('Invalid token: could not extract user ID.');
  }
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user details:', error?.response?.data || error.message);
    throw new Error(error?.response?.data?.detail || 'Failed to fetch user details.');
  }
}


export async function getDriverDetails(token: string) {
  const userId = getUserId(token);
  if (!userId) {
    throw new Error('Invalid token: could not extract user ID.');
  }
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get(`/drivers/user/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching driver details:', error?.response?.data || error.message);
    throw new Error(error?.response?.data?.detail || 'Failed to fetch driver details.');
  }
}