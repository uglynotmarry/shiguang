import React from 'react';
import { Platform } from 'react-native';
import SimpleSoulSphereAndroid from './src/screens/SimpleSoulSphereAndroid';
import SoulSphereInterface from './src/components/SoulSphereInterface';

export default function App() {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return <SimpleSoulSphereAndroid />;
  }
  return <SoulSphereInterface />;
}