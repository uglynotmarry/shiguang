import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text as Text3D, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const { width, height } = Dimensions.get('window');

// 简化的灵魂节点组件
const SimpleSoulNode = ({ position, content, emotion, onClick, isExpanded }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // 情感色彩映射
  const emotionColors = {
    romantic: '#FC466B',
    dreamy: '#A8E6CF', 
    mysterious: '#667eea',
    warm: '#f093fb'
  };

  const color = emotionColors[emotion] || '#7DD3C0';

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      // 轻微的上下浮动
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* 主节点 */}
      <Sphere
        ref={meshRef}
        args={[0.15, 16, 16]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          transparent
          opacity={0.9}
        />
      </Sphere>
      
      {/* 光晕效果 */}
      <Sphere args={[0.2, 16, 16]}>
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={hovered ? 0.2 : 0.1}
        />
      </Sphere>

      {/* 内容预览 */}
      {!isExpanded && (
        <Text3D
          position={[0, 0.3, 0]}
          fontSize={0.08}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.5}
        >
          {content.length > 8 ? content.substring(0, 8) + '...' : content}
        </Text3D>
      )}

      {/* 展开状态 */}
      {isExpanded && (
        <group>
          {/* 背景面板 */}
          <mesh position={[0, 0, -0.1]}>
            <planeGeometry args={[2, 1.5]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.8} />
          </mesh>
          
          {/* 完整内容 */}
          <Text3D
            position={[0, 0.2, 0.01]}
            fontSize={0.06}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.8}
          >
            {content}
          </Text3D>
          
          {/* 情感标签 */}
          <Text3D
            position={[0.06, -0.3, 0.01]}
            fontSize={0.05}
            color={color}
            anchorX="center"
            anchorY="middle"
          >
            💕 {emotion}
          </Text3D>
        </group>
      )}
    </group>
  );
};

// 简化的3D球体组件
const SimpleSoulSphere = ({ onNodeSelect }) => {
  const [soulNodes, setSoulNodes] = useState([]);
  const [expandedNode, setExpandedNode] = useState(null);

  // 生成球面节点
  const generateNodes = () => {
    const nodes = [];
    const nodeCount = 24; // 24个节点，适合移动设备性能
    const radius = 2.5;
    
    // 简化的球面分布
    for (let i = 0; i < nodeCount; i++) {
      const phi = (i / nodeCount) * Math.PI * 2;
      const theta = (i / nodeCount) * Math.PI;
      
      const x = Math.sin(theta) * Math.cos(phi) * radius;
      const y = Math.cos(theta) * radius;
      const z = Math.sin(theta) * Math.sin(phi) * radius;
      
      const emotions = ['romantic', 'dreamy', 'mysterious', 'warm'];
      const contents = [
        '今天心情很好', '想分享给你', '树洞里的秘密', '最美的日落',
        '天空之城的梦', '阳光明媚', '想对你说', '美丽的地方',
        '小确幸时光', '浪漫时刻', '温暖午后', '梦幻夜晚'
      ];
      
      nodes.push({
        id: `soul-${i}`,
        position: [x, y, z],
        content: contents[i % contents.length],
        emotion: emotions[i % emotions.length],
        type: Math.random() > 0.5 ? 'text' : 'voice',
        heat: Math.random(),
        timestamp: Date.now() - Math.random() * 86400000
      });
    }
    
    return nodes;
  };

  // 节点点击处理
  const handleNodeClick = (node) => {
    if (expandedNode === node.id) {
      setExpandedNode(null);
    } else {
      setExpandedNode(node.id);
      onNodeSelect?.(node);
    }
  };

  // 初始化
  useEffect(() => {
    const nodes = generateNodes();
    setSoulNodes(nodes);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        style={{ flex: 1 }}
        gl={{ 
          antialias: false, // 关闭抗锯齿以提高性能
          alpha: false,     // 关闭透明度
          powerPreference: 'high-performance' // 优先性能
        }}
      >
        {/* 环境光 */}
        <ambientLight intensity={0.4} />
        
        {/* 主光源 */}
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.8}
          castShadow={false} // 关闭阴影以提高性能
        />
        
        {/* 背景球体 */}
        <Sphere args={[2.8, 32, 32]}>
          <meshStandardMaterial 
            color="#1a1a2e"
            transparent
            opacity={0.1}
            wireframe={true}
          />
        </Sphere>
        
        {/* 灵魂节点 */}
        {soulNodes.map((node) => (
          <SimpleSoulNode
            key={node.id}
            position={node.position}
            content={node.content}
            emotion={node.emotion}
            onClick={() => handleNodeClick(node)}
            isExpanded={expandedNode === node.id}
          />
        ))}
        
        {/* 轨道控制器 - 针对移动设备优化 */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={4}
          maxDistance={8}
          zoomSpeed={0.3}
          rotateSpeed={0.2}
          autoRotate={true}
          autoRotateSpeed={0.05} // 缓慢的自动旋转
          enableDamping={true}
          dampingFactor={0.95}
        />
      </Canvas>
      
      {/* 性能指示器 */}
      <View style={styles.performanceIndicator}>
        <Text style={styles.performanceText}>
          节点: {soulNodes.length} | 展开: {expandedNode ? '1' : '0'}
        </Text>
      </View>
    </View>
  );
};

// Android优化的球体屏幕
const SoulSphereAndroidScreen = ({ navigation }) => {
  const handleNodeSelect = (node) => {
    console.log('选中节点:', node);
    // 可以在这里添加导航到详情页的逻辑
  };

  return (
    <View style={styles.container}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <Text style={styles.title}>🌐 灵魂星球</Text>
        <Text style={styles.subtitle}>触摸球面探索灵魂内容</Text>
      </View>
      
      {/* 3D球体 */}
      <View style={styles.sphereContainer}>
        <SimpleSoulSphere onNodeSelect={handleNodeSelect} />
      </View>
      
      {/* 底部提示 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 轻触节点查看内容{'\n'}
          🤏 双指缩放 • 👆 拖拽旋转
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 25 : 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(125, 211, 192, 0.3)',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7DD3C0',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  sphereContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  performanceIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 8,
  },
  performanceText: {
    color: '#7DD3C0',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  footer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(125, 211, 192, 0.3)',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SoulSphereAndroidScreen;
