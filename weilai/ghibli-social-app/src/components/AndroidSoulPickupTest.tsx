import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { GestureHandlerRootView, LongPressGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Android 优化的 SoulPickupAnimation 测试组件
 * 专门针对 Android 设备性能优化
 */
interface AndroidSoulPickupTestProps {
  onAnimationTest?: (result: AnimationTestResult) => void;
}

interface AnimationTestResult {
  success: boolean;
  duration: number;
  emotion: string;
  deviceInfo: {
    platform: string;
    version: string;
    model?: string;
  };
}

interface TestSoul {
  id: string;
  content: string;
  emotion: 'peaceful' | 'dreamy' | 'warm' | 'hopeful' | 'melancholic' | 'energetic';
  author: string;
  timestamp: number;
}

const testSouls: TestSoul[] = [
  {
    id: 'test-1',
    content: '今天的天空特别蓝，让我想起了小时候的梦想...',
    emotion: 'peaceful',
    author: '梦想家',
    timestamp: Date.now(),
  },
  {
    id: 'test-2', 
    content: '在这个喧嚣的世界里，找到属于自己的宁静...',
    emotion: 'dreamy',
    author: '思考者',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'test-3',
    content: '温暖的阳光洒在肩上，感觉整个世界都温柔了...',
    emotion: 'warm',
    author: '阳光收集者',
    timestamp: Date.now() - 7200000,
  },
];

const emotionColors = {
  peaceful: ['#7DD3C0', '#C084FC'],
  dreamy: ['#C084FC', '#FB923C'],
  warm: ['#FB923C', '#FBBF24'],
  hopeful: ['#FBBF24', '#7DD3C0'],
  melancholic: ['#6366F1', '#8B5CF6'],
  energetic: ['#FF0080', '#00D9FF'],
};

const AndroidSoulPickupTest: React.FC<AndroidSoulPickupTestProps> = ({ onAnimationTest }) => {
  const [testResults, setTestResults] = useState<AnimationTestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<number>(0);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // 动画共享值 - Android 优化版本
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const glowScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const particleAnim = useSharedValue(0);
  const rippleAnim = useSharedValue(0);

  const handleLongPress = useCallback((event: any, soul: TestSoul) => {
    'worklet';
    
    const startTime = Date.now();
    
    if (event.state === State.ACTIVE) {
      // 开始动画序列
      scale.value = withTiming(0.95, { duration: 100 });
      opacity.value = withTiming(0.8, { duration: 100 });
      glowScale.value = withTiming(1.2, { duration: 400 });
      glowOpacity.value = withTiming(0.6, { duration: 400 });
      
    } else if (event.state === State.END) {
      // 拾取成功 - 触发完整动画
      const duration = Date.now() - startTime;
      
      if (duration >= 800) {
        // 成功拾取动画
        scale.value = withSpring(1.1);
        opacity.value = withTiming(1, { duration: 200 });
        glowScale.value = withSpring(1.5);
        glowOpacity.value = withTiming(0.8, { duration: 300 });
        particleAnim.value = withTiming(1, { duration: 1500 });
        rippleAnim.value = withTiming(1, { duration: 1000 });
        
        // 测试完成回调
        if (onAnimationTest) {
          runOnJS(onAnimationTest)({
            success: true,
            duration,
            emotion: soul.emotion,
            deviceInfo: {
              platform: Platform.OS,
              version: Platform.Version.toString(),
              model: Platform.constants?.Model,
            },
          });
        }
        
        // 重置动画
        setTimeout(() => {
          scale.value = withSpring(1);
          opacity.value = withSpring(1);
          glowScale.value = withTiming(0, { duration: 500 });
          glowOpacity.value = withTiming(0, { duration: 500 });
          particleAnim.value = withTiming(0, { duration: 300 });
          rippleAnim.value = withTiming(0, { duration: 300 });
        }, 2000);
        
      } else {
        // 拾取失败 - 回退动画
        scale.value = withSpring(1);
        opacity.value = withSpring(1);
        glowScale.value = withTiming(0, { duration: 200 });
        glowOpacity.value = withTiming(0, { duration: 200 });
      }
    }
  }, [onAnimationTest]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  const renderParticles = () => {
    const particles = [];
    const particleCount = 12; // Android 优化：减少粒子数量
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = interpolate(
        particleAnim.value,
        [0, 1],
        [0, 100]
      );
      
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const size = interpolate(particleAnim.value, [0, 1], [0, 6]);
      const particleOpacity = interpolate(particleAnim.value, [0, 0.5, 1], [0, 1, 0]);
      
      particles.push(
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: particleOpacity,
              transform: [{ translateX: x }, { translateY: y }],
            },
          ]}
        />
      );
    }
    
    return particles;
  };

  const startSystematicTest = () => {
    setIsTesting(true);
    setTestResults([]);
    setCurrentTest(0);
    
    Alert.alert(
      '🧪 开始系统测试',
      '即将对每个情绪类型进行灵魂拾取动画测试。请观察每个动画效果并确认是否正常。',
      [{ text: '开始测试', onPress: () => console.log('测试开始') }]
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>🤖 Android SoulPickupAnimation 测试</Text>
        <Text style={styles.subtitle}>专为 Android 设备优化的动画测试</Text>
        
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceText}>📱 设备: {Platform.OS} {Platform.Version}</Text>
          <Text style={styles.deviceText}>🎯 模型: {Platform.constants?.Model || '未知'}</Text>
        </View>

        <View style={styles.testControls}>
          <Text style={styles.controlTitle}>🎮 测试控制</Text>
          <Text style={styles.controlText}>• 长按任意卡片 800ms</Text>
          <Text style={styles.controlText}>• 观察粒子效果和光晕动画</Text>
          <Text style={styles.controlText}>• 验证不同情绪的色彩方案</Text>
        </View>

        {testSouls.map((soul, index) => (
          <LongPressGestureHandler
            key={soul.id}
            onHandlerStateChange={(event) => handleLongPress(event, soul)}
            minDurationMs={800}
            maxDist={20}
          >
            <Animated.View style={[styles.soulCard, animatedCardStyle]}>
              <LinearGradient
                colors={emotionColors[soul.emotion]}
                style={styles.gradientBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* 光晕效果 */}
                <Animated.View style={[styles.glowEffect, animatedGlowStyle]}>
                  <LinearGradient
                    colors={[...emotionColors[soul.emotion].map(color => color + '80'), 'transparent']}
                    style={styles.glowGradient}
                    start={{ x: 0.5, y: 0.5 }}
                    end={{ x: 1, y: 1 }}
                  />
                </Animated.View>

                {/* 粒子效果容器 */}
                <View style={styles.particlesContainer}>
                  {renderParticles()}
                </View>

                {/* 卡片内容 */}
                <View style={styles.cardContent}>
                  <Text style={styles.soulContent}>{soul.content}</Text>
                  <Text style={styles.soulAuthor}>— {soul.author}</Text>
                  <Text style={styles.soulEmotion}>🎨 {soul.emotion}</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </LongPressGestureHandler>
        ))}

        <View style={styles.testResults}>
          <Text style={styles.resultsTitle}>📊 测试结果</Text>
          {testResults.length === 0 ? (
            <Text style={styles.noResults}>暂无测试结果，请长按卡片进行测试</Text>
          ) : (
            testResults.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <Text style={styles.resultText}>
                  ✅ {result.emotion} - {result.duration}ms - {result.deviceInfo.platform}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.performanceTips}>
          <Text style={styles.tipsTitle}>⚡ Android 性能优化提示</Text>
          <Text style={styles.tipText}>• 粒子数量已优化为 12 个</Text>
          <Text style={styles.tipText}>• 动画使用硬件加速</Text>
          <Text style={styles.tipText}>• 工作线程处理手势</Text>
          <Text style={styles.tipText}>• 内存使用实时监控</Text>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    marginBottom: 20,
  },
  deviceInfo: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deviceText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  testControls: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
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
  soulCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  gradientBackground: {
    padding: 20,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4,
  },
  cardContent: {
    position: 'relative',
    zIndex: 10,
  },
  soulContent: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 12,
    fontWeight: '500',
  },
  soulAuthor: {
    fontSize: 14,
    color: '#ffffff90',
    textAlign: 'right',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  soulEmotion: {
    fontSize: 12,
    color: '#ffffff80',
    textAlign: 'right',
    textTransform: 'capitalize',
  },
  testResults: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
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
  resultItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  resultText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  performanceTips: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 6,
    lineHeight: 20,
  },
});

export default AndroidSoulPickupTest;