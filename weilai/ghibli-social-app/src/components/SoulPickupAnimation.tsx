import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '../styles/colors';
import { Theme } from '../styles/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SoulPickupAnimationProps {
  isVisible: boolean;
  onComplete: (success: boolean) => void;
  soulContent: {
    id: string;
    type: 'text' | 'voice' | 'image';
    content: string;
    emotion: string;
  };
}

export const SoulPickupAnimation: React.FC<SoulPickupAnimationProps> = ({
  isVisible,
  onComplete,
  soulContent,
}) => {
  const [isPicking, setIsPicking] = useState(false);
  const [pickProgress, setPickProgress] = useState(0);

  // 动画值
  const soulScale = useSharedValue(0);
  const soulRotation = useSharedValue(0);
  const particleRadius = useSharedValue(0);
  const glowIntensity = useSharedValue(0);
  const rippleScale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0.8);
  const pickupScale = useSharedValue(1);
  const pickupRotation = useSharedValue(0);

  // 灵魂类型图标
  const soulIcons = {
    text: '📜',
    voice: '🎵',
    image: '🖼️',
  };

  // 情感色彩
  const emotionColors = {
    happy: [Colors.primary.peach, Colors.primary.sakura],
    sad: [Colors.cyberpunk.neonBlue, Colors.primary.lavender],
    peaceful: [Colors.primary.mint, Colors.primary.lavender],
    excited: [Colors.cyberpunk.neonPink, Colors.cyberpunk.acidGreen],
    nostalgic: [Colors.timePost.timeGold, Colors.primary.peach],
    romantic: [Colors.cyberpunk.neonPink, Colors.primary.peach],
    mysterious: [Colors.cyberpunk.electricPurple, Colors.primary.lavender],
  };

  useEffect(() => {
    if (isVisible) {
      // 灵魂出现动画
      soulScale.value = withSpring(1, { damping: 15, stiffness: 100 });
      soulRotation.value = withRepeat(
        withTiming(360, { duration: 8000 }),
        -1,
        false
      );
      
      // 粒子环动画
      particleRadius.value = withSpring(80, { damping: 20 });
      
      // 光晕动画
      glowIntensity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
      
      // 涟漪动画
      rippleScale.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 1500 }),
          withTiming(1, { duration: 0 })
        ),
        -1,
        false
      );
      
      rippleOpacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 1500 }),
          withTiming(0.8, { duration: 0 })
        ),
        -1,
        false
      );
    } else {
      // 关闭动画
      soulScale.value = withTiming(0, { duration: 300 });
      particleRadius.value = withTiming(0, { duration: 300 });
      glowIntensity.value = withTiming(0, { duration: 300 });
    }
  }, [isVisible]);

  const soulAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: soulScale.value },
      { rotate: `${soulRotation.value}deg` },
    ],
  }));

  const particleAnimatedStyle = useAnimatedStyle(() => ({
    width: particleRadius.value * 2,
    height: particleRadius.value * 2,
    borderRadius: particleRadius.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value,
  }));

  const rippleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const pickupAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pickupScale.value },
      { rotate: `${pickupRotation.value}deg` },
    ],
  }));

  const handleLongPress = () => {
    if (isPicking) return;
    
    setIsPicking(true);
    
    // 拾取动画
    pickupScale.value = withSequence(
      withSpring(0.8, { damping: 10 }),
      withSpring(1.2, { damping: 10 }),
      withSpring(0, { damping: 15 })
    );
    
    pickupRotation.value = withSequence(
      withTiming(180, { duration: 500 }),
      withTiming(360, { duration: 500 })
    );
    
    // 模拟拾取进度
    const interval = setInterval(() => {
      setPickProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete(true);
            setIsPicking(false);
            setPickProgress(0);
          }, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const handlePressOut = () => {
    if (!isPicking) return;
    
    // 取消拾取
    setIsPicking(false);
    setPickProgress(0);
    pickupScale.value = withSpring(1);
    pickupRotation.value = withTiming(0);
    onComplete(false);
  };

  if (!isVisible) return null;

  return (
    <TouchableWithoutFeedback onPressOut={handlePressOut}>
      <View style={styles.overlay}>
        {/* 背景光效 */}
        <Animated.View style={[styles.glowContainer, glowAnimatedStyle]}>
          <LinearGradient
            colors={[...(emotionColors[soulContent.emotion as keyof typeof emotionColors] || emotionColors.peaceful), 'transparent'] as any}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
            style={styles.glow}
          />
        </Animated.View>

        {/* 涟漪效果 */}
        <Animated.View style={[styles.ripple, rippleAnimatedStyle]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)', 'transparent']}
            style={styles.rippleGradient}
          />
        </Animated.View>

        {/* 粒子环 */}
        <Animated.View style={[styles.particleRing, particleAnimatedStyle]}>
          {[...Array(16)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  marginLeft: -2,
                  marginTop: -2,
                  transform: [
                    { rotate: `${i * 22.5}deg` },
                    { translateX: particleRadius.value / 2 },
                  ],
                  backgroundColor: emotionColors[soulContent.emotion as keyof typeof emotionColors]?.[0] || Colors.primary.mint,
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* 灵魂核心 */}
        <Animated.View style={[styles.soulContainer, soulAnimatedStyle]}>
          <TouchableWithoutFeedback
            onPressIn={handleLongPress}
            onPressOut={handlePressOut}
          >
            <Animated.View style={[styles.soulCore, pickupAnimatedStyle]}>
              <LinearGradient
                colors={(emotionColors[soulContent.emotion as keyof typeof emotionColors] || emotionColors.peaceful) as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.soulGradient}
              >
                <Text style={styles.soulIcon}>
                  {soulIcons[soulContent.type as keyof typeof soulIcons]}
                </Text>
              </LinearGradient>

              {/* 进度环 */}
              {isPicking && (
                <View style={styles.progressRing}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${pickProgress}%`,
                        backgroundColor: emotionColors[soulContent.emotion as keyof typeof emotionColors]?.[1] || Colors.primary.lavender,
                      },
                    ]}
                  />
                </View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>

          {/* 拾取提示 */}
          <Animated.View style={[styles.pickupHint, soulAnimatedStyle]}>
            <Text style={styles.pickupText}>
              {isPicking ? '灵魂收集中...' : '长按拾取灵魂'}
            </Text>
            {isPicking && (
              <Text style={styles.progressText}>{Math.round(pickProgress)}%</Text>
            )}
          </Animated.View>
        </Animated.View>

        {/* 灵魂内容预览 */}
        <Animated.View style={[styles.contentPreview, soulAnimatedStyle]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.previewBackground}
          >
            <Text style={styles.previewText} numberOfLines={2}>
              {soulContent.content}
            </Text>
          </LinearGradient>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glow: {
    flex: 1,
    opacity: 0.4,
  },
  ripple: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rippleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  particleRing: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
  },
  particle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.8,
  },
  soulContainer: {
    alignItems: 'center',
  },
  soulCore: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  soulGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  soulIcon: {
    fontSize: 48,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  progressRing: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 65,
  },
  pickupHint: {
    marginTop: 30,
    alignItems: 'center',
  },
  pickupText: {
    fontSize: 16,
    fontFamily: Theme.fonts.medium,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 24,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  contentPreview: {
    position: 'absolute',
    bottom: 100,
    left: 40,
    right: 40,
    padding: 16,
    borderRadius: Theme.borderRadius.lg,
  },
  previewBackground: {
    padding: 16,
    borderRadius: Theme.borderRadius.lg,
  },
  previewText: {
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 20,
  },
});