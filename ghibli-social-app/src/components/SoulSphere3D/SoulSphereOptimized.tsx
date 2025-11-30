import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, PanResponder, Dimensions, Platform } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, animated, config } from '@react-spring/three';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 性能监控hook
const usePerformanceMonitor = () => {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const [fps, setFps] = useState(60);

  useFrame(() => {
    frameCount.current++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime.current >= 1000) {
      setFps(Math.round((frameCount.current * 1000) / (currentTime - lastTime.current)));
      frameCount.current = 0;
      lastTime.current = currentTime;
    }
  });

  return fps;
};

// 对象池管理器
class ObjectPool {
  private pool: Map<string, any[]> = new Map();
  private maxSize: number;

  constructor(maxSize = 50) {
    this.maxSize = maxSize;
  }

  acquire(type: string) {
    const pool = this.pool.get(type) || [];
    if (pool.length > 0) {
      return pool.pop();
    }
    return null;
  }

  release(type: string, obj: any) {
    const pool = this.pool.get(type) || [];
    if (pool.length < this.maxSize) {
      pool.push(obj);
      this.pool.set(type, pool);
    }
  }

  getStats() {
    const stats: Record<string, number> = {};
    this.pool.forEach((pool, type) => {
      stats[type] = pool.length;
    });
    return stats;
  }
}

// 分块加载管理器
class ChunkedLoader {
  private chunks: Map<string, boolean> = new Map();
  private chunkSize = 30; // 30°球面作为一个加载单元
  private loadingQueue: string[] = [];
  private isLoading = false;

  getChunkKey(phi: number, theta: number): string {
    const phiChunk = Math.floor(phi / this.chunkSize);
    const thetaChunk = Math.floor(theta / this.chunkSize);
    return `${phiChunk}-${thetaChunk}`;
  }

  shouldLoad(phi: number, theta: number): boolean {
    const key = this.getChunkKey(phi, theta);
    return !this.chunks.has(key);
  }

  markLoaded(phi: number, theta: number) {
    const key = this.getChunkKey(phi, theta);
    this.chunks.set(key, true);
  }

  async loadChunk(phi: number, theta: number, callback: () => Promise<void>) {
    const key = this.getChunkKey(phi, theta);
    if (this.chunks.has(key) || this.loadingQueue.includes(key)) {
      return;
    }

    this.loadingQueue.push(key);
    
    if (!this.isLoading) {
      this.processQueue(callback);
    }
  }

  private async processQueue(callback: () => Promise<void>) {
    this.isLoading = true;
    
    while (this.loadingQueue.length > 0) {
      const key = this.loadingQueue.shift()!;
      try {
        await callback();
        this.chunks.set(key, true);
      } catch (error) {
        console.warn(`Failed to load chunk ${key}:`, error);
      }
      
      // 控制加载速度，避免阻塞
      await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps
    }
    
    this.isLoading = false;
  }

  getStats() {
    return {
      loadedChunks: this.chunks.size,
      queueLength: this.loadingQueue.length,
      isLoading: this.isLoading
    };
  }
}

