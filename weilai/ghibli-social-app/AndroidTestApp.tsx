import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MainScreen from './src/screens/MainScreen';
import TestScreen from './src/screens/TestScreen';

/**
 * Android 测试专用入口组件
 * 提供快速切换测试不同功能模块
 */
const AndroidTestApp = () => {
  const [testMode, setTestMode] = React.useState<'main' | 'soul-pickup' | 'time-post'>('main');

  const renderTestMode = () => {
    switch (testMode) {
      case 'main':
        return <MainScreen />;
      case 'soul-pickup':
        return <TestScreen />;
      case 'time-post':
        return (
          <View style={styles.container}>
            <Text style={styles.title}>🕐 时光邮局测试模式</Text>
            <Text style={styles.description}>时光邮局功能集成在发布界面中</Text>
            <Text style={styles.instruction}>请通过底部导航栏的 "+" 按钮访问</Text>
          </View>
        );
      default:
        return <MainScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {/* 测试模式切换器 */}
      <View style={styles.testModeSelector}>
        <Text style={styles.selectorTitle}>🧪 Android 测试模式</Text>
        <View style={styles.buttonRow}>
          <Text 
            style={[styles.modeButton, testMode === 'main' && styles.activeButton]}
            onPress={() => setTestMode('main')}
          >
            🏠 主界面
          </Text>
          <Text 
            style={[styles.modeButton, testMode === 'soul-pickup' && styles.activeButton]}
            onPress={() => setTestMode('soul-pickup')}
          >
            ✨ 灵魂拾取
          </Text>
          <Text 
            style={[styles.modeButton, testMode === 'time-post' && styles.activeButton]}
            onPress={() => setTestMode('time-post')}
          >
            🕐 时光邮局
          </Text>
        </View>
      </View>

      {/* 主要内容区域 */}
      <View style={styles.contentArea}>
        {renderTestMode()}
      </View>

      {/* 测试提示 */}
      <View style={styles.testTips}>
        <Text style={styles.tipsTitle}>📱 Android 测试提示</Text>
        <Text style={styles.tip}>• 长按卡片 800ms 触发灵魂拾取动画</Text>
        <Text style={styles.tip}>• 观察粒子效果和光晕动画</Text>
        <Text style={styles.tip}>• 测试不同情绪类型的色彩方案</Text>
        <Text style={styles.tip}>• 验证时光邮局功能完整性</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  testModeSelector: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  activeButton: {
    backgroundColor: '#7dd3c0',
    color: '#ffffff',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  testTips: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  tip: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    color: '#7dd3c0',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default AndroidTestApp;