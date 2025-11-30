import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text as Text3D, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';

// 完整的3D球体社交界面组件
interface SoulSphereAppProps {
  onNodeSelect?: (node: any) => void;
  onBackPress?: () => void;
}

// 主应用组件
const SoulSphereApp: React.FC<SoulSphereAppProps> = ({ onNodeSelect, onBackPress }) => {
  const [currentView, setCurrentView] = useState<'sphere' | 'list' | 'detail'>('sphere');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 动态加载组件
  const SoulSphereInteractive = useMemo(() => {
    try {
      return require('./SoulSphereInteractive').default;
    } catch (error) {
      console.warn('SoulSphereInteractive not available, using fallback');
      return null;
    }
  }, []);

  const SoulSphereOptimized = useMemo(() => {
    try {
      return require('./SoulSphereOptimized').default;
    } catch (error) {
      console.warn('SoulSphereOptimized not available, using fallback');
      return null;
    }
  }, []);

  // 节点选择处理
  const handleNodeSelect = useCallback((node: any) => {
    setSelectedNode(node);
    setCurrentView('detail');
    onNodeSelect?.(node);
  }, [onNodeSelect]);

  // 返回处理
  const handleBack = useCallback(() => {
    if (currentView === 'detail') {
      setCurrentView('sphere');
      setSelectedNode(null);
    } else if (currentView === 'list') {
      setCurrentView('sphere');
    } else {
      onBackPress?.();
    }
  }, [currentView, onBackPress]);

  // 渲染不同视图
  const renderCurrentView = () => {
    switch (currentView) {
      case 'sphere':
        return renderSphereView();
      case 'list':
        return renderListView();
      case 'detail':
        return renderDetailView();
      default:
        return renderSphereView();
    }
  };

  // 球体视图
  const renderSphereView = () => {
    if (SoulSphereInteractive) {
      return <SoulSphereInteractive onNodeSelect={handleNodeSelect} />;
    } else if (SoulSphereOptimized) {
      return <SoulSphereOptimized onNodeSelect={handleNodeSelect} />;
    } else {
      return <FallbackSphereView onNodeSelect={handleNodeSelect} />;
    }
  };

  // 列表视图
  const renderListView = () => {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>灵魂内容列表</Text>
        </View>
        
        <View style={styles.listContainer}>
          <Text style={styles.listText}>列表视图开发中...</Text>
        </View>
      </View>
    );
  };

  // 详情视图
  const renderDetailView = () => {
    if (!selectedNode) return null;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>灵魂详情</Text>
        </View>
        
        <View style={styles.detailContainer}>
          <View style={[styles.emotionBadge, { 
            backgroundColor: getEmotionColor(selectedNode.emotion) 
          }]}>
            <Text style={styles.emotionText}>
              {getEmotionEmoji(selectedNode.emotion)} {selectedNode.emotion}
            </Text>
          </View>
          
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>{selectedNode.content}</Text>
            <Text style={styles.timestampText}>
              {new Date(selectedNode.timestamp).toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>💕 喜欢</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>💬 评论</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📤 分享</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 顶部导航 */}
      <View style={styles.navigationBar}>
        <View style={styles.viewSwitcher}>
          <TouchableOpacity 
            style={[styles.viewButton, currentView === 'sphere' && styles.viewButtonActive]}
            onPress={() => setCurrentView('sphere')}
          >
            <Text style={[styles.viewButtonText, currentView === 'sphere' && styles.viewButtonTextActive]}>
              🌐 球体
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.viewButton, currentView === 'list' && styles.viewButtonActive]}
            onPress={() => setCurrentView('list')}
          >
            <Text style={[styles.viewButtonText, currentView === 'list' && styles.viewButtonTextActive]}>
              📋 列表
            </Text>
          </TouchableOpacity>
        </View>
        
        {currentView !== 'sphere' && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← 返回</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 主要内容区域 */}
      {renderCurrentView()}

      {/* 底部状态栏 */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          当前模式: {currentView === 'sphere' ? '3D球体' : currentView === 'list' ? '列表' : '详情'}
        </Text>
        {selectedNode && (
          <Text style={styles.statusText}>
            选中: {selectedNode.content.substring(0, 20)}...
          </Text>
        )}
      </View>
    </View>
  );
};

// 备用球体视图（当3D组件不可用时）
const FallbackSphereView: React.FC<{ onNodeSelect?: (node: any) => void }> = ({ onNodeSelect }) => {
  const [nodes] = useState([
    { id: '1', content: '今天心情很好', emotion: 'romantic' },
    { id: '2', content: '想分享给你', emotion: 'dreamy' },
    { id: '3', content: '树洞里的秘密', emotion: 'mysterious' },
    { id: '4', content: '最美的日落', emotion: 'warm' },
  ]);

  return (
    <View style={styles.fallbackContainer}>
      <Text style={styles.fallbackTitle}>3D球体界面</Text>
      <Text style={styles.fallbackSubtitle}>正在加载中...</Text>
      
      <View style={styles.fallbackNodes}>
        {nodes.map((node) => (
          <TouchableOpacity 
            key={node.id} 
            style={[styles.fallbackNode, { backgroundColor: getEmotionColor(node.emotion) }]}
            onPress={() => onNodeSelect?.(node)}
          >
            <Text style={styles.fallbackNodeText}>{node.content}</Text>
            <Text style={styles.fallbackNodeEmoji}>{getEmotionEmoji(node.emotion)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// 辅助函数
const getEmotionColor = (emotion: string): string => {
  const colors = {
    romantic: '#FC466B',
    dreamy: '#A8E6CF',
    mysterious: '#667eea',
    warm: '#f093fb'
  };
  return colors[emotion as keyof typeof colors] || '#7DD3C0';
};

const getEmotionEmoji = (emotion: string): string => {
  const emojis = {
    romantic: '💕',
    dreamy: '🌙',
    mysterious: '🔮',
    warm: '🔥'
  };
  return emojis[emotion as keyof typeof emojis] || '✨';
};

// 样式
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(125, 211, 192, 0.3)',
  },
  viewSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 4,
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  viewButtonActive: {
    backgroundColor: 'rgba(125, 211, 192, 0.3)',
  },
  viewButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  viewButtonTextActive: {
    color: '#7DD3C0',
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(252, 70, 107, 0.2)',
    borderRadius: 16,
  },
  backButtonText: {
    color: '#FC466B',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  title: {
    color: '#7DD3C0',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  listContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  detailContainer: {
    flex: 1,
    padding: 20,
  },
  emotionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  emotionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  contentCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  contentText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  timestampText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(125, 211, 192, 0.3)',
  },
  statusText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  fallbackTitle: {
    color: '#7DD3C0',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fallbackSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    marginBottom: 30,
  },
  fallbackNodes: {
    width: '100%',
  },
  fallbackNode: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginVertical: 8,
    borderRadius: 16,
  },
  fallbackNodeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fallbackNodeEmoji: {
    fontSize: 24,
  },
});

export default SoulSphereApp;