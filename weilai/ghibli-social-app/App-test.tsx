import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SimpleSoulPickupTest from './src/components/SimpleSoulPickupTest';

/**
 * 快速测试版本 - 简化SoulPickupAnimation测试
 * 直接运行即可测试动画效果和色彩方案
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <SimpleSoulPickupTest />
      <StatusBar style="light" backgroundColor="transparent" translucent />
    </SafeAreaProvider>
  );
}