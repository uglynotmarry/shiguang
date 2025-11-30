import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, PanResponder, Dimensions, Platform } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, animated, config } from '@react-spring/three';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 交互管理器
class InteractionManager {
  private pinchScale = 1;
  private rotationVelocity = { x: 0, y: 0 };
  private lastTouchDistance = 0;
  private touchStartTime = 0;
  private isPinching = false;
  private damping = 0.95;

  // 处理缩放
  handlePinch(touches: any[]) {
    if (touches.length !== 2) return this.pinchScale;

    const touch1 = touches[0];
    const touch2 = touches[1];
    const distance = Math.sqrt(
      Math.pow(touch2.pageX - touch1.pageX, 2) + 
      Math.pow(touch2.pageY - touch1.pageY, 2)
    );

    if (!this.isPinching) {
      this.lastTouchDistance = distance;
      this.isPinching = true;
      return this.pinchScale;
    }

    const scaleDelta = distance / this.lastTouchDistance;
    this.pinchScale = Math.max(0.5, Math.min(2.0, this.pinchScale * scaleDelta));
    this.lastTouchDistance = distance;

    return this.pinchScale;
  }

  // 处理旋转
  handleRotation(deltaX: number, deltaY: number) {
    this.rotationVelocity.x += deltaX * 0.01;
    this.rotationVelocity.y += deltaY * 0.01;
  }

  // 应用惯性
  applyInertia() {
    this.rotationVelocity.x *= this.damping;
    this.rotationVelocity.y *= this.damping;
    
    // 当速度很小时停止
    if (Math.abs(this.rotationVelocity.x) < 0.001 && 
        Math.abs(this.rotationVelocity.y) < 0.001) {
      this.rotationVelocity = { x: 0, y: 0 };
    }

    return this.rotationVelocity;
  }

  // 重置状态
  reset() {
    this.isPinching = false;
    this.lastTouchDistance = 0;
  }

  getScale() {
    return this.pinchScale;
  }

  getRotation() {
    return this.rotationVelocity;
  }
}

// 内容节点接口
interface SoulNode {
  id: string;
  content: string;
  emotion: 'romantic' | 'dreamy' | 'mysterious' | 'warm';
  type: 'text' | 'voice';
  position: THREE.Vector3;
  size: number;
  heat: number;
  timestamp: number;
  isExpanded: boolean;
  distanceFromCamera: number;
  isLoading?: boolean;
}

// 动画控制器
const AnimationController = {
  // 展开动画 (300-500ms)
  expandAnimation: {
    from: { scale: 1, opacity: 0.8 },
    to: { scale: 1.5, opacity: 1 },
    config: { ...config.gentle, duration: 400 }
  },

  // 收缩动画
  collapseAnimation: {
    from: { scale: 1.5, opacity: 1 },
    to: { scale: 1, opacity: 0.8 },
    config: { ...config.gentle, duration: 350 }
  },

  // 悬停动画
  hoverAnimation: {
    from: { scale: 1 },
    to: { scale: 1.2 },
    config: { ...config.wobbly, duration: 200 }
  },

  // 点击反馈动画
  clickAnimation: {
    from: { scale: 1 },
    to: [{ scale: 0.9 }, { scale: 1.1 }, { scale: 1 }],
    config: { ...config.stiff, duration: 300 }
  }
};

// 交互式节点组件
const InteractiveSoulNode: React.FC<{ 
  node: SoulNode; 
  onNodeClick: (node: SoulNode) => void;
  cameraPosition: THREE.Vector3;
  interactionManager: InteractionManager;
}> = ({ node, onNodeClick, cameraPosition, interactionManager }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // 性能优化：距离计算
  const distance = node.position.distanceTo(cameraPosition);
  const shouldRender = distance < 12; // 渲染距离限制
  
  // 动画状态管理
  const { scale, opacity, color } = useSpring({
    scale: node.isExpanded ? 1.5 : hovered ? 1.2 : 1,
    opacity: shouldRender ? (node.isLoading ? 0.5 : 1) : 0,
    color: hovered ? '#ffffff' : '#7DD3C0',
    config: node.isExpanded ? AnimationController.expandAnimation.config : 
            AnimationController.hoverAnimation.config
  });

  // 点击处理
  const handleClick = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    onNodeClick(node);
    
    // 动画完成后重置状态
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  }, [node, onNodeClick, isAnimating]);

  // 触摸反馈
  const handlePointerDown = useCallback(() => {
    if (meshRef.current) {
      // 触觉反馈（如果支持）
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // React Native的触觉反馈API
      }
    }
  }, []);

  if (!shouldRender) return null;

  const nodeSize = (node.size / 100) * (0.8 + node.heat * 0.4);
  const emotionColor = node.emotion === 'romantic' ? '#FC466B' : 
                      node.emotion === 'dreamy' ? '#A8E6CF' :
                      node.emotion === 'mysterious' ? '#667eea' : '#f093fb';

  return (
    <animated.group 
      position={node.position} 
      scale={scale}
    >
      {/* 主节点 */}
      <animated.mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[nodeSize, 16, 16]} />
        <animated.meshStandardMaterial
          color={emotionColor}
          emissive={color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          transparent
          opacity={opacity}
        />
      </animated.mesh>

      {/* 加载状态指示器 */}
      {node.isLoading && (
        <LoadingSpinner position={[0, nodeSize + 0.3, 0]} />
      )}

      {/* 内容预览 - 高质量渲染时 */}
      {distance < 8 && !node.isExpanded && (
        <ContentPreview 
          node={node} 
          nodeSize={nodeSize} 
          isLoading={node.isLoading}
        />
      )}

      {/* 展开内容组件 */}
      {node.isExpanded && (
        <ExpandedContent 
          node={node} 
          nodeSize={nodeSize}
          onClose={() => onNodeClick(node)}
        />
      )}

      {/* 粒子效果 - 基于热度 */}
      {node.heat > 0.6 && distance < 10 && (
        <HeatParticleEffect 
          position={node.position}
          intensity={node.heat}
          color={emotionColor}
        />
      )}
    </animated.group>
  );
};

// 加载旋转指示器
const LoadingSpinner: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <ringGeometry args={[0.1, 0.15, 8]} />
      <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
    </mesh>
  );
};

// 内容预览组件
const ContentPreview: React.FC<{ node: SoulNode; nodeSize: number; isLoading?: boolean }> = ({ 
  node, nodeSize, isLoading 
}) => {
  if (isLoading) {
    return (
      <Text
        position={[0, nodeSize + 0.4, 0]}
        fontSize={0.08}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
      >
        加载中...
      </Text>
    );
  }

  return (
    <>
      {node.type === 'text' ? (
        <Text
          position={[0, nodeSize + 0.3, 0]}
          fontSize={0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.5}
        >
          {node.content.length > 12 ? node.content.substring(0, 12) + '...' : node.content}
        </Text>
      ) : (
        <VoiceIndicator position={[0, nodeSize + 0.3, 0]} duration={Math.floor(Math.random() * 60) + 10} />
      )}
    </>
  );
};

// 语音指示器
const VoiceIndicator: React.FC<{ position: [number, number, number]; duration: number }> = ({ 
  position, duration 
}) => {
  return (
    <group position={position}>
      {/* 波形图标 */}
      <mesh>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
      
      {/* 时长标签 */}
      <Text
        position={[0.15, 0, 0]}
        fontSize={0.06}
        color="#FFD700"
        anchorX="left"
        anchorY="middle"
      >
        {duration}s
      </Text>
    </group>
  );
};

