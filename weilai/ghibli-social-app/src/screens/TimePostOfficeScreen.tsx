/**
 * 时光邮局屏幕
 * Time Post Office Screen
 * 结合宫崎骏动画的浪漫美学与赛博朋克科技感的时光邮件发送界面
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../styles/colors';
import { Theme } from '../styles/theme';

interface TimePostOfficeScreenProps {
  navigation: any;
}

const TimePostOfficeScreen: React.FC<TimePostOfficeScreenProps> = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedEnvelope, setSelectedEnvelope] = useState('star');
  const [isSending, setIsSending] = useState(false);

  // 动画值
  const envelopeScale = useSharedValue(1);
  const hourglassRotation = useSharedValue(0);
  const starTrailOffset = useSharedValue(0);
  const letterOpacity = useSharedValue(1);

  const envelopeTypes = [
    { id: 'star', name: '星空', icon: '⭐', colors: [Colors.timePost.starryBlue, Colors.cyberpunk.electricPurple] },
    { id: 'heart', name: '心动', icon: '💖', colors: [Colors.cyberpunk.neonPink, Colors.primary.peach] },
    { id: 'moon', name: '月影', icon: '🌙', colors: [Colors.primary.lavender, Colors.cyberpunk.neonBlue] },
    { id: 'flower', name: '花语', icon: '🌸', colors: [Colors.primary.mint, Colors.primary.sakura] },
  ];

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
      startHourglass();
    }
  };

  const handleSend = () => {
    if (!content.trim() || !recipient.trim()) {
      alert('请填写完整的内容和收件人');
      return;
    }

    setIsSending(true);
    startStarTrail();

    setTimeout(() => {
      alert(`时光邮件已寄出！将在 ${selectedDate.toLocaleDateString()} 送达给 ${recipient}`);
      setIsSending(false);
      navigation.goBack();
    }, 3000);
  };

  const handleEnvelopePress = (envelopeId: string) => {
    setSelectedEnvelope(envelopeId);
    
    // 信封选择动画
    envelopeTypes.forEach((type) => {
      if (type.id === envelopeId) {
        envelopeScale.value = withSequence(
          withSpring(1.2, { damping: 10, stiffness: 200 }),
          withSpring(1, { damping: 15, stiffness: 150 })
        );
      }
    });
  };

  const startHourglass = () => {
    hourglassRotation.value = withTiming(360, { duration: 3000 });
    triggerStarTrail();
  };

  const triggerStarTrail = () => {
    starTrailOffset.value = withSequence(
      withTiming(1, { duration: 1500 }),
      withTiming(0, { duration: 1500 })
    );
  };

  const startStarTrail = () => {
    letterOpacity.value = withTiming(0, { duration: 1000 });
    starTrailOffset.value = withSequence(
      withTiming(2, { duration: 2000 }),
      withTiming(0, { duration: 1000 })
    );
  };

  // 动画样式
  const envelopeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: envelopeScale.value }],
  }));

  const hourglassAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${hourglassRotation.value}deg` }],
  }));

  const starTrailAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: starTrailOffset.value * 100 }],
    opacity: interpolate(starTrailOffset.value, [0, 1], [0, 1], Extrapolate.CLAMP),
  }));

  const letterAnimatedStyle = useAnimatedStyle(() => ({
    opacity: letterOpacity.value,
  }));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>时光邮局</Text>
        <Text style={styles.subtitle}>寄一封信给未来</Text>
      </View>

      {/* 信封选择 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>选择信封</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.envelopeScroll}>
          {envelopeTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.envelopeOption,
                selectedEnvelope === type.id && styles.envelopeOptionSelected,
              ]}
              onPress={() => handleEnvelopePress(type.id)}
            >
              <Animated.View style={[styles.envelope, envelopeAnimatedStyle]}>
                <LinearGradient
                  colors={[type.colors[0], type.colors[1]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.envelopeGradient}
                >
                  <Text style={styles.envelopeIcon}>{type.icon}</Text>
                  <Text style={styles.envelopeName}>{type.name}</Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 收件人 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>收件人</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="请输入收件人昵称或邮箱"
            placeholderTextColor={Colors.text.secondary}
            value={recipient}
            onChangeText={setRecipient}
          />
        </View>
      </View>

      {/* 送达时间 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>送达时间</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Animated.View style={hourglassAnimatedStyle}>
            <Text style={styles.hourglass}>⏳</Text>
          </Animated.View>
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>选择送达日期</Text>
            <Text style={styles.dateValue}>{selectedDate.toLocaleDateString()}</Text>
          </View>
          <Text style={styles.calendarIcon}>📅</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>

      {/* 内容 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>想说的话</Text>
        <View style={styles.textAreaContainer}>
          <Animated.View style={letterAnimatedStyle}>
            <TextInput
              style={styles.textArea}
              placeholder="写下你想对未来说的话..."
              placeholderTextColor={Colors.text.secondary}
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={500}
            />
          </Animated.View>
          <Text style={styles.charCount}>{content.length}/500</Text>
        </View>
      </View>

      {/* 隐私设置 */}
      <View style={styles.section}>
        <View style={styles.privacyRow}>
          <Text style={styles.sectionTitle}>私密邮件</Text>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: Colors.neutral.lightGray, true: Colors.cyberpunk.neonBlue }}
            thumbColor={isPrivate ? Colors.cyberpunk.neonPink : Colors.neutral.white}
          />
        </View>
        <Text style={styles.privacyHint}>私密邮件只有收件人可见</Text>
      </View>

      {/* 发送按钮 */}
      <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
        <LinearGradient
          colors={[Colors.cyberpunk.neonPink, Colors.cyberpunk.electricPurple, Colors.timePost.timeGold]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sendGradient}
        >
          <Text style={styles.sendButtonText}>寄出时光邮件 📮</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: Theme.fonts.bold,
    color: Colors.timePost.starryBlue,
    marginBottom: 8,
    textShadowColor: Colors.cyberpunk.electricPurple,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Theme.fonts.regular,
    color: Colors.text.secondary,
    opacity: 0.8,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Theme.fonts.semibold,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  envelopeScroll: {
    marginHorizontal: -24,
  },
  envelopeOption: {
    marginLeft: 24,
  },
  envelopeOptionSelected: {
    transform: [{ scale: 1.05 }],
  },
  envelope: {
    width: 120,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    ...Theme.shadows.md,
  },
  envelopeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  envelopeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  envelopeName: {
    fontSize: 12,
    fontFamily: Theme.fonts.medium,
    color: Colors.neutral.white,
  },
  inputContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: 16,
  },
  input: {
    height: 50,
    fontSize: 16,
    fontFamily: Theme.fonts.regular,
    color: Colors.text.primary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
  },
  hourglass: {
    marginRight: 12,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontFamily: Theme.fonts.medium,
    color: Colors.text.primary,
  },
  calendarIcon: {
    fontSize: 20,
  },
  textAreaContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    minHeight: 120,
  },
  textArea: {
    fontSize: 16,
    fontFamily: Theme.fonts.regular,
    color: Colors.text.primary,
    minHeight: 80,
  },
  charCount: {
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
    color: Colors.text.secondary,
    textAlign: 'right',
    marginTop: 8,
  },
  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  privacyHint: {
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  sendButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    ...Theme.shadows.lg,
  },
  sendGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 18,
    fontFamily: Theme.fonts.semibold,
    color: Colors.neutral.white,
    textShadowColor: Colors.shadows.heavy,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default TimePostOfficeScreen;