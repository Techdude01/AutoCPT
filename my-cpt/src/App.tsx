import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CPTRecorder } from './components/CPTRecorder';

export default function App() {
  return (
    <View style={styles.container}>
      <CPTRecorder />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Adjust this to match your theme's background
    padding: 16,              // Replace the padding from your Tailwind classes
  },
}); 