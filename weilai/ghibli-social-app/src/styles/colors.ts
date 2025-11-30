/**
 * 宫崎骏动画美学 + 赛博朋克风格色彩方案
 * Ghibli Cyberpunk Color Palette
 */

export const Colors = {
  // 主色调 - 宫崎骏动画柔和色彩
  primary: {
    mint: '#7DD3C0',      // 薄荷绿 - 天空之城的清新
    lavender: '#C084FC',  // 薰衣草紫 - 魔女宅急便的魔法
    peach: '#FB923C',     // 蜜桃橙 - 龙猫的温暖
    sakura: '#FBBF24',    // 樱花黄 - 春天的希望
  },

  // 赛博朋克强调色
  cyberpunk: {
    neonBlue: '#00D9FF',  // 霓虹蓝
    neonPink: '#FF0080',  // 霓虹粉
    electricPurple: '#B400FF', // 电紫
    acidGreen: '#00FF41', // 酸绿
  },

  // 时光邮局专色
  timePost: {
    starryBlue: '#1E3A8A', // 星空蓝
    timeGold: '#F59E0B',  // 时光金
    twilight: '#6366F1',  // 暮光紫
    dawn: '#F97316',      // 黎明橙
  },

  // 中性色
  neutral: {
    white: '#FFFFFF',
    lightGray: '#F8FAFC',
    gray: '#64748B',
    darkGray: '#374151',
    black: '#1F2937',
  },

  // 渐变色彩
  gradients: {
    sky: ['#E0F2FE', '#BAE6FD', '#7DD3FC'], // 天空渐变
    sunset: ['#FED7AA', '#FDBA74', '#FB923C'], // 日落渐变
    forest: ['#DCFCE7', '#BBF7D0', '#86EFAC'], // 森林渐变
    ocean: ['#DBEAFE', '#BFDBFE', '#93C5FD'], // 海洋渐变
    cyber: ['#00D9FF', '#B400FF', '#FF0080'], // 赛博渐变
    time: ['#1E3A8A', '#6366F1', '#F59E0B'], // 时光渐变
  },

  // 情绪色彩映射
  emotions: {
    happy: '#FBBF24',     // 快乐 - 阳光黄
    sad: '#60A5FA',       // 忧伤 - 天空蓝
    excited: '#FB7185',   // 兴奋 - 珊瑚粉
    calm: '#34D399',      // 平静 - 翡翠绿
    nostalgic: '#A78BFA', // 怀旧 - 紫罗兰
    dreamy: '#C084FC',    // 梦幻 - 薰衣草紫
  },

  // 背景透明度
  opacity: {
    light: 0.1,
    medium: 0.3,
    heavy: 0.6,
    full: 1.0,
  },

  // 阴影色彩
  shadows: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    heavy: 'rgba(0, 0, 0, 0.3)',
    neon: 'rgba(0, 217, 255, 0.5)',
    sakura: 'rgba(251, 191, 36, 0.3)',
  },

  // 背景色
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
  },

  // 文字颜色
  text: {
    primary: '#1F2937',
    secondary: '#64748B',
    tertiary: '#94A3B8',
  },
} as const;

export default Colors;