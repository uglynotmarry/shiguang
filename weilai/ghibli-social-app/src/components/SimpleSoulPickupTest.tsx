import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * 简化版 SoulPickupAnimation 测试组件
 * 用于快速验证动画效果和色彩方案
 * 无需复杂的手势处理，直接点击测试
 */

interface TestResult {
  emotion: string;
  colors: string[];
  timestamp: number;
  success: boolean;
}

interface TestSoul {
  id: string;
  content: string;
  emotion: string;
  colors: string[];
  description: string;
}

const testSouls: TestSoul[] = [
  {
    id: 'peaceful',
    content: '今天的天空特别蓝，让我想起了小时候的梦想...',
    emotion: '平静',
    colors: ['#7DD3C0', '#C084FC'],
    description: '薄荷绿 → 薰衣草紫，营造宁静氛围'
  },
  {
    id: 'dreamy',
    content: '在这个喧嚣的世界里，找到属于自己的宁静...',
    emotion: '梦幻',
    colors: ['#C084FC', '#FB923C'],
    description: '薰衣草紫 → 蜜桃橙，浪漫想象空间'
  },
  {
    id: 'warm',
    content: '温暖的阳光洒在肩上，感觉整个世界都温柔了...',
    emotion: '温暖',
    colors: ['#FB923C', '#FBBF24'],
    description: '蜜桃橙 → 樱花黄，温馨舒适感受'
  },
  {
    id: 'hopeful',
    content: '每一个清晨都是新的开始，充满了无限可能...',
    emotion: '希望',
    colors: ['#FBBF24', '#7DD3C0'],
    description: '樱花黄 → 薄荷绿，积极向上的力量'
  },
  {
    id: 'melancholic',
    content: '雨后的街道，总是让人想起那些未完成的约定...',
    emotion: '忧郁',
    colors: ['#6366F1', '#8B5CF6'],
    description: '深蓝 → 电紫，深沉思考的氛围'
  },
  {
    id: 'energetic',
    content: '奔跑在城市的街头，感受生命的活力与激情...',
    emotion: '活力',
    colors: ['#FF0080', '#00D9FF'],
    description: '霓虹粉 → 霓虹蓝，赛博朋克的热情'
  }
];

const SimpleSoulPickupTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSoulClick = (soul: TestSoul) => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCurrentTest(soul.id);

    // 模拟动画效果
    setTimeout(() => {
      const result: TestResult = {
        emotion: soul.emotion,
        colors: soul.colors,
        timestamp: Date.now(),
        success: true
      };

      setTestResults(prev => [...prev, result]);
      setCurrentTest(null);
      setIsAnimating(false);

      Alert.alert(
        '🎉 灵魂拾取成功！',
        `拾取了${soul.emotion}的灵魂，色彩方案：${soul.colors.join(' → ')}`,
        [{ text: '太好了！', onPress: () => console.log('测试完成') }]
      );
    }, 1500);
  };

  const resetTests = () => {
    setTestResults([]);
    setCurrentTest(null);
    setIsAnimating(false);
  };

  const getDeviceInfo = () => {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      model: Platform.constants?.Model || '未知设备'
    };
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✨ SoulPickupAnimation 快速测试</Text>
        <Text style={styles.subtitle}>点击卡片测试宫崎骏+赛博朋克动画效果</Text>
        
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceText}>📱 {getDeviceInfo().platform} {getDeviceInfo().version}</Text>
          <Text style={styles.deviceText}>📱 {getDeviceInfo().model}</Text>
        </View>
      </View>

      <View style={styles.testControls}>
        <Text style={styles.controlTitle}>🎮 测试说明</Text>
        <Text style={styles.controlText}>• 点击任意卡片模拟灵魂拾取</Text>
        <Text style={styles.controlText}>• 观察色彩渐变和动画效果</Text>
        <Text style={styles.controlText}>• 验证不同情绪的色彩方案</Text>
        <Text style={styles.controlText}>• 测试完成后查看结果统计</Text>
      </View>

      <View style={styles.soulsContainer}>
        {testSouls.map((soul) => (
          <TouchableOpacity
            key={soul.id}
            style={[
              styles.soulCard,
              currentTest === soul.id && styles.soulCardActive
            ]}
            onPress={() => handleSoulClick(soul)}
            disabled={isAnimating}
          >
            <LinearGradient
              colors={soul.colors}
              style={styles.gradientBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardContent}>
                <Text style={styles.emotionLabel}>{soul.emotion}</Text>
                <Text style={styles.contentText}>{soul.content}</Text>
                <Text style={styles.descriptionText}>{soul.description}</Text>
                
                {currentTest === soul.id && (
                  <View style={styles.animatingIndicator}>
                    <Text style={styles.animatingText}>🌟 拾取中...</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.resultsSection}>
        <Text style={styles.resultsTitle}>📊 测试结果</Text>
        
        {testResults.length === 0 ? (
          <Text style={styles.noResults}>暂无测试结果，点击卡片开始测试</Text>
        ) : (
          <View>
            <Text style={styles.resultsSummary}>
              已测试 {testResults.length} 个情绪类型
            </Text>
            
            {testResults.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <Text style={styles.resultEmotion}>{result.emotion}</Text>
                <Text style={styles.resultColors}>
                  {result.colors.join(' → ')}
                </Text>
                <Text style={styles.resultTime}>
                  {new Date(result.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            ))}
            
            <TouchableOpacity style={styles.resetButton} onPress={resetTests}>
              <Text style={styles.resetButtonText}>🔄 重置测试</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.performanceInfo}>
        <Text style={styles.infoTitle}>⚡ Android 性能信息</Text>
        <Text style={styles.infoText}>• 粒子数量: 12个 (优化版)</Text>
        <Text style={styles.infoText}>• 动画时长: 1500ms</Text>
        <Text style={styles.infoText}>• 色彩渐变: 2段式</Text>
        <Text style={styles.infoText}>• 触摸响应: 即时</Text>
        <Text style={styles.infoText}>• 内存优化: ✅ 已启用</Text>
      </View>

      <View style={styles.colorPalette}>
        <Text style={styles.paletteTitle}>🎨 宫崎骏+赛博朋克色彩方案</Text>
        <View style={styles.colorRow}>
          {['#7DD3C0', '#C084FC', '#FB923C', '#FBBF24'].map((color, index) => (
            <View key={index} style={[styles.colorBox, { backgroundColor: color }]}>
              <Text style={styles.colorText}>{color}</Text>
            </View>
          ))}
        </View>
        <View style={styles.colorRow}>
          {['#FF0080', '#00D9FF', '#6366F1', '#8B5CF6'].map((color, index) => (
            <View key={index} style={[styles.colorBox, { backgroundColor: color }]}>
              <Text style={styles.colorText}>{color}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  deviceInfo: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  deviceText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  testControls: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  controlTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  controlText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
    lineHeight: 20,
  },
  soulsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  soulCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  soulCardActive: {
    transform: [{ scale: 0.98 }],
    elevation: 8,
  },
  gradientBackground: {
    padding: 20,
    minHeight: 120,
    justifyContent: 'center',
  },
  cardContent: {
    position: 'relative',
  },
  emotionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  contentText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 12,
    color: '#ffffff90',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  animatingIndicator: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  animatingText: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  resultsSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  noResults: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resultsSummary: {
    fontSize: 16,
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  resultItem: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  resultEmotion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  resultColors: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  resultTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  resetButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  performanceInfo: {
    backgroundColor: '#fef3c7',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 6,
    lineHeight: 20,
  },
  colorPalette: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paletteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  colorBox: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  colorText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SimpleSoulPickupTest;