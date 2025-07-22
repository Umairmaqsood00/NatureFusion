import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function BackgroundGradient() {
  return (
    <LinearGradient
      colors={['#232526', '#0f2027', '#2c5364', '#1a2980']}
      start={{ x: 0.1, y: 0.2 }}
      end={{ x: 0.9, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );
} 