// 优化的节点组件
const OptimizedSoulNode: React.FC<{ 
  node: any; 
  onNodeClick: (node: any) => void;
  cameraPosition: THREE.Vector3;
  objectPool: ObjectPool;
}> = ({ node, onNodeClick, cameraPosition, objectPool }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  // 性能优化：距离和角度计算
  const distance = node.position.distanceTo(cameraPosition);
  const angle = node.position.angleTo(cameraPosition) * (180 / Math.PI);
  
  // LOD优化：超过70°或距离过远时隐藏
  const shouldRender = angle < 70 && distance < 15;
  const shouldRenderHighQuality = angle < 45 && distance < 8;
  
  // 弹簧动画优化
  const { scale, opacity, position } = useSpring({
    scale: node.isExpanded ? 1.5 : hovered ? 1.2 : 1,
    opacity: shouldRender ? (shouldRenderHighQuality ? 1 : 0.6) : 0,
    position: node.position.toArray(),
    config: { tension: 300, friction: 20, clamp: true }
  });

  // 可见性控制
  useEffect(() => {
    setIsVisible(shouldRender);
  }, [shouldRender]);

  if (!isVisible) return null;

  const nodeSize = (node.size / 100) * (0.8 + node.heat * 0.4);
  const color = node.emotion === 'romantic' ? '#FC466B' : 
                node.emotion === 'dreamy' ? '#A8E6CF' :
                node.emotion === 'mysterious' ? '#667eea' : '#f093fb';

  return (
    <animated.group 
      position={position}
      scale={scale}
    >
      {/* 主节点球体 - 使用低面数几何体优化性能 */}
      <animated.mesh
        ref={meshRef}
        onClick={() => onNodeClick(node)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[nodeSize, 8, 8]} />
        <animated.meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.1}
          transparent
          opacity={opacity}
        />
      </animated.mesh>

      {/* 高质量渲染时才显示额外效果 */}
      {shouldRenderHighQuality && (
        <>
          {/* 光晕效果 */}
          <animated.mesh scale={1.3}>
            <sphereGeometry args={[nodeSize * 1.1, 6, 6]} />
            <animated.meshBasicMaterial
              color={color}
              transparent
              opacity={opacity.to(o => o * 0.2)}
            />
          </animated.mesh>

          {/* 内容预览 */}
          {node.type === 'text' && !node.isExpanded && (
            <Text
              position={[0, nodeSize + 0.2, 0]}
              fontSize={0.1}
              color="white"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.5}
            >
              {node.content.length > 15 ? node.content.substring(0, 15) + '...' : node.content}
            </Text>
          )}

          {/* 展开状态 */}
          {node.isExpanded && (
            <group>
              <mesh position={[0, 0, -0.05]}>
                <planeGeometry args={[2, 1.5]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.8} />
              </mesh>
              <Text
                position={[0, 0.2, 0]}
                fontSize={0.08}
                color="white"
                anchorX="center"
                anchorY="middle"
                maxWidth={1.8}
              >
                {node.content}
              </Text>
            </group>
          )}
        </>
      )}
    </animated.group>
  );
};

