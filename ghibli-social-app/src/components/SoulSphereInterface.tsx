import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Text, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface SoulContent {
  id: string;
  content: string;
  emotion: 'romantic' | 'mysterious' | 'dreamy' | 'warm' | 'lonely';
  type: 'text' | 'voice';
  author: string;
  position: [number, number, number];
}

const soulContents: SoulContent[] = [
  {
    id: '1',
    content: '今天的天空特别蓝，想起了小时候在龙猫树下玩耍的时光...',
    emotion: 'warm',
    type: 'text',
    author: '梦幻少女',
    position: [2.5, 1.2, 1.8]
  },
  {
    id: '2',
    content: '在这个霓虹闪烁的城市里，我听到了来自未来的呼唤...',
    emotion: 'mysterious',
    type: 'voice',
    author: '赛博旅人',
    position: [-2.1, 2.3, 0.9]
  },
  {
    id: '3',
    content: '樱花飘落的瞬间，时间仿佛静止了，这一刻只属于我们...',
    emotion: 'romantic',
    type: 'text',
    author: '樱花信使',
    position: [1.8, -1.5, 2.2]
  },
  {
    id: '4',
    content: '在梦境与现实的交界处，我找到了属于自己的魔法世界...',
    emotion: 'dreamy',
    type: 'voice',
    author: '梦境编织者',
    position: [-1.2, 0.8, -2.5]
  },
  {
    id: '5',
    content: '一个人的夜晚，星星也在诉说着孤独的故事...',
    emotion: 'lonely',
    type: 'text',
    author: '星空守望者',
    position: [0.5, 2.8, -1.6]
  },
  {
    id: '6',
    content: '风吹过麦田的声音，是大自然最温柔的安慰...',
    emotion: 'warm',
    type: 'voice',
    author: '麦田守望者',
    position: [-2.8, -0.5, 1.2]
  },
  {
    id: '7',
    content: '在月光下许愿，希望能找到属于自己的那颗星...',
    emotion: 'dreamy',
    type: 'text',
    author: '月光信使',
    position: [1.2, 1.9, -2.1]
  },
  {
    id: '8',
    content: '城市的霓虹灯下，藏着无数个孤独的灵魂...',
    emotion: 'lonely',
    type: 'voice',
    author: '夜行者',
    position: [-0.8, -2.2, 2.3]
  }
];

const emotionColors = {
  romantic: '#FF6B9D',
  mysterious: '#9D4EDD',
  dreamy: '#87CEEB',
  warm: '#FFB347',
  lonely: '#708090'
};

function SoulSphere({ onSoulClick }: { onSoulClick: (soul: SoulContent) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Sphere
      ref={meshRef}
      args={[3, 64, 64]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial
        color={hovered ? '#4A90E2' : '#2C3E50'}
        transparent
        opacity={0.8}
        wireframe={false}
      />
    </Sphere>
  );
}

function SoulContent({ soul, onClick }: { soul: SoulContent; onClick: (soul: SoulContent) => void }) {
  const textRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.lookAt(state.camera.position);
      textRef.current.scale.setScalar(hovered ? 1.2 : 1);
    }
  });

  return (
    <group position={soul.position}>
      <mesh
        ref={textRef}
        onClick={() => onClick(soul)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={emotionColors[soul.emotion]}
          transparent
          opacity={hovered ? 0.9 : 0.7}
          emissive={emotionColors[soul.emotion]}
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </mesh>
      
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {soul.content.length > 20 ? soul.content.substring(0, 20) + '...' : soul.content}
      </Text>
      
      <Text
        position={[0.06, -0.3, 0]}
        fontSize={0.08}
        color="#CCCCCC"
        anchorX="center"
        anchorY="middle"
      >
        {soul.author} • {soul.type === 'voice' ? '🎤' : '📝'}
      </Text>
    </group>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 200;
  
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    
    colors[i * 3] = Math.random();
    colors[i * 3 + 1] = Math.random();
    colors[i * 3 + 2] = Math.random();
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
      particlesRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function Scene({ onSoulClick }: { onSoulClick: (soul: SoulContent) => void }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#9D4EDD" />
      
      <FloatingParticles />
      <SoulSphere onSoulClick={onSoulClick} />
      
      {soulContents.map((soul) => (
        <SoulContent
          key={soul.id}
          soul={soul}
          onClick={onSoulClick}
        />
      ))}
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={15}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
      
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
    </>
  );
}

interface SoulPickupAnimationProps {
  selectedSoul: SoulContent | null;
  onClose: () => void;
}

function SoulPickupAnimation({ selectedSoul, onClose }: SoulPickupAnimationProps) {
  if (!selectedSoul) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="relative">
        <div 
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: `radial-gradient(circle, ${emotionColors[selectedSoul.emotion]}40, transparent)`,
            animationDuration: '2s'
          }}
        />
        
        <div 
          className="relative bg-gradient-to-br from-purple-900 to-blue-900 p-8 rounded-2xl border border-purple-400 shadow-2xl max-w-md mx-4"
          style={{
            boxShadow: `0 0 50px ${emotionColors[selectedSoul.emotion]}40`
          }}
        >
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">
              {selectedSoul.type === 'voice' ? '🎤' : '💫'}
            </div>
            
            <div 
              className="text-white text-lg mb-4 leading-relaxed"
              style={{
                background: `linear-gradient(45deg, ${emotionColors[selectedSoul.emotion]}, white)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {selectedSoul.content}
            </div>
            
            <div className="text-purple-300 text-sm mb-6">
              — {selectedSoul.author}
            </div>
            
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              释放灵魂 ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SoulSphereInterface() {
  const [selectedSoul, setSelectedSoul] = useState<SoulContent | null>(null);

  const handleSoulClick = (soul: SoulContent) => {
    setSelectedSoul(soul);
  };

  const handleCloseAnimation = () => {
    setSelectedSoul(null);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <Scene onSoulClick={handleSoulClick} />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-between">
          <button className="px-4 py-2 rounded-full bg-white bg-opacity-10 border border-white border-opacity-20 text-white text-sm">觅见</button>
          <div style={{ width: 60 }} />
          <button className="px-4 py-2 rounded-full bg-white bg-opacity-10 border border-white border-opacity-20 text-white text-sm">筛选</button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
        <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-2xl p-4 border border-purple-400 border-opacity-30">
          <div className="flex justify-around items-center">
            <button className="flex flex-col items-center space-y-1 text-purple-200 hover:text-white transition-colors">
              <span className="text-2xl">🌳</span>
              <span className="text-xs">tree hole</span>
            </button>
            
            <button className="flex flex-col items-center space-y-1 text-purple-200 hover:text-white transition-colors">
              <span className="text-2xl">🌲</span>
              <span className="text-xs">森林</span>
            </button>
            
            <button className="flex flex-col items-center space-y-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-3 shadow-lg">
              <span className="text-2xl text-white">灵魂</span>
            </button>
            
            
            
            <button className="flex flex-col items-center space-y-1 text-purple-200 hover:text-white transition-colors">
              <span className="text-2xl">👤</span>
              <span className="text-xs">future self</span>
            </button>
          </div>
        </div>
      </div>

      {/* 灵魂拾取动画 */}
      <SoulPickupAnimation
        selectedSoul={selectedSoul}
        onClose={handleCloseAnimation}
      />
    </div>
  );
}
