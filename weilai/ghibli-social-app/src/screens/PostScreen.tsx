/**
 * 发布页面 - 支持文字、语音和时光邮局功能
 * Soul Post Screen - Text, Voice & Time Post Office
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import Colors from '../styles/colors';
import Theme from '../styles/theme';

interface PostScreenProps {
  visible?: boolean;
  onClose?: () => void;
  onPost?: (content: PostContent) => void;
}

interface PostContent {
  text?: string;
  voice?: {
    uri: string;
    duration: number;
    waveform: number[];
  };
  emotion: string;
  visibility: 'public' | 'friends' | 'private';
  timePost?: {
    deliveryTime: Date;
    recipient?: string;
    type: 'immediate' | 'scheduled' | 'timeCapsule';
  };
}

const PostScreen: React.FC<PostScreenProps> = ({ visible, onClose, onPost }) => {
  const [textContent, setTextContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('calm');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showTimePost, setShowTimePost] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'immediate' | 'scheduled' | 'timeCapsule'>('immediate');
  const [deliveryTime, setDeliveryTime] = useState<Date>(new Date());
  const [recipient, setRecipient] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  const emotions = [
    { key: 'happy', label: '开心', emoji: '😊', color: Colors.emotions.happy },
    { key: 'sad', label: '忧伤', emoji: '😢', color: Colors.emotions.sad },
    { key: 'excited', label: '兴奋', emoji: '🤩', color: Colors.emotions.excited },
    { key: 'calm', label: '平静', emoji: '😌', color: Colors.emotions.calm },
    { key: 'nostalgic', label: '怀旧', emoji: '🥺', color: Colors.emotions.nostalgic },
    { key: 'dreamy', label: '梦幻', emoji: '😇', color: Colors.emotions.dreamy },
  ];

  const deliveryOptions = [
    { key: 'immediate', label: '立即发布', icon: '🚀' },
    { key: '1hour', label: '1小时后', icon: '⏰' },
    { key: '1day', label: '1天后', icon: '📅' },
    { key: '1week', label: '1周后', icon: '🗓️' },
    { key: '1month', label: '1个月后', icon: '🌙' },
    { key: '1year', label: '1年后', icon: '🎊' },
    { key: 'custom', label: '自定义时间', icon: '⚙️' },
  ];

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handlePost = () => {
    const content: PostContent = {
      text: textContent,
      emotion: selectedEmotion,
      visibility,
      timePost: deliveryType !== 'immediate' ? {
        deliveryTime,
        recipient,
        type: deliveryType,
      } : undefined,
    };

    if (onPost) {
      onPost(content);
    }
    handleClose();
  };

  const handleClose = () => {
    setTextContent('');
    setSelectedEmotion('calm');
    setVisibility('public');
    setShowTimePost(false);
    if (onClose) {
      onClose();
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    // 模拟录音计时
    const timer = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 60) {
          clearInterval(timer);
          setIsRecording(false);
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const renderTimePostSection = () => {
    if (!showTimePost) return null;

    return (
      <View style={styles.timePostSection}>
        <Text style={styles.sectionTitle}>🕐 时光邮局</Text>
        
        {/* 投递时间选择 */}
        <View style={styles.timeSelection}>
          <Text style={styles.subSectionTitle}>选择投递时间</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {deliveryOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.timeOption,
                  deliveryType === option.key && styles.timeOptionSelected,
                ]}
                onPress={() => setDeliveryType(option.key as any)}
              >
                <Text style={styles.timeOptionIcon}>{option.icon}</Text>
                <Text style={styles.timeOptionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 收件人设置 */}
        <View style={styles.recipientSection}>
          <Text style={styles.subSectionTitle}>💌 收件人</Text>
          <View style={styles.recipientOptions}>
            <TouchableOpacity
              style={[styles.recipientOption, visibility === 'public' && styles.recipientOptionSelected]}
              onPress={() => setVisibility('public')}
            >
              <Text style={styles.recipientOptionText}>🌍 公开发布</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.recipientOption, visibility === 'private' && styles.recipientOptionSelected]}
              onPress={() => setVisibility('private')}
            >
              <Text style={styles.recipientOptionText}>🔒 私密给自己</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.recipientOption, visibility === 'friends' && styles.recipientOptionSelected]}
              onPress={() => setVisibility('friends')}
            >
              <Text style={styles.recipientOptionText}>👥 指定好友</Text>
            </TouchableOpacity>
          </View>

          {visibility === 'friends' && (
            <TextInput
              style={styles.recipientInput}
              placeholder="输入好友用户名或邮箱..."
              placeholderTextColor={Colors.neutral.gray}
              value={recipient}
              onChangeText={setRecipient}
            />
          )}
        </View>

        {/* 时光胶囊预览 */}
        <View style={styles.timeCapsulePreview}>
          <Text style={styles.subSectionTitle}>✨ 时光胶囊预览</Text>
          <View style={styles.envelopePreview}>
            <LinearGradient
              colors={[Colors.timePost.starryBlue, Colors.timePost.timeGold]}
              style={styles.envelope}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.envelopeText}>💌</Text>
              <Text style={styles.envelopeLabel}>时光胶囊</Text>
            </LinearGradient>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.modalContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* 头部 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>分享你的心情</Text>
            <TouchableOpacity onPress={handlePost}>
              <Text style={styles.postButton}>发布</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* 文字输入 */}
            <View style={styles.textSection}>
              <TextInput
                style={styles.textInput}
                placeholder="分享此刻的心情..."
                placeholderTextColor={Colors.neutral.gray}
                multiline
                maxLength={500}
                value={textContent}
                onChangeText={setTextContent}
              />
              <Text style={styles.charCount}>{textContent.length}/500</Text>
            </View>

            {/* 情感选择 */}
            <View style={styles.emotionSection}>
              <Text style={styles.sectionTitle}>选择心情色彩</Text>
              <View style={styles.emotionGrid}>
                {emotions.map((emotion) => (
                  <TouchableOpacity
                    key={emotion.key}
                    style={[
                      styles.emotionButton,
                      selectedEmotion === emotion.key && {
                        backgroundColor: emotion.color,
                        ...Theme.shadows.neon,
                      },
                    ]}
                    onPress={() => setSelectedEmotion(emotion.key)}
                  >
                    <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                    <Text style={styles.emotionLabel}>{emotion.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 语音录制 */}
            <View style={styles.voiceSection}>
              <Text style={styles.sectionTitle}>录制语音 (可选)</Text>
              <View style={styles.voiceControls}>
                {!isRecording ? (
                  <TouchableOpacity
                    style={styles.recordButton}
                    onPress={startRecording}
                  >
                    <Text style={styles.recordButtonText}>🎤 开始录音</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.recordingContainer}>
                    <TouchableOpacity
                      style={styles.stopButton}
                      onPress={stopRecording}
                    >
                      <Text style={styles.stopButtonText}>⏹️ 停止</Text>
                    </TouchableOpacity>
                    <Text style={styles.recordingTime}>{recordingTime}s / 60s</Text>
                  </View>
                )}
              </View>
            </View>

            {/* 时光邮局开关 */}
            <TouchableOpacity
              style={styles.timePostToggle}
              onPress={() => console.log('Navigate to TimePostOffice')}
            >
              <LinearGradient
                colors={[Colors.timePost.starryBlue, Colors.timePost.timeGold]}
                style={styles.timePostToggleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.timePostToggleText}>💌 时光邮局</Text>
                <Text style={styles.timePostToggleSubtext}>写给未来的信</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* 时光邮局设置 */}
            {renderTimePostSection()}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.neutral.gray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
  },
  postButton: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.mint,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  textSection: {
    marginBottom: 24,
  },
  textInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.neutral.black,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: Colors.neutral.gray,
    textAlign: 'right',
    marginTop: 8,
  },
  emotionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 12,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emotionButton: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.neutral.lightGray,
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  emotionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  emotionLabel: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    fontWeight: '500',
  },
  voiceSection: {
    marginBottom: 24,
  },
  voiceControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: Colors.primary.mint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    ...Theme.shadows.md,
  },
  recordButtonText: {
    fontSize: 16,
    color: Colors.neutral.white,
    fontWeight: '600',
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: Colors.cyberpunk.neonPink,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 16,
    ...Theme.shadows.md,
  },
  stopButtonText: {
    fontSize: 16,
    color: Colors.neutral.white,
    fontWeight: '600',
  },
  recordingTime: {
    fontSize: 16,
    color: Colors.neutral.gray,
    fontWeight: '600',
  },
  timePostToggle: {
    marginBottom: 24,
  },
  timePostToggleGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    ...Theme.shadows.lg,
  },
  timePostToggleText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.white,
    textAlign: 'center',
  },
  timePostToggleSubtext: {
    fontSize: 12,
    color: Colors.neutral.white,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 4,
  },
  timePostSection: {
    backgroundColor: Colors.timePost.starryBlue + '10',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.timePost.starryBlue,
    marginBottom: 12,
  },
  timeSelection: {
    marginBottom: 20,
  },
  timeOption: {
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    ...Theme.shadows.sm,
  },
  timeOptionSelected: {
    borderColor: Colors.timePost.timeGold,
    backgroundColor: Colors.timePost.timeGold + '20',
  },
  timeOptionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  timeOptionLabel: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    fontWeight: '500',
  },
  recipientSection: {
    marginBottom: 20,
  },
  recipientOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recipientOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.neutral.lightGray,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  recipientOptionSelected: {
    backgroundColor: Colors.timePost.starryBlue,
  },
  recipientOptionText: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    fontWeight: '500',
  },
  recipientInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.neutral.black,
  },
  timeCapsulePreview: {
    alignItems: 'center',
  },
  envelopePreview: {
    alignItems: 'center',
    padding: 20,
  },
  envelope: {
    width: 80,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.lg,
  },
  envelopeText: {
    fontSize: 24,
    marginBottom: 4,
  },
  envelopeLabel: {
    fontSize: 10,
    color: Colors.neutral.white,
    fontWeight: '600',
  },
});

export default PostScreen;