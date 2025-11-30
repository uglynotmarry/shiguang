/**
 * 魔法书翻页动画组件
 * Magic Book Animation Component
 * 结合宫崎骏动画的浪漫美学与赛博朋克科技感的魔法书翻页效果
 */

import React, { useState } from 'react';
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
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Colors } from '../styles/colors';
import { Theme } from '../styles/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MagicBookAnimationProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentType?: 'text' | 'voice' | 'image';
  emotion?: 'happy' | 'sad' | 'peaceful' | 'excited' | 'nostalgic';
}

const MagicBookAnimation: React.FC<MagicBookAnimationProps> = ({
  isVisible,
  onClose,
  children,
  contentType = 'text',
  emotion = 'peaceful',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // 动画值
  const bookScale = useSharedValue(0);
  const bookRotateY = useSharedValue(-90);
  const glowOpacity = useSharedValue(0);
  const particleOffset = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentIconScale = useSharedValue(0);

  // 情感色彩映射
  const emotionColors = {
    happy: [Colors.primary.peach, Colors.primary.sakura],
    sad: [Colors.cyberpunk.electricPurple, Colors.primary.lavender],
    peaceful: [Colors.primary.mint, Colors.cyberpunk.neonBlue],
    excited: [Colors.cyberpunk.neonPink, Colors.cyberpunk.acidGreen],
    nostalgic: [Colors.timePost.timeGold, Colors.primary.lavender],
  };

  // 内容类型图标
  const contentIcons = {
    text: '📖',
    voice: '🎵',
    image: '🖼️',
  };

  // 开始动画
  const startAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    // 光效渐显
    glowOpacity.value = withTiming(1, { duration: 300 });
    
    // 粒子效果
    particleOffset.value = withSequence(
      withTiming(1, { duration: 800 }),
      withTiming(0, { duration: 800 })
    );

    // 书本出现动画
    bookScale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });

    // 翻页动画
    bookRotateY.value = withSequence(
      withTiming(0, { duration: 600 }),
      withTiming(180, { duration: 800 })
    );

    // 内容图标动画
    contentIconScale.value = withSpring(1, {
      damping: 10,
      stiffness: 200,
    });

    // 内容显示
    contentOpacity.value = withTiming(1, { duration: 500 });

    setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
  };

  // 关闭动画
  const closeAnimation = () => {
    if (isAnimating) return;
    
    // 反向动画
    contentOpacity.value = withTiming(0, { duration: 300 });
    contentIconScale.value = withTiming(0, { duration: 300 });
    bookRotateY.value = withSequence(
      withTiming(0, { duration: 400 }),
      withTiming(-90, { duration: 600 })
    );
    bookScale.value = withTiming(0, { duration: 500 });
    glowOpacity.value = withTiming(0, { duration: 300 });

    setTimeout(() => {
      onClose();
    }, 1000);
  };

  // 动画样式
  const bookAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: bookScale.value },
      { rotateY: `${bookRotateY.value}deg` },
    ],
    opacity: bookScale.value > 0 ? 1 : 0,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const particleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: particleOffset.value * 20 }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const contentIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentIconScale.value }],
  }));

  // 启动动画
  React.useEffect(() => {
    if (isVisible) {
      startAnimation();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <TouchableWithoutFeedback onPress={closeAnimation}>
      <View style={styles.overlay}>
        {/* 背景光效 */}
        <Animated.View style={[styles.glowContainer, glowAnimatedStyle]}>
          <LinearGradient
            colors={[emotionColors[emotion][0], emotionColors[emotion][1], 'transparent']}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
            style={styles.glow}
          />
        </Animated.View>

        {/* 粒子效果 */}
        <Animated.View style={[styles.particleContainer, particleAnimatedStyle]}>
          {[...Array(12)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  left: Math.random() * screenWidth,
                  top: Math.random() * screenHeight,
                  backgroundColor: emotionColors[emotion][0],
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* 魔法书主体 */}
        <Animated.View style={[styles.bookContainer, bookAnimatedStyle]}>
          <TouchableWithoutFeedback>
            <View style={styles.book}>
              {/* 书封面 */}
              <LinearGradient
                colors={[emotionColors[emotion][0], emotionColors[emotion][1]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bookCover}
              >
                <Animated.Text style={styles.contentIcon}>
                  {contentIcons[contentType]}
                </Animated.Text>
              </LinearGradient>

              {/* 书页内容 */}
              <Animated.View style={[styles.bookContent, contentAnimatedStyle]}>
                <Animated.View style={contentIconAnimatedStyle}>
                  <Text style={styles.contentIconLarge}>
                    {contentIcons[contentType]}
                  </Text>
                </Animated.View>
                {children}
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>

        {/* 关闭提示 */}
        <LinearGradient
          colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
          style={styles.closeHintBackground}
        >
          <Text style={styles.closeHintText}>点击任意处关闭</Text>
        </LinearGradient>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: screenWidth * 1.5,
    height: screenWidth * 1.5,
    borderRadius: screenWidth * 0.75,
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.8,
  },
  bookContainer: {
    width: screenWidth * 0.8,
    height: screenHeight * 0.6,
  },
  book: {
    flex: 1,
    position: 'relative',
  },
  bookCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
  },
  bookContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    backfaceVisibility: 'hidden',
  },
  contentIcon: {
    fontSize: 48,
    opacity: 0.8,
  },
  contentIconLarge: {
    fontSize: 64,
    marginBottom: 20,
    opacity: 0.9,
  },
  closeHintBackground: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  closeHintText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default MagicBookAnimation;