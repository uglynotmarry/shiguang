import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SoulPickupAnimation } from '../components/SoulPickupAnimation';

export const TestScreen = () => {
  const [isAnimationVisible, setIsAnimationVisible] = useState(false);
  const [pickupResult, setPickupResult] = useState<string>('');

  const testSoulContents = [
    {
      id: '1',
      type: 'text' as const,
      content: '今天的心情很美好，阳光温暖，微风轻抚脸庞，感觉整个世界都充满了希望...',
      emotion: 'happy',
    },
    {
      id: '2',
      type: 'voice' as const,
      content: '一段温柔的声音记录，诉说着内心的宁静与安详...',
      emotion: 'peaceful',
    },
    {
      id: '3',
      type: 'image' as const,
      content: '一张充满赛博朋克风格的夜景照片，霓虹灯闪烁...',
      emotion: 'mysterious',
    },
    {
      id: '4',
      type: 'text' as const,
      content: '回忆总是那么美好，那些逝去的时光如同梦境般飘渺...',
      emotion: 'nostalgic',
    },
  ];

  const [currentSoulIndex, setCurrentSoulIndex] = useState(0);
  const currentSoul = testSoulContents[currentSoulIndex];

  const handleShowAnimation = () => {
    setPickupResult('');
    setIsAnimationVisible(true);
  };

  const handlePickupComplete = (success: boolean) => {
    setIsAnimationVisible(false);
    if (success) {
      setPickupResult('🎉 灵魂拾取成功！');
    } else {
      setPickupResult('❌ 拾取被取消');
    }
  };

  const handleNextSoul = () => {
    setCurrentSoulIndex((prev) => (prev + 1) % testSoulContents.length);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧚‍♀️ Soul拾取动画测试</Text>
        <Text style={styles.subtitle}>测试宫崎骏+赛博朋克风格的灵魂拾取效果</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.soulPreview}>
          <Text style={styles.soulTitle}>当前灵魂内容：</Text>
          <Text style={styles.soulType}>类型：{currentSoul.type === 'text' ? '📜 文字' : currentSoul.type === 'voice' ? '🎵 语音' : '🖼️ 图片'}</Text>
          <Text style={styles.soulEmotion}>情感：{currentSoul.emotion}</Text>
          <Text style={styles.soulContent}>{currentSoul.content}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleShowAnimation}>
            <Text style={styles.buttonText}>✨ 显示拾取动画</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleNextSoul}>
            <Text style={styles.buttonText}>🔄 切换灵魂内容</Text>
          </TouchableOpacity>
        </View>

        {pickupResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{pickupResult}</Text>
          </View>
        )}

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>📖 使用说明：</Text>
          <Text style={styles.instructionText}>1. 点击"显示拾取动画"按钮</Text>
          <Text style={styles.instructionText}>2. 长按屏幕中央的灵魂球进行拾取</Text>
          <Text style={styles.instructionText}>3. 观察粒子效果、光晕和涟漪动画</Text>
          <Text style={styles.instructionText}>4. 松开手指可取消拾取</Text>
          <Text style={styles.instructionText}>5. 使用"切换灵魂内容"测试不同情感色彩</Text>
        </View>
      </View>

      <SoulPickupAnimation
        isVisible={isAnimationVisible}
        onComplete={handlePickupComplete}
        soulContent={currentSoul}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#7DD3C0',
    padding: 24,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  soulPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  soulTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  soulType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  soulEmotion: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  soulContent: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    opacity: 0.8,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#FF0080',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FF0080',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: '#C084FC',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  resultContainer: {
    backgroundColor: '#FB923C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  instructions: {
    backgroundColor: 'rgba(125, 211, 192, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#7DD3C0',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7DD3C0',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
    lineHeight: 18,
  },
});