// 主性能优化组件
const SoulSphereOptimized: React.FC = () => {
  const [soulNodes, setSoulNodes] = useState<any[]>([]);
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [performance, setPerformance] = useState({ fps: 60, nodeCount: 0 });
  const cameraRef = useRef<THREE.Camera>();
  const objectPoolRef = useRef(new ObjectPool(50));
  const chunkedLoaderRef = useRef(new ChunkedLoader());
  
  const fps = usePerformanceMonitor();

  // 智能节点生成 - 基于相机位置动态生成
  const generateSmartNodes = useCallback((cameraPosition: THREE.Vector3) => {
    const nodes: any[] = [];
    const visibleRange = 60; // 相机前方60°范围
    const maxNodes = 25; // 同时存在的最大节点数
    
    // 基于相机方向生成节点
    const cameraDirection = new THREE.Vector3(0, 0, -1);
    cameraDirection.applyQuaternion(cameraRef.current?.quaternion || new THREE.Quaternion());
    
    for (let i = 0; i < maxNodes; i++) {
      // 在相机前方半球随机分布
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI * 0.5; // 上半球
      
      // 检查是否应该加载这个区块
      if (!chunkedLoaderRef.current.shouldLoad(phi * 180 / Math.PI, theta * 180 / Math.PI)) {
        continue;
      }
      
      const radius = 3 + Math.random() * 2;
      const x = Math.sin(theta) * Math.cos(phi) * radius;
      const y = Math.cos(theta) * radius;
      const z = Math.sin(theta) * Math.sin(phi) * radius;
      
      const position = new THREE.Vector3(x, y, z);
      const toCamera = position.clone().sub(cameraPosition).normalize();
      
      // 只生成相机前方的节点
      if (toCamera.dot(cameraDirection) > 0.3) {
        const emotions = ['romantic', 'dreamy', 'mysterious', 'warm'];
        const types = ['text', 'voice'];
        
        nodes.push({
          id: `soul-${Date.now()}-${i}`,
          content: generateContent(),
          emotion: emotions[Math.floor(Math.random() * emotions.length)],
          type: types[Math.floor(Math.random() * types.length)],
          position: position,
          size: 30 + Math.random() * 30,
          heat: Math.random(),
          isExpanded: false,
          timestamp: Date.now()
        });
      }
    }
    
    return nodes;
  }, []);

  // 内容生成函数
  const generateContent = () => {
    const contents = [
      '今天心情很好呢', '想分享给你', '树洞里的秘密', '最美的日落',
      '天空之城的梦', '阳光明媚', '想对你说', '美丽的地方',
      '心情记录', '小确幸', '温暖时光', '浪漫时刻'
    ];
    return contents[Math.floor(Math.random() * contents.length)];
  };

  // 节点点击处理 - 带性能优化
  const handleNodeClick = useCallback((node: any) => {
    if (expandedNode === node.id) {
      setExpandedNode(null);
      setSoulNodes(prev => prev.map(n => 
        n.id === node.id ? { ...n, isExpanded: false } : n
      ));
    } else {
      // 先关闭其他展开的节点
      setSoulNodes(prev => prev.map(n => ({ ...n, isExpanded: false })));
      
      setTimeout(() => {
        setExpandedNode(node.id);
        setSoulNodes(prev => prev.map(n => 
          n.id === node.id ? { ...n, isExpanded: true } : n
        ));
      }, 50); // 小延迟确保动画流畅
    }
  }, [expandedNode]);

  // 相机位置变化处理
  const handleCameraChange = useCallback((camera: THREE.Camera) => {
    cameraRef.current = camera;
    
    // 基于相机位置动态生成节点
    const newNodes = generateSmartNodes(camera.position);
    setSoulNodes(newNodes);
    
    // 更新性能统计
    setPerformance(prev => ({
      ...prev,
      nodeCount: newNodes.length,
      fps: fps
    }));
  }, [generateSmartNodes, fps]);

  // 清理函数
  useEffect(() => {
    return () => {
      objectPoolRef.current.getStats();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={styles.canvas}
        onCreated={({ camera }) => handleCameraChange(camera)}
        gl={{ antialias: false, alpha: false }} // 性能优化
        dpr={[1, 1.5]} // 设备像素比限制
      >
        {/* 优化光照 */}
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.6} />
        
        {/* 优化的灵魂节点 */}
        {soulNodes.map((node) => (
          <OptimizedSoulNode
            key={node.id}
            node={node}
            onNodeClick={handleNodeClick}
            cameraPosition={cameraRef.current?.position || new THREE.Vector3(0, 0, 8)}
            objectPool={objectPoolRef.current}
          />
        ))}
        
        {/* 优化的轨道控制器 */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={15}
          zoomSpeed={0.3}
          rotateSpeed={0.2}
          autoRotate={true}
          autoRotateSpeed={0.1}
        />
      </Canvas>
      
      {/* 性能监控UI */}
      <View style={styles.performanceOverlay}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>FPS: {fps}</Text>
          <Text style={styles.statsText}>节点: {performance.nodeCount}</Text>
          <Text style={styles.statsText}>展开: {soulNodes.filter(n => n.isExpanded).length}</Text>
        </View>
        
        <View style={styles.objectPoolStats}>
          <Text style={styles.statsText}>对象池: {JSON.stringify(objectPoolRef.current.getStats())}</Text>
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
  performanceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  statsContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  objectPoolStats: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 8,
    alignSelf: 'flex-start',
  },
  statsText: {
    color: '#7DD3C0',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default SoulSphereOptimized;