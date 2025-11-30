import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TestScreen } from './src/screens/TestScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <TestScreen />
      <StatusBar style="light" backgroundColor="transparent" translucent />
    </SafeAreaProvider>
  );
}