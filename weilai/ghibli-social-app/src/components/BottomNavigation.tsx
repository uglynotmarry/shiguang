import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { Colors } from '../styles/colors';
import { Theme } from '../styles/theme';

const { width } = Dimensions.get('window');

interface BottomNavigationProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabPress }) => {
  const soulButtonScale = useSharedValue(1);
  const soulButtonRotation = useSharedValue(0);

  const handleSoulPress = () => {
    // 灵魂按钮点击动画
    soulButtonScale.value = withSequence(
      withSpring(0.8, { damping: 10 }),
      withSpring(1.2, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    soulButtonRotation.value = withSequence(
      withTiming(360, { duration: 500 }),
      withTiming(0, { duration: 0 })
    );
    onTabPress('soul');
  };

  const soulButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: soulButtonScale.value },
      { rotate: `${soulButtonRotation.value}deg` }
    ],
  }));

  const tabs = [
    { id: 'home', label: '首页', icon: '🏠' },
    { id: 'treehole', label: '树洞', icon: '🌳' },
    { id: 'soul', label: '', icon: '' }, // 灵魂按钮特殊处理
    { id: 'messages', label: '消息', icon: '💌' },
    { id: 'profile', label: '我的', icon: '👤' },
  ];

  const renderTab = (tab: typeof tabs[0]) => {
    if (tab.id === 'soul') {
      return (
        <AnimatedTouchableOpacity
          key={tab.id}
          style={[styles.soulButton, soulButtonAnimatedStyle]}
          onPress={handleSoulPress}
        >
          <LinearGradient
            colors={[Colors.cyberpunk.neonPink, Colors.cyberpunk.neonBlue, Colors.primary.lavender]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.soulGradient}
          >
            <View style={styles.soulIconContainer}>
              <Text style={styles.soulIcon}>✨</Text>
              <View style={styles.particleContainer}>
                {[...Array(6)].map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.particle,
                      {
                        backgroundColor: i % 2 === 0 ? Colors.cyberpunk.neonBlue : Colors.cyberpunk.neonPink,
                        transform: [
                          { rotate: `${i * 60}deg` },
                          { translateX: 15 }
                        ],
                      }
                    ]}
                  />
                ))}
              </View>
            </View>
          </LinearGradient>
        </AnimatedTouchableOpacity>
      );
    }

    const isActive = activeTab === tab.id;
    const scale = useSharedValue(isActive ? 1.1 : 1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
      scale.value = withSequence(
        withSpring(0.9, { damping: 10 }),
        withSpring(1.1, { damping: 10 })
      );
      onTabPress(tab.id);
    };

    return (
      <AnimatedTouchableOpacity
        key={tab.id}
        style={[styles.tab, animatedStyle]}
        onPress={handlePress}
      >
        <Text style={[styles.tabIcon, isActive && styles.activeTabIcon]}>
          {tab.icon}
        </Text>
        <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
          {tab.label}
        </Text>
        {isActive && (
          <View style={styles.activeIndicator} />
        )}
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={95} tint="dark" style={styles.blurBackground}>
        <LinearGradient
          colors={['rgba(125, 211, 192, 0.1)', 'rgba(192, 132, 252, 0.1)', 'rgba(0, 217, 255, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBackground}
        />
      </BlurView>
      
      <View style={styles.content}>
        {tabs.map(renderTab)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Theme.components.tabBar.height,
    backgroundColor: 'transparent',
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    paddingBottom: 24,
    paddingHorizontal: Theme.spacing.lg,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
    minWidth: 60,
    height: 50,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.7,
  },
  activeTabIcon: {
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
    fontFamily: Theme.fonts.medium,
  },
  activeTabLabel: {
    color: Colors.primary.mint,
    fontFamily: Theme.fonts.bold,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary.mint,
  },
  soulButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.cyberpunk.neonPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
    marginTop: -20, // 向上凸起
  },
  soulGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.cyberpunk.neonBlue,
  },
  soulIconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soulIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    textShadowColor: Colors.cyberpunk.neonPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  particleContainer: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.8,
  },
});