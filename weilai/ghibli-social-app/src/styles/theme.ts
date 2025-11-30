/**
 * 宫崎骏动画美学 + 赛博朋克风格主题配置
 * Ghibli Cyberpunk Theme Configuration
 */

import { StyleSheet, Dimensions } from 'react-native';
import Colors from './colors';

const { width, height } = Dimensions.get('window');

export const Theme = {
  // 间距系统
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // 圆角系统
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
  },

  // 字体系统
  typography: {
    // 标题
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      lineHeight: 40,
      color: Colors.neutral.black,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      lineHeight: 32,
      color: Colors.neutral.black,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
      color: Colors.neutral.black,
    },
    
    // 正文
    body1: {
      fontSize: 16,
      fontWeight: 'normal' as const,
      lineHeight: 24,
      color: Colors.neutral.darkGray,
    },
    body2: {
      fontSize: 14,
      fontWeight: 'normal' as const,
      lineHeight: 20,
      color: Colors.neutral.gray,
    },
    
    // 特殊文本
    caption: {
      fontSize: 12,
      fontWeight: 'normal' as const,
      lineHeight: 16,
      color: Colors.neutral.gray,
    },
    
    // 时光邮局专用字体
    timePost: {
      fontSize: 18,
      fontWeight: '500' as const,
      lineHeight: 24,
      color: Colors.timePost.starryBlue,
      letterSpacing: 0.5,
    },
  },

  // 阴影系统
  shadows: {
    sm: {
      shadowColor: Colors.shadows.light,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: Colors.shadows.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: Colors.shadows.heavy,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    neon: {
      shadowColor: Colors.shadows.neon,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 12,
      elevation: 12,
    },
    sakura: {
      shadowColor: Colors.shadows.sakura,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
  },

  // 动画配置
  animations: {
    // 基础动画时长
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
      epic: 1000,
    },
    
    // 缓动函数
    easing: {
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      spring: 'spring',
    },
    
    // 特殊动画配置
    magicBook: {
      duration: 800,
      easing: 'ease-out',
    },
    
    soulPickup: {
      duration: 600,
      easing: 'spring',
    },
    
    timePost: {
      envelope: 1500,
      starTrail: 2000,
      hourglass: 3000,
      letterOpen: 1200,
    },
  },

  // 组件尺寸
  components: {
    // Soul按钮
    soulButton: {
      size: 80,
      borderRadius: 40,
    },
    
    // 内容卡片
    contentCard: {
      width: (width - 48) / 2, // 两列布局，间距16px
      borderRadius: 20,
      padding: 16,
    },
    
    // 导航栏
    header: {
      height: 88,
      paddingHorizontal: 16,
    },
    
    // 底部导航
    tabBar: {
      height: 84,
      paddingBottom: 24,
    },
    
    // 底部导航栏（兼容旧代码）
    bottomNav: {
      height: 60,
      safeArea: 24,
    },
    
    // 时光邮局元素
    timePost: {
      envelopeSize: 120,
      stampSize: 40,
      hourglassSize: 60,
    },
  },

  // 设备适配
  device: {
    width,
    height,
    isSmall: width < 375,
    isMedium: width >= 375 && width < 414,
    isLarge: width >= 414,
    
    // 安全区域
    safeArea: {
      top: 44,
      bottom: 34,
    },
  },

  // 字体配置
  fonts: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
} as const;

export default Theme;