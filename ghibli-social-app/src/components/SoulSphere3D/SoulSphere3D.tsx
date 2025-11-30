import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, Platform } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Points } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 球体节点接口
interface SoulNode {
  id: string;
  content: string;
  emotion: 'romantic' | 'dreamy' | 'mysterious' | 'warm';
  type: 'text' | 'voice';
  position: THREE.Vector3;
  size: number; // 30-60px
  heat: number; // 热度值 0-1
  timestamp: number;
  isExpanded: boolean;
  distanceFromCamera: number;
}

// 球体参数
const SPHERE_RADIUS = 3;
const NODES_PER_10_DEGREE = 4; // 每10°弧长3-5个节点
const MAX_VISIBLE_NODES = 15;
const LOD_THRESHOLD = 70; // 超过70°降低渲染精度

// 情感色彩映射
const emotionColors = {
  romantic: ['#FC466B', '#3F5EFB'],
  dreamy: ['#A8E6CF', '#7DD3C0'],
  mysterious: ['#667eea', '#764ba2'],
  warm: ['#f093fb', '#f5576c']
};

// 节点组件
const SoulNodeComponent: React.FC<{ 
  node: SoulNode; 
  onNodeClick: (node: SoulNode) => void;
  cameraPosition: THREE.Vector3;
}> = ({ node, onNodeClick, cameraPosition }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // 计算与相机的距离和角度
  const distance = node.position.distanceTo(cameraPosition);
  const angle = node.position.angleTo(cameraPosition) * (180 / Math.PI);
  
  // LOD逻辑：距离超过阈值降低渲染精度
  const shouldRenderHighQuality = angle < LOD_THRESHOLD && distance < SPHERE_RADIUS * 2;
  
  // 弹簧动画
  const { scale, opacity } = useSpring({
    scale: node.isExpanded ? 1.5 : hovered ? 1.2 : 1,
    opacity: shouldRenderHighQuality ? 1 : 0.6,
    config: { tension: 300, friction: 20 }
  });

  // 动态调整节点大小基于热度
  const nodeSize = (node.size / 100) * (0.8 + node.heat * 0.4);

  return (
    <animated.group 
      position={node.position} 
      scale={scale}
    >
      {/* 主节点球体 */}
      <animated.mesh
        ref={meshRef}
        onClick={() => onNodeClick(node)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[nodeSize, 16, 16]} />
        <animated.meshStandardMaterial
          color={emotionColors[node.emotion][0]}
          emissive={emotionColors[node.emotion][1]}
          emissiveIntensity={0.2}
          transparent
          opacity={opacity}
        />
      </animated.mesh>

      {/* 节点光晕效果 */}
      <animated.mesh scale={1.5}>
        <sphereGeometry args={[nodeSize * 1.2, 16, 16]} />
        <animated.meshBasicMaterial
          color={emotionColors[node.emotion][1]}
          transparent
          opacity={opacity.to(o => o * 0.3)}
        />
      </animated.mesh>

      {/* 内容预览 - 仅在高质量渲染时显示 */}
      {shouldRenderHighQuality && (
        <>
          {/* 文字内容气泡 */}
          {node.type === 'text' && !node.isExpanded && (
            <Text
              position={[0, nodeSize + 0.3, 0]}
              fontSize={0.15}
              color="white"
              anchorX="center"
              anchorY="middle"
              maxWidth={2}
            >
              {node.content.length > 20 ? node.content.substring(0, 20) + '...' : node.content}
            </Text>
          )}

          {/* 语音图标 */}
          {node.type === 'voice' && (
            <mesh position={[0, nodeSize + 0.3, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color="#FFD700" />
            </mesh>
          )}

          {/* 展开状态的内容显示 */}
          {node.isExpanded && (
            <group>
              {/* 背景面板 */}
              <mesh position={[0, 0, -0.1]}>
                <planeGeometry args={[3, 2]} />
                <meshBasicMaterial 
                  color="rgba(0,0,0,0.8)" 
                  transparent 
                  opacity={0.8}
                />
              </mesh>
              
              {/* 完整内容 */}
              <Text
                position={[0, 0.3, 0]}
                fontSize={0.12}
                color="white"
                anchorX="center"
                anchorY="middle"
                maxWidth={2.5}
              >
                {node.content}
              </Text>
              
              {/* 情感标签 */}
              <Text
                position={[0.06, -0.5, 0]}
                fontSize={0.08}
                color={emotionColors[node.emotion][0]}
                anchorX="center"
                anchorY="middle"
              >
                💕 {node.emotion}
              </Text>
            </group>
          )}
        </>
      )}

      {/* 粒子效果 */}
      {shouldRenderHighQuality && node.heat > 0.5 && (
        <ParticleEffect 
          position={node.position} 
          color={emotionColors[node.emotion][0]}
          intensity={node.heat}
        />
      )}
    </animated.group>
  );
};

// 粒子效果组件
const ParticleEffect: React.FC<{ position: THREE.Vector3; color: string; intensity: number }> = ({ 
  position, color, intensity 
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = Math.floor(20 * intensity);
  
  const particles = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particles[i3] = (Math.random() - 0.5) * 0.5;
    particles[i3 + 1] = (Math.random() - 0.5) * 0.5;
    particles[i3 + 2] = (Math.random() - 0.5) * 0.5;
  }

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.01;
      pointsRef.current.rotation.x += 0.005;
    }
  });

  return (
    <points ref={pointsRef} position={position}>
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
        size={0.05}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// 主球体组件
const MainSphere: React.FC<{ nodes: SoulNode[] }> = ({ nodes }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[SPHERE_RADIUS, 64, 64]} />
      <meshStandardMaterial
        color="#1a1a2e"
        transparent
        opacity={0.1}
        wireframe
      />
    </mesh>
  );
};

// 主组件
const SoulSphere3D: React.FC = () => {
  const [soulNodes, setSoulNodes] = useState<SoulNode[]>([]);
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.Camera>();

  // 生成球面节点分布
  const generateSphereNodes = useCallback((): SoulNode[] => {
    const nodes: SoulNode[] = [];
    const totalNodes = 72; // 约每10°4个节点
    
    // 使用黄金角度分布算法确保均匀分布
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    
    for (let i = 0; i < totalNodes; i++) {
      const y = 1 - (i / (totalNodes - 1)) * 2; // -1 to 1
      const radius = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      
      const x = Math.cos(theta) * radius * SPHERE_RADIUS;
      const z = Math.sin(theta) * radius * SPHERE_RADIUS;
      const yPos = y * SPHERE_RADIUS;
      
      const emotions: SoulNode['emotion'][] = ['romantic', 'dreamy', 'mysterious', 'warm'];
      const types: SoulNode['type'][] = ['text', 'voice'];
      
      nodes.push({
        id: `soul-${i}`,
        content: generateRandomContent(),
        emotion: emotions[Math.floor(Math.random() * emotions.length)],
        type: types[Math.floor(Math.random() * types.length)],
        position: new THREE.Vector3(x, yPos, z),
        size: 30 + Math.random() * 30, // 30-60px
        heat: Math.random(),
        timestamp: Date.now() - Math.random() * 86400000,
        isExpanded: false,
        distanceFromCamera: 0
      });
    }
    
    return nodes;
  }, []);

  // 生成随机内容
  const generateRandomContent = (): string => {
    const contents = [
      '今天看到了最美的日落，想分享给你',
      '做了一个关于天空之城的梦',
      '树洞里的秘密',
      '阳光明媚的午后时光',
      '想对你说的话',
      '今天的心情很好',
      '有点想你了',
      '发现了一个美丽的地方'
    ];
    return contents[Math.floor(Math.random() * contents.length)];
  };

  // 节点点击处理
  const handleNodeClick = (node: SoulNode) => {
    if (expandedNode === node.id) {
      setExpandedNode(null);
      setSoulNodes(prev => prev.map(n => 
        n.id === node.id ? { ...n, isExpanded: false } : n
      ));
    } else {
      setExpandedNode(node.id);
      setSoulNodes(prev => prev.map(n => ({
        ...n,
        isExpanded: n.id === node.id
      })));
    }
  };

  // 初始化节点
  useEffect(() => {
    const nodes = generateSphereNodes();
    setSoulNodes(nodes);
  }, [generateSphereNodes]);

  // 相机位置更新
  const handleCameraChange = (camera: THREE.Camera) => {
    cameraRef.current = camera;
    
    // 更新节点与相机的距离
    setSoulNodes(prev => prev.map(node => ({
      ...node,
      distanceFromCamera: node.position.distanceTo(camera.position)
    })));
  };

  return (
    <View style={styles.container}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={styles.canvas}
        onCreated={({ camera }) => handleCameraChange(camera)}
      >
        {/* 环境光 */}
        <ambientLight intensity={0.3} />
        
        {/* 动态光源 */}
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#7DD3C0" />
        
        {/* 主球体 */}
        <MainSphere nodes={soulNodes} />
        
        {/* 灵魂节点 */}
        {soulNodes.map((node) => (
          <SoulNodeComponent
            key={node.id}
            node={node}
            onNodeClick={handleNodeClick}
            cameraPosition={cameraRef.current?.position || new THREE.Vector3(0, 0, 8)}
          />
        ))}
        
        {/* 轨道控制器 */}
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={4}
          maxDistance={12}
          zoomSpeed={0.5}
          rotateSpeed={0.4}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* UI覆盖层 */}
      <View style={styles.uiOverlay}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            灵魂节点: {soulNodes.length} | 展开: {soulNodes.filter(n => n.isExpanded).length}
          </Text>
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
  uiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
    pointerEvents: 'none',
  },
  statsContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 10,
    alignSelf: 'flex-start',
  },
  statsText: {
    color: 'white',
    fontSize: 12,
  },
});

export default SoulSphere3D;
