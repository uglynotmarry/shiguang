/**
 * 宫崎骏动画美学 + 赛博朋克风格主界面
 * Ghibli Cyberpunk Social App - Main Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated as RNAnimated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../styles/colors';
import { Theme } from '../styles/theme';
import MagicBookAnimation from '../components/MagicBookAnimation';
import { SoulPickupAnimation } from '../components/SoulPickupAnimation';

const { width, height } = Dimensions.get('window');

interface ContentCard {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: {
    text?: string;
    voice?: {
      duration: number;
      waveform: number[];
    };
    emotion: 'happy' | 'sad' | 'excited' | 'calm' | 'nostalgic' | 'dreamy';
  };
  timestamp: Date;
  likes: number;
  comments: number;
  isTimeCapsule?: boolean;
  deliveryTime?: Date;
}

const mockContent: ContentCard[] = [
  {
    id: '1',
    author: { name: '樱花少女', avatar: '🌸' },
    content: {
      text: '今天的樱花开了，想起了小时候和奶奶一起赏花的日子...',
      emotion: 'nostalgic',
    },
    timestamp: new Date(),
    likes: 128,
    comments: 23,
    isTimeCapsule: false,
  },
  {
    id: '2',
    author: { name: '星空漫游者', avatar: '⭐' },
    content: {
      text: '夜深了，城市的霓虹灯像流动的星河，想起了天空之城的故事...',
      voice: {
        duration: 45,
        waveform: [0.2, 0.4, 0.6, 0.3, 0.8, 0.5, 0.7, 0.9, 0.4, 0.6],
      },
      emotion: 'dreamy',
    },
    timestamp: new Date(Date.now() - 3600000),
    likes: 256,
    comments: 45,
    isTimeCapsule: true,
    deliveryTime: new Date(Date.now() + 86400000 * 7), // 7天后
  },
  {
    id: '3',
    author: { name: '萤火虫之舞', avatar: '✨' },
    content: {
      text: '夏日的夜晚，萤火虫在草丛中飞舞，像是地上的星星在跳舞...',
      emotion: 'calm',
    },
    timestamp: new Date(Date.now() - 7200000),
    likes: 89,
    comments: 12,
    isTimeCapsule: false,
  },
];

const MainScreen: React.FC = () => {
  const [content, setContent] = useState<ContentCard[]>(mockContent);
  const [scrollY] = useState(new RNAnimated.Value(0));
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [magicBookVisible, setMagicBookVisible] = useState(false);
  const [soulPickupVisible, setSoulPickupVisible] = useState(false);
  const [currentSoulContent, setCurrentSoulContent] = useState<any>(null);
  const navigation = useNavigation();

  // 根据情感获取背景渐变
  const getEmotionGradient = (emotion: string): [string, string] => {
    const gradientMap = {
      happy: [Colors.emotions.happy, Colors.primary.peach] as [string, string],
      sad: [Colors.emotions.sad, Colors.cyberpunk.electricPurple] as [string, string],
      excited: [Colors.emotions.excited, Colors.cyberpunk.neonPink] as [string, string],
      calm: [Colors.emotions.calm, Colors.primary.mint] as [string, string],
      nostalgic: [Colors.emotions.nostalgic, Colors.timePost.twilight] as [string, string],
      dreamy: [Colors.emotions.dreamy, Colors.timePost.starryBlue] as [string, string],
    };
    return gradientMap[emotion as keyof typeof gradientMap] || [Colors.primary.mint, Colors.cyberpunk.neonBlue];
  };

  // 渲染内容卡片
  const renderContentCard = (item: ContentCard, index: number) => {
    const scale = scrollY.interpolate({
      inputRange: [index * 200 - 100, index * 200, index * 200 + 100],
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    const opacity = scrollY.interpolate({
      inputRange: [index * 200 - 100, index * 200, index * 200 + 100],
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.cardContainer,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleCardPress(item.id)}
          onLongPress={() => handleCardLongPress(item.id)}
        >
          <LinearGradient
            colors={getEmotionGradient(item.content.emotion)}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* 时间胶囊标识 */}
            {item.isTimeCapsule && (
              <View style={styles.timeCapsuleBadge}>
                <Text style={styles.timeCapsuleText}>⏰ 时光胶囊</Text>
              </View>
            )}

            {/* 作者信息 */}
            <View style={styles.authorInfo}>
              <Text style={styles.avatar}>{item.author.avatar}</Text>
              <Text style={styles.authorName}>{item.author.name}</Text>
              <Text style={styles.timestamp}>
                {formatTimestamp(item.timestamp)}
              </Text>
            </View>

            {/* 内容预览 */}
            <View style={styles.contentPreview}>
              {item.content.text && (
                <Text style={styles.contentText} numberOfLines={3}>
                  {item.content.text}
                </Text>
              )}

              {/* 语音波形 */}
              {item.content.voice && (
                <View style={styles.voiceContainer}>
                  <View style={styles.waveform}>
                    {item.content.voice.waveform.map((height, i) => (
                      <View
                        key={i}
                        style={[
                          styles.waveformBar,
                          {
                            height: `${height * 100}%`,
                            backgroundColor: Colors.neutral.white,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.voiceDuration}>
                    {item.content.voice.duration}s
                  </Text>
                </View>
              )}
            </View>

            {/* 互动按钮 */}
            <View style={styles.interactionBar}>
              <TouchableOpacity style={styles.interactionButton}>
                <Text style={styles.interactionIcon}>❤️</Text>
                <Text style={styles.interactionCount}>{item.likes}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.interactionButton}>
                <Text style={styles.interactionIcon}>💬</Text>
                <Text style={styles.interactionCount}>{item.comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.interactionButton}>
                <Text style={styles.interactionIcon}>✨</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleCardPress = (cardId: string) => {
    const card = content.find(item => item.id === cardId);
    if (card) {
      setCurrentSoulContent({
        id: card.id,
        type: card.content.voice ? 'voice' : 'text',
        content: card.content.text || '语音内容',
        emotion: card.content.emotion,
      });
      setMagicBookVisible(true);
    }
  };

  const handleCardLongPress = (cardId: string) => {
    const card = content.find(item => item.id === cardId);
    if (card) {
      setCurrentSoulContent({
        id: card.id,
        type: card.content.voice ? 'voice' : 'text',
        content: card.content.text || '语音内容',
        emotion: card.content.emotion,
      });
      setSoulPickupVisible(true);
    }
  };

  const handleMagicBookClose = () => {
    setMagicBookVisible(false);
    setCurrentSoulContent(null);
  };

  const handleSoulPickupComplete = (success: boolean) => {
    setSoulPickupVisible(false);
    if (success) {
      console.log('灵魂拾取成功!');
      // 可以添加成功反馈动画
    }
    setCurrentSoulContent(null);
  };

  const handleSoulButtonPress = () => {
    navigation.navigate('Post' as never);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.mint} />

      {/* 顶部导航 */}
      <LinearGradient
        colors={[Colors.primary.mint, Colors.cyberpunk.neonBlue]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>✨ 梦境社交 ✨</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerIcon}>💌</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* 瀑布流内容 */}
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={RNAnimated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <View style={styles.waterfallContainer}>
          {content.map((item, index) => renderContentCard(item, index))}
        </View>
      </ScrollView>

      {/* Soul发布按钮 */}
      <TouchableOpacity 
        style={styles.soulButton} 
        activeOpacity={0.8}
        onPress={handleSoulButtonPress}
      >
        <LinearGradient
          colors={[Colors.cyberpunk.neonPink, Colors.cyberpunk.electricPurple]}
          style={styles.soulButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.soulButtonText}>Soul</Text>
          <View style={styles.soulButtonParticles}>
            {[...Array(6)].map((_, i) => (
              <RNAnimated.View
                key={i}
                style={[
                  styles.particle,
                  {
                    transform: [
                      {
                        rotate: `${i * 60}deg`,
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* 魔法书翻页动画 */}
      <MagicBookAnimation
        isVisible={magicBookVisible}
        onClose={handleMagicBookClose}
        contentType={currentSoulContent?.type || 'text'}
        emotion={currentSoulContent?.emotion || 'peaceful'}
      >
        <View style={styles.bookContent}>
          <Text style={styles.bookTitle}>灵魂内容</Text>
          <Text style={styles.bookText}>
            {currentSoulContent?.content || '这是一个美丽的灵魂故事...'}
          </Text>
        </View>
      </MagicBookAnimation>

      {/* 灵魂拾取动画 */}
      <SoulPickupAnimation
        isVisible={soulPickupVisible}
        onComplete={handleSoulPickupComplete}
        soulContent={currentSoulContent || {
          id: 'default',
          type: 'text',
          content: '这是一个美丽的灵魂故事...',
          emotion: 'peaceful'
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.lightGray,
  },
  header: {
    height: 88,
    paddingTop: 44,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.neutral.white,
    textShadowColor: Colors.shadows.neon,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  headerIcon: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
  },
  waterfallContainer: {
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: (width - 36) / 2, // 两列布局
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    ...Theme.shadows.lg,
  },
  timeCapsuleBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.timePost.timeGold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeCapsuleText: {
    fontSize: 10,
    color: Colors.neutral.white,
    fontWeight: '600',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 24,
    marginRight: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.white,
    flex: 1,
  },
  timestamp: {
    fontSize: 10,
    color: Colors.neutral.white,
    opacity: 0.8,
  },
  contentPreview: {
    marginBottom: 16,
  },
  contentText: {
    fontSize: 14,
    color: Colors.neutral.white,
    lineHeight: 20,
  },
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    marginRight: 8,
  },
  waveformBar: {
    width: 2,
    marginHorizontal: 1,
    borderRadius: 1,
  },
  voiceDuration: {
    fontSize: 12,
    color: Colors.neutral.white,
    opacity: 0.8,
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  interactionCount: {
    fontSize: 12,
    color: Colors.neutral.white,
    fontWeight: '600',
  },
  soulButton: {
    position: 'absolute',
    bottom: 34,
    left: width / 2 - 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    ...Theme.shadows.neon,
  },
  soulButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soulButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.neutral.white,
    textShadowColor: Colors.shadows.neon,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  soulButtonParticles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: Colors.neutral.white,
    borderRadius: 2,
    top: 8,
    left: '50%',
    marginLeft: -2,
    opacity: 0.8,
  },
  bookContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bookTitle: {
    fontSize: 24,
    fontFamily: Theme.fonts.bold,
    color: Colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  bookText: {
    fontSize: 16,
    fontFamily: Theme.fonts.regular,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default MainScreen;