import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SoulContent {
  id: string;
  content: string;
  emotion: 'romantic' | 'mysterious' | 'dreamy' | 'warm' | 'lonely';
  type: 'text' | 'voice';
  author: string;
}

const testSoulContents: SoulContent[] = [
  {
    id: '1',
    content: '今天的天空特别蓝，想起了小时候在龙猫树下玩耍的时光...',
    emotion: 'warm',
    type: 'text',
    author: '梦幻少女'
  },
  {
    id: '2',
    content: '在这个霓虹闪烁的城市里，我听到了来自未来的呼唤...',
    emotion: 'mysterious',
    type: 'voice',
    author: '赛博旅人'
  },
  {
    id: '3',
    content: '樱花飘落的瞬间，时间仿佛静止了，这一刻只属于我们...',
    emotion: 'romantic',
    type: 'text',
    author: '樱花信使'
  },
  {
    id: '4',
    content: '在梦境与现实的交界处，我找到了属于自己的魔法世界...',
    emotion: 'dreamy',
    type: 'voice',
    author: '梦境编织者'
  },
  {
    id: '5',
    content: '一个人的夜晚，星星也在诉说着孤独的故事...',
    emotion: 'lonely',
    type: 'text',
    author: '星空守望者'
  }
];

const emotionColors = {
  romantic: ['#FF6B9D', '#C44569', '#F8B500'],
  mysterious: ['#2C003E', '#4A148C', '#7B1FA2'],
  dreamy: ['#87CEEB', '#4682B4', '#6495ED'],
  warm: ['#FFB347', '#FFA500', '#FF8C00'],
  lonely: ['#708090', '#2F4F4F', '#696969']
};

export default function SoulPickupAnimationTest() {
  const [selectedSoul, setSelectedSoul] = useState<SoulContent | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [testResult, setTestResult] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(50)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const startSoulPickupAnimation = (soul: SoulContent) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedSoul(soul);
    setTestResult('🌟 正在拾取灵魂...');
    
    // Reset animations
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.3);
    rotateAnim.setValue(0);
    translateAnim.setValue(50);
    particleAnim.setValue(0);
    glowAnim.setValue(0);
    
    // Create animation sequence
    Animated.parallel([
      // Main content animation
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true
          }),
          Animated.timing(translateAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true
          })
        ]),
        // Add rotation effect
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true
            })
          ])
        )
      ]),
      
      // Particle effects
      Animated.sequence([
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(particleAnim, {
              toValue: 1.2,
              duration: 500,
              useNativeDriver: true
            }),
            Animated.timing(particleAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true
            })
          ])
        )
      ]),
      
      // Glow effect
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1.3,
              duration: 800,
              useNativeDriver: true
            }),
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true
            })
          ])
        )
      ])
    ]).start(() => {
      setTestResult('✨ 灵魂拾取成功！感受到了' + getEmotionChinese(soul.emotion) + '的情感');
      
      // Auto hide after 3 seconds
      setTimeout(() => {
        hideAnimation();
      }, 3000);
    });
  };

  const hideAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.3,
        duration: 500,
        useNativeDriver: true
      })
    ]).start(() => {
      setIsAnimating(false);
      setSelectedSoul(null);
      setTestResult('');
    });
  };

  const getEmotionChinese = (emotion: string) => {
    const emotionMap = {
      romantic: '浪漫',
      mysterious: '神秘',
      dreamy: '梦幻',
      warm: '温暖',
      lonely: '孤独'
    };
    return emotionMap[emotion as keyof typeof emotionMap] || '未知';
  };

  const renderParticles = () => {
    const particles = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45) * Math.PI / 180;
      const distance = 60;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      particles.push(
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: x },
                { translateY: y },
                {
                  scale: particleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1]
                  })
                }
              ],
              opacity: particleAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1, 0.8]
              })
            }
          ]}
        />
      );
    }
    return particles;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌸 灵魂拾取动画测试 🌸</Text>
      <Text style={styles.subtitle}>长按卡片体验灵魂拾取的魔法效果</Text>
      
      <View style={styles.testContent}>
        {testSoulContents.map((soul) => (
          <TouchableOpacity
            key={soul.id}
            style={styles.soulCard}
            onPress={() => startSoulPickupAnimation(soul)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={emotionColors[soul.emotion]}
              style={styles.cardGradient}
            >
              <Text style={styles.cardContent} numberOfLines={2}>
                {soul.content}
              </Text>
              <Text style={styles.cardAuthor}>— {soul.author}</Text>
              <Text style={styles.cardType}>
                {soul.type === 'voice' ? '🎤 语音' : '📝 文字'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {selectedSoul && (
        <Animated.View
          style={[
            styles.animationContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: translateAnim }
              ]
            }
          ]}
        >
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.6]
                }),
                transform: [
                  {
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.5]
                    })
                  }
                ]
              }
            ]}
          />
          
          <LinearGradient
            colors={emotionColors[selectedSoul.emotion]}
            style={styles.animationContent}
          >
            <Text style={styles.animationText}>{selectedSoul.content}</Text>
            <Text style={styles.animationAuthor}>— {selectedSoul.author}</Text>
          </LinearGradient>
          
          <View style={styles.particleContainer}>
            {renderParticles()}
          </View>
        </Animated.View>
      )}

      {testResult ? (
        <Text style={styles.testResult}>{testResult}</Text>
      ) : (
        <Text style={styles.instructions}>
          💡 点击任意卡片开始测试灵魂拾取动画{'\n'}
          ✨ 每个卡片代表不同的情感和类型{'\n'}
          🌟 观察粒子效果、发光效果和渐变动画
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 10,
    textShadowColor: '#ff6b9d',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#87ceeb',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  testContent: {
    flex: 1,
    justifyContent: 'center',
  },
  soulCard: {
    marginVertical: 10,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 15,
  },
  cardContent: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    lineHeight: 22,
  },
  cardAuthor: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'right',
  },
  cardType: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.7,
    position: 'absolute',
    top: 10,
    right: 15,
  },
  animationContainer: {
    position: 'absolute',
    top: screenHeight * 0.3,
    left: screenWidth * 0.1,
    right: screenWidth * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  glowEffect: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  animationContent: {
    padding: 30,
    borderRadius: 20,
    elevation: 10,
    minWidth: 250,
    alignItems: 'center',
  },
  animationText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  animationAuthor: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    fontStyle: 'italic',
  },
  particleContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  testResult: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    fontSize: 16,
    color: '#7dd3c0',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
  },
  instructions: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    fontSize: 12,
    color: '#87ceeb',
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.7,
  },
});