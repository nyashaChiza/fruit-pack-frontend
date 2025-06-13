// components/GradientBackground.tsx
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

const GradientBackground = ({ children, style }: Props) => {
  return (
    <LinearGradient
      colors={['#4dd179', '#1abc9c']}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
});

export default GradientBackground;