// 展开内容组件
const ExpandedContent: React.FC<{ node: SoulNode; nodeSize: number; onClose: () => void }> = ({ 
  node, nodeSize, onClose 
}) => {
  return (
    <group>
      {/* 背景面板 */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[2.5, 1.8]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.9} />
      </mesh>
      
      {/* 关闭按钮 */}
      <mesh position={[1, 0.7, 0.01]} onClick={onClose}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#FC466B" />
      </mesh>
      
      {/* 内容文本 */}
      <Text
        position={[0, 0.3, 0.01]}
        fontSize={0.08}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.2}
      >
        {node.content}
      </Text>
      
      {/* 情感标签 */}
      <Text
        position={[0.06, -0.4, 0.01]}
        fontSize={0.06}
        color={node.emotion === 'romantic' ? '#FC466B' : '#7DD3C0'}
        anchorX="center"
        anchorY="middle"
      >
        💕 {node.emotion} • {new Date(node.timestamp).toLocaleTimeString()}
      </Text>
      
      {/* 热度指示器 */}
      <HeatIndicator position={[0.06, -0.6, 0.01]} heat={node.heat} />
    </group>
  );
};

// 热度指示器
const HeatIndicator: React.FC<{ position: [number, number, number]; heat: number }> = ({ 
  position, heat 
}) => {
  const hearts = Math.ceil(heat * 5);
  const heartIcons = '💕'.repeat(hearts);
  
  return (
    <Text
      position={position}
      fontSize={0.05}
      color="#FFD700"
      anchorX="center"
      anchorY="middle"
    >
      {heartIcons}
    </Text>
  );
};

// 热度粒子效果
const HeatParticleEffect: React.FC<{ position: THREE.Vector3; intensity: number; color: string }> = ({ 
  position, intensity, color 
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = Math.floor(15 * intensity);
  
  const particles = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particles[i3] = (Math.random() - 0.5) * 0.8;
    particles[i3 + 1] = (Math.random() - 0.5) * 0.8;
    particles[i3 + 2] = (Math.random() - 0.5) * 0.8;
  }

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.02 * intensity;
      pointsRef.current.rotation.x += 0.01 * intensity;
    }
  });

  return (
    <points ref={pointsRef} position={position.toArray()}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles}
          count={particleCount}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.03 * intensity}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
};

// 主交互组件
const SoulSphereInteractive: React.FC = () => {
  const [soulNodes, setSoulNodes] = useState<SoulNode[]>([]);
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [interactionState, setInteractionState] = useState({
    scale: 1,
    isRotating: false,
    isPinching: false
  });
  
  const interactionManagerRef = useRef(new InteractionManager());
  const cameraRef = useRef<THREE.Camera>();
  const controlsRef = useRef<any>(null);

  // 生成球面节点 - 使用斐波那契螺旋
  const generateSphereNodes = useCallback((): SoulNode[] => {
    const nodes: SoulNode[] = [];
    const nodeCount = 36; // 控制节点密度
    const radius = 3;
    
    // 斐波那契螺旋算法确保均匀分布
    const phi = Math.PI * (3 - Math.sqrt(5)); // 黄金角度
    
    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      
      const x = Math.cos(theta) * radiusAtY * radius;
      const z = Math.sin(theta) * radiusAtY * radius;
      const yPos = y * radius;
      
      const emotions: SoulNode['emotion'][] = ['romantic', 'dreamy', 'mysterious', 'warm'];
      const types: SoulNode['type'][] = ['text', 'voice'];
      
      nodes.push({
        id: `soul-${i}`,
        content: generateContent(),
        emotion: emotions[Math.floor(Math.random() * emotions.length)],
        type: types[Math.floor(Math.random() * types.length)],
        position: new THREE.Vector3(x, yPos, z),
        size: 30 + Math.random() * 30, // 30-60px
        heat: Math.random(),
        timestamp: Date.now() - Math.random() * 86400000,
        isExpanded: false,
        distanceFromCamera: 0,
        isLoading: Math.random() > 0.8 // 模拟加载状态
      });
    }
    
    return nodes;
  }, []);

  // 生成内容
  const generateContent = () => {
    const contents = [
      '今天心情超棒', '想分享给你', '树洞里的秘密', '最美的日落',
      '天空之城的梦', '阳光明媚', '想对你说', '美丽的地方',
      '小确幸时光', '浪漫时刻', '温暖午后', '梦幻夜晚'
    ];
    return contents[Math.floor(Math.random() * contents.length)];
  };

  // 节点点击处理
  const handleNodeClick = useCallback((node: SoulNode) => {
    if (expandedNode === node.id) {
      setExpandedNode(null);
      setSoulNodes(prev => prev.map(n => 
        n.id === node.id ? { ...n, isExpanded: false } : n
      ));
    } else {
      // 先关闭其他节点
      setSoulNodes(prev => prev.map(n => ({ ...n, isExpanded: false })));
      
      setTimeout(() => {
        setExpandedNode(node.id);
        setSoulNodes(prev => prev.map(n => 
          n.id === node.id ? { ...n, isExpanded: true } : n
        ));
      }, 100);
    }
  }, [expandedNode]);

  // 触摸事件处理
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        
        if (touches.length === 2) {
          // 双指缩放
          setInteractionState(prev => ({ ...prev, isPinching: true }));
        } else if (touches.length === 1) {
          // 单指旋转
          setInteractionState(prev => ({ ...prev, isRotating: true }));
        }
      },
      
      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        
        if (touches.length === 2) {
          // 双指缩放处理
          const scale = interactionManagerRef.current.handlePinch(touches);
          setInteractionState(prev => ({ ...prev, scale }));
        } else if (touches.length === 1 && interactionState.isRotating) {
          // 单指旋转处理
          const deltaX = evt.nativeEvent.pageX - (evt.nativeEvent.previousPageX || 0);
          const deltaY = evt.nativeEvent.pageY - (evt.nativeEvent.previousPageY || 0);
          
          interactionManagerRef.current.handleRotation(deltaX, deltaY);
        }
      },
      
      onPanResponderRelease: () => {
        setInteractionState(prev => ({ 
          ...prev, 
          isRotating: false, 
          isPinching: false 
        }));
        interactionManagerRef.current.reset();
      }
    })
  ).current;

  // 初始化
  useEffect(() => {
    const nodes = generateSphereNodes();
    setSoulNodes(nodes);
  }, [generateSphereNodes]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={styles.canvas}
        gl={{ antialias: Platform.OS === 'ios', alpha: false }}
        dpr={[1, Platform.OS === 'ios' ? 2 : 1.5]}
      >
        {/* 动态光照 */}
        <ambientLight intensity={0.4} />
        <pointLight 
          position={[interactionState.scale * 5, 5, 5]} 
          intensity={0.6 * interactionState.scale} 
        />
        
        {/* 交互式节点 */}
        {soulNodes.map((node) => (
          <InteractiveSoulNode
            key={node.id}
            node={node}
            onNodeClick={handleNodeClick}
            cameraPosition={cameraRef.current?.position || new THREE.Vector3(0, 0, 8)}
            interactionManager={interactionManagerRef.current}
          />
        ))}
        
        {/* 优化的轨道控制器 */}
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={4}
          maxDistance={12}
          zoomSpeed={0.4}
          rotateSpeed={0.3}
          autoRotate={!interactionState.isRotating}
          autoRotateSpeed={0.1}
          enableDamping={true}
          dampingFactor={0.95}
        />
      </Canvas>
      
      {/* 交互状态指示器 */}
      <View style={styles.interactionIndicator}>
        <View style={[styles.indicator, { 
          backgroundColor: interactionState.isRotating ? '#7DD3C0' : '#333' 
        }]}>
          <Text style={styles.indicatorText}>旋转</Text>
        </View>
        <View style={[styles.indicator, { 
          backgroundColor: interactionState.isPinching ? '#FC466B' : '#333' 
        }]}>
          <Text style={styles.indicatorText}>缩放</Text>
        </View>
        <View style={styles.indicator}>
          <Text style={styles.indicatorText}>{interactionState.scale.toFixed(1)}x</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  canvas: {
    flex: 1,
  },
  interactionIndicator: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  indicator: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 192, 0.3)',
  },
  indicatorText: {
    color: '#7DD3C0',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SoulSphereInteractive